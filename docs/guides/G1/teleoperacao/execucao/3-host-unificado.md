---
title: Host unificado + Mãos
---

Esta seção resume os passos e verificações necessários para rodar a teleoperação, assumindo que a instalação, configuração e [**checklist**](/guides/G1/teleoperacao/configuracao/checklist) já foram feitas.

É recomendado fazer primeiramente a teleoperação com o [Quest via wifi](/guides/G1/teleoperacao/execucao/via-wifi) e é estritamente necessário a execução da [configuração do PC2](/guides/G1/teleoperacao/configuracao/configuracao-pc2)

Seu setup final ficará como na imagem abaixo, com o roteador podendo estar acoplado nas costas do robô, sendo alimentado pela bateria do próprio G1 e com a teleoperação funcionando sem internet.

<img src="/img/guides/teleoperacao/g1host-roteador-quest.jpg" alt="Teleoperação sem internet e com host no g1." width="1500" />

## Configurando a Internet no G1
Siga os passos para conectar a [uma rede sem internet](/guides/G1/configuracao-inicial/ativando-wifi), e ainda com o SSH via cabo de Ethernet descubra o ip para prosseguir via wireless.

```sh
ip -br a
# wlan0            UP             192.168.0.111/24 fe80::3495:6cdf:f77:4dcf/64
```
Acesse o G1 com esse ip (inicialmente o seu notebook deve estar na mesma rede)
```sh
ssh unitree@192.168.0.111
```

Estando dentro do G1, rode o script de inicialização da câmera criado durante a [Configuração do PC2](/guides/G1/teleoperacao/configuracao/configuracao-pc2)

```sh
cd unitree/teleimager
./run_realsense_server.sh
```

## Baixando dependências antes da configuração
Antes de transformar nosso unitree no próprio Host, devemos baixar algumas dependencias
que não vem por padrão no Linux do g1:

### Cyclone DDS
Instale as ferramentas de compilação essenciais:
```sh
sudo apt update
sudo apt install -y cmake build-essential git bison flex
```

Clone o repositório
```sh
cd ~
git clone https://github.com/eclipse-cyclonedds/cyclonedds.git -b releases/0.10.x
```

Compile forçando a construção do IDL (que faz a ponte com o Python):
```sh
cd cyclonedds
mkdir build && cd build
cmake -DBUILD_IDLC=ON ..
make -j4
sudo make install
sudo ldconfig
```

## Permitindo o Quest
Para podermos acessar o G1 de forma direta com o Quest é necessário uma autorização. Primeiramente o Quest deve estar conectado ao G1, seguindo o formato da imagem abaixo:

<img src="/img/guides/teleoperacao/g1-hub-quest.jpg" alt="Meta Quest conectado em um hub usb conectado no G1." width="1500" />

Ainda dentro do G1, rode:
```sh
sudo apt-get install adb
sudo adb devices
# (Sairá algo semelhante):
# List of devices attached
# 2G0YC5ZG6P005M  unauthorized
```

1. Coloque o Quest 3 enquanto ele está conectado via USB.
2. Procure pelo alerta: _Allow USB debugging_?
3. Selecione _Always allow from this computer_ se disponível.
<img src="/img/guides/teleoperacao/AllowUSBDebugging.png" alt="Meta Quest conectado em um hub usb conectado no G1." width="1500" />

Execute `sudo adb devices` novamente.

Saída esperada:

```text
2G0YC5ZG6P005M    device
```

Inicie o redirecionamento de porta:

```sh
sudo adb -s 2G0YC5ZG6P005M reverse tcp:8012 tcp:8012
```

Verifique o resultado:

```sh
sudo adb -s 2G0YC5ZG6P005M reverse --list
```

Saída esperada:

```text
UsbFfs tcp:8012 tcp:8012
```

