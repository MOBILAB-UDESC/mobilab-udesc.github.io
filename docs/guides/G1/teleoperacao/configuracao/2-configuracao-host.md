---
title: Configuração do HOST
---

Primeiramente coloque o G1 no **Debug Mode**:

1. Com o G1 suspenso e em estado de damping (`L2 + B`)
2. Pressione e segure a combinação `L2 + R2` no controle remoto por um longo período. O G1 entrará em modo debug.
2. Pressione `L2 + A` para entrar em modo de posição (position mode) e assumirá uma posição específica de diagnóstico.
3. Pressione `L2 + B` para retornar ao estado de damping.

## Conectando o Quest ao Host


<img src="/img/guides/teleoperacao/g1-pc-quest.png" alt="Conexões cabeadas G1, Host e Quest." width="1500" />


### Instalar `adb` no host

```sh
sudo apt-get install adb
```

Liste os dispositivos:

```text
sudo adb devices

# (Sairá algo semelhante):
# List of devices attached
# 2G0YC5ZG6P005M  unauthorized
```

1. Coloque o Quest 3 enquanto ele está conectado via USB.
2. Procure pelo alerta: _Allow USB debugging_?
3. Selecione _Always allow from this computer_ se disponível.
<img src="/img/guides/teleoperacao/AllowUSBDebugging.png" alt="Conexões cabeadas G1, Host e Quest." width="1500" />

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

## Configuração do Host

Siga as instruções do repositório [xr_teleoperate](https://github.com/unitreerobotics/xr_teleoperate#1--installation). Siga as instruções de instalação. Embora estejamos usando `uv`, para o XR teleoperate siga as recomendações do conda:

### Baixando mini conda

```sh
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc
conda --version
```

### Criando um enviroment

```sh
conda create -n g1 python=3.10 pinocchio=3.1.0 numpy=1.26.4 -c conda-forge
conda activate g1
```
Todos os próximos comandos devem ser executados dentro do enviroment g1

### pips install
siga a ordem de execução de todos os pip e git clone, eles foram testados na ordem apresentado nesta documentação:

```sh
# 1. conda
pyenv shell system
conda install -c conda-forge pinocchio -y

# 2. pips
pip install pyngrok==8.1.2
pip install dotvar==0.1.12
pip install waterbear==2.6.8
pip install u-msgpack-python==2.8.0
pip install sshkeyboard==2.3.1
pip install typeguard==4.5.2
pip install casadi
pip install logging_mp
```

### Clonando o repositório de teleoperação e o sdk

```sh
mkdir Teleoperacao
cd Teleoperacao

# Sdk
git clone https://github.com/unitreerobotics/unitree_sdk2_python.git
cd unitree_sdk2_python
pip install -e .
# xr-teleoperate
cd ..
git clone https://github.com/unitreerobotics/xr_teleoperate.git
cd xr_teleoperate
git submodule update --init --depth 1
# teleimager e televuer
cd teleop/teleimager
pip install -e .
cd ..
cd televuer
pip install -e .
```

### Correção de bibliotecas sobrescritas

```sh
# ordem importa
pip install meshcat
pip install matplotlib
pip install 'rerun-sdk==0.34.1'
pip install 'numpy<2'
pip install 'params_proto==2.13.2'
```

### Configurando os certificados SSL

Permaneça na pasta do televuer e execute os comandos:

```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

Desabilite o firewall:

```sh
sudo ufw allow 8012
```

Configurando o caminho dos certificados:

```sh
echo 'export XR_TELEOP_CERT="$HOME/Desktop/Teleoperacao/xr_teleoperate/teleop/televuer/cert.pem"' >> ~/.bashrc
echo 'export XR_TELEOP_KEY="$HOME/Desktop/Teleoperacao/xr_teleoperate/teleop/televuer/key.pem"' >> ~/.bashrc
source ~/.bashrc
```

Adicione ao arquivo `~/Desktop/Teleoperacao/unitree_sdk2_python/core/channel_config.py`:

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

Esta configuração é necessária porque o PC tem múltiplas interfaces de rede na mesma sub-rede:

- `enp194s0 = 192.168.123.2`
- `wlp195s0 = 192.168.123.106`

Sem a configuração explícita do DDS, a descoberta pode escolher a interface errada ou rotear inconsistentemente.

### Referências

- https://support.unitree.com/home/en/G1_developer
- https://github.com/unitreerobotics/xr_teleoperate/wiki/Camera_and_Image