## Configurando o HOST interno do G1
O seu G1 já deve possuir o miniconda, pois é esperado que tenha seguido o tutorial de como [configurar o PC2](/guides/G1/teleoperacao/configuracao/configuracao-pc2). Ainda dentro do G1, vamos criar um enviroment:

### Enviroment
```sh
conda create -n g1 python=3.10 pip pinocchio=3.1.0 numpy=1.26.4 nlopt=2.7.1 -c conda-forge -y
conda activate g1
```
> Todos os próximos comandos devem ser executados dentro do enviroment g1

### Pip install
Siga a ordem de execução de todos os pip e git clone, eles foram testados na ordem apresentado nesta documentação:


Instalando pips gerais
```sh
python -m pip install
 pyngrok==8.1.2
 dotvar==0.1.12
 waterbear==2.6.8
 u-msgpack-python==2.8.0
 sshkeyboard==2.3.1
 typeguard==4.5.2
 casadi
 logging_mp
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```
Clonando e compilando repositórios da unitree
```sh
# Pasta Mãe
mkdir -p ~/Teleoperacao
cd ~/Teleoperacao

# SDK
git clone https://github.com/unitreerobotics/unitree_sdk2_python.git
cd unitree_sdk2_python
CYCLONEDDS_HOME=/usr/local python -m pip install -e .

# XR-Teleoperate e Submódulos
cd ~/Teleoperacao
git clone https://github.com/unitreerobotics/xr_teleoperate.git
cd xr_teleoperate
git submodule update --init --depth 1

# Vuer e Teleimager (Câmera e Servidor)
cd teleop/teleimager
python -m pip install -e .
cd ../televuer
python -m pip install -e .
```
Compilando o módulo das mãos (DEX3)
```sh
cd ~/Teleoperacao/xr_teleoperate/teleop/robot_control/dex-retargeting
sed -i '/nlopt/d' pyproject.toml
python -m pip install -e .
```
Limpando e arrumando versionamento de bibliotecas
```sh
cd ~/Teleoperacao/xr_teleoperate/teleop
python -m pip install meshcat matplotlib 'rerun-sdk==0.34.1' 'params_proto==2.13.2'
python -m pip uninstall pin -y
python -m pip install 'numpy<2'
```

## Configurando os certificados SSL e o canal
Vá para a pasta do televuer e execute o comando para baixar os certificados:
```sh
cd ~/Teleoperacao/xr_teleoperate/teleop/televuer
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```
Desabilite o firewall
```sh
sudo ufw allow 8012
```
Configurando o camiho dos certificados
```sh
echo 'export XR_TELEOP_CERT="$HOME/Teleoperacao/xr_teleoperate/teleop/televuer/cert.pem"' >> ~/.bashrc
echo 'export XR_TELEOP_KEY="$HOME/Teleoperacao/xr_teleoperate/teleop/televuer/key.pem"' >> ~/.bashrc
source ~/.bashrc
```
Adicione ao arquivo `~/Teleoperacao/unitree_sdk2_python/unitree_sdk2py/core/channel_config.py`:

```python
ChannelConfigAutoDetermine = '''<?xml version="1.0"?>
<CycloneDDS>
  <Domain Id="any">
    <General>
      <Interfaces>
        <NetworkInterface autodetermine="true"/>
      </Interfaces>
      <AllowMulticast>spdp</AllowMulticast>
      <DontRoute>true</DontRoute>
    </General>
    <Discovery>
      <Peers>
        <Peer Address="192.168.123.161"/>
        <Peer Address="192.168.123.164"/>
      </Peers>
    </Discovery>
  </Domain>
</CycloneDDS>'''
```

## Inicialização
Abra dois terminais, e acesse via ssh o g1 em ambos:
```sh
ssh unitree@192.168.0.111
```
### Acesso a câmera
No primeiro terminal rode
```sh
conda activate teleimager
```
vá para onde o arquivo `run_relsense_server.sh` estiver baixado e o rode, caso tenha acabado de ligar o G1 aguarde alguns segundos.
```sh
cd unitree/teleimager
./run_realsense_server.sh
# normalmente ele da um erro na primeira vez, ignore e rode uma segunda vez
```

Verá isso ser printado no terminal:

```bash
20:46:06:441366 INFO     UVC driver reloaded successfully.                       image_server.py:535
20:46:06:450794 INFO     [Responser] Camera Config Responser initialized at      image_client.py:460
                         0.0.0.0:60000
20:46:07:013611 INFO     [OpenCVCamera: head_camera] initialized with 480x640 @ image_server.py:1081
                         30 FPS.
                         ZMQ: enabled, zmq port=55555; WebRTC: enabled, webrtc
                         port=60001
20:46:07:013914 INFO     [Image Server] Image server has started, waiting for   image_server.py:1243
                         client connections...
20:46:07:044281 INFO     [Image Server] head_camera is ready.                   image_server.py:1359
20:46:07:046273 INFO     [Image Server] Running... Press Ctrl+C to exit.        image_server.py:1434
```

### Teleoperação
No primeiro terminal rode
```sh
conda activate g1
cd Teleoperacao/xr_teleoperate/teleop/
```

Agora no pc Host é necessário rodar o script de teleoperação que foi instalado durante a [Configuração do Host](/guides/G1/teleoperacao/configuracao/configuracao-host)

```sh
conda activate g1
cd ~/Desktop/Teleoperacao/xr_teleoperate/teleop
python
```

> Esses são os parâmetros principais e mais utilizados, caso necessite, consulte a [documentação oficial](https://github.com/unitreerobotics/xr_teleoperate)


| Parâmetro | Descrição | Opções | Default |
|:---------:|:---------:|:------:|:-------:|
| --input-mode | Escolhe qual a forma de controlar o robô | `hand` `controller` | `hand` |
| --display-mode | Escolhe como ver a perspectiva do robô | `immersive`, `ego`, `pass-through` | `immersive` |
| --img-server-ip | O endereço IP de quem receberá a stream e as configurações WebRTC | `Qualquer IPv4` | `192.168.123.164` |
| --ee | Selecionar o end-effector (mãos) | `dex1` `dex3` `inspire_ftp` `inspire_dfx` `brainco` | None |
| --motion | Habilita o controle das pernas | | |


**Atenção:**  Para utilizar o modo motion o G1 deve estar em `Regular mode` (L2+B -> L2+UP -> R1+X), sem o --motion ele pode estar em `Debug mode`

```sh
python teleop_hand_and_arm.py --display-mode ego --img-server-ip <IP_DO_WLAN_DO_ROBO> --ee dex3
```

Verá isso ser printado no terminal:

```bash
21:33:23.762634 INFO     Received camera config from server 192.168.0.111:60000  image_client.py:706
21:33:23.769093 INFO     Saved camera config to local                            image_client.py:709
                         /home/unitree/Teleoperacao/xr_teleoperate/teleop/teleim
                         ager/cam_config_client.yaml
Serving file:///home/unitree/Teleoperacao/xr_teleoperate/teleop at /static
Visit: https://vuer.ai?grid=False
21:33:24.579092 INFO     Enter debug mode: Success                        teleop_hand_and_arm.py:148
21:33:24.580843 INFO     [G1_29_ArmIK] >>> Loading URDF (slow)...                 robot_arm_ik.py:40
21:33:30.426324 INFO     >>> Cache saved to g1_29_model_cache.pkl                 robot_arm_ik.py:99
21:33:30.447100 INFO     Initialize G1_29_ArmController...                           robot_arm.py:81
21:33:30.672820 WARNING  [G1_29_ArmController] Waiting to subscribe dds...            dds_utils.py:9
21:33:30.773668 INFO     [G1_29_ArmController] Subscribe dds ok.                     dds_utils.py:17
21:33:30.776191 INFO     Lock all joints except two arms...                         robot_arm.py:124
21:33:30.778769 INFO     Lock OK!                                                   robot_arm.py:144
21:33:30.780082 INFO     Initialize G1_29_ArmController OK!                         robot_arm.py:152
21:33:37.736203 INFO     Initialize Dex3_1_Controller...                    robot_hand_unitree.py:56
 Target link human indices is provided in the DexPilot retargeting config, which is uncommon.
If you do not know exactly how it is used, please leave it to None for default.

 Target link human indices is provided in the DexPilot retargeting config, which is uncommon.
If you do not know exactly how it is used, please leave it to None for default.

21:33:38.299286 WARNING  [Dex3_1_Controller] Waiting to subscribe dds...    robot_hand_unitree.py:90
21:33:38.300379 INFO     [Dex3_1_Controller] Subscribe dds ok.              robot_hand_unitree.py:91
21:33:38.325165 INFO     Initialize Dex3_1_Controller OK!                   robot_hand_unitree.py:98
21:33:38.327499 INFO     ------------------------------------------------ teleop_hand_and_arm.py:264
                         ----------------
21:33:38.331000 INFO     🟢  Press [r] to start syncing the robot with    teleop_hand_and_arm.py:265
                         your movements.
21:33:38.332212 INFO     🔵  Recording is DISABLED (run with --record to  teleop_hand_and_arm.py:269
                         enable).
21:33:38.332760 INFO     🔴  Press [q] to stop and exit the program.      teleop_hand_and_arm.py:270
21:33:38.332881 INFO     ⚠️  IMPORTANT: Please keep your distance and     teleop_hand_and_arm.py:271
                         stay safe.
```
É muito comum haver erros neste terminal que no final envolvem os certificaods `key.pem` e `cert.pem`. Caso ocorra algum erro ou o robô não responda aos movimentos do seu braço é recomenda verificar se o caminha posto no bash esta correto para os certificados: `gedit ~/.bashrc`

Antes de pressionar a tecla 'r', é necessário que aparecça o seguinte texto no terminal:
```bash
websocket is connected. id:96ea0e51-a8e0-43ee-afa4-407b69b57fca
default socket worker is up, adding clientEvents
Uplink task running. id:96ea0e51-a8e0-43ee-afa4-407b69b57fca
```
É a confirmação de que o Meta Quest está operando, para conseguir ela siga os próximos passos:

## Meta Quest
Equanto os dois scripts anteriores estão rodando, iremos configurar o Meta Quest 3

Acesse o browser padrão do quest:

<img src="/img/guides/teleoperacao/bowser-quest.png" alt="Acesse a o browser padrão do meta quest." width="1500" />

Acesse via `<IP_DO_WLAN_DO_ROBO>:8012`, o outro formato de acesso (via vuer) apenas irá funcionar se o roteador estiver com internet.
> **Atenção:** Se for a primeira vez acessando o site pode mostrar que ele não é seguro, avance mesmo assim.

<div align="center">
<video width="860" controls>
    <source src="/vid/g1/localhost.mp4" type="video/mp4"/>
</video>
</div>
> ignore o localhost, no local dele haverá o ip wlan0 do robô.

## Teleoperação completa
Com todas as configurações anteriores feitas, siga a seguinte ordem para executar uma teleoperação bem sucedida, de forma totalmente análoga a teleoperação com o [Quest via wifi](/guides/G1/teleoperacao/execucao/via-wifi):

1. Rode o script do PC2
2. Abra o `<IP_DO_WLAN_DO_ROBO>:8012` no Quest
3. Rode o script no Host
4. Recarregue a página do localhost no Quest
5. `websocket is connected` deve aparecer no terminal do Host
6. Clique Pass-Through
7. Pressione 'r' no Host

<div align="center">
<video width="860" controls>
    <source src="/vid/g1/teleoperacao-completa.mp4" type="video/mp4"/>
</video>
</div>
> Pressionar a tecla 'q' no **Host** encerra a teleoperação.
