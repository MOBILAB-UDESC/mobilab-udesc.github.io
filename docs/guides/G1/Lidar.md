# Lidar Livox MID-360 do Unitree G1 com ROS2 Jazzy

Guia para ler a nuvem de pontos do lidar do Unitree G1 (EDU) em um PC externo, usando o driver `livox_ros_driver2` e o RViz2.

**Ambiente testado:** Ubuntu 24.04, ROS2 Jazzy, PC conectado ao G1 por cabo Ethernet.

## 1. Visão geral

O lidar do G1 é um Livox MID-360, um dispositivo de rede separado que envia a nuvem de pontos por UDP. Ler esses dados não exige o modo desenvolvedor do robô nem o SDK de controle (`unitree_sdk2`). O driver roda no PC, que precisa estar na mesma sub-rede do robô (`192.168.123.x`).

O lidar envia dados para um único IP de destino (o `host_ip` configurado). Se o software do robô também consome o stream, pode haver conflito. Isso não foi verificado neste guia.

O driver `livox_ros_driver2` faz a mediação entre o livox (LIDAR do G1) e o ROS2, convertendo as coordenadas e intensidade das nuvens de pontos para publicações ROS. Recebe pacotes UDP do sensor por meio do Livox-SDK2, converte os dados dos pontos e do IMU (Inertial Measurement Unit) para mensagens ROS2 e as publica nos tópicos `/livox/lidar` e `/livox/imu` no referencial `livox_frame`.

## 2. Valores usados neste setup

| Item | Valor |
| --- | --- |
| IP do PC (host) | `192.168.123.148` (qualquer IP livre na sub-rede serve, desde que seja o mesmo no arquivo de configuração) |
| Máscara | `/24` (`255.255.255.0`) |
| IP do lidar | `192.168.123.120` |
| Interface Ethernet | `enp2s0` (Descubra a sua com `ip -br a`) |
| Launch file | `rviz_MID360_launch.py` |

## 3. Preparar o terminal (evitar conflito com o conda)

O Python do conda/miniforge não tem os módulos do ROS2 (por exemplo `catkin_pkg`) e faz o build falhar. Use um terminal sem conda.

```bash
conda deactivate                          # repita até sumir o (base)
which python3                             # deve mostrar /usr/bin/python3
conda config --set auto_activate_base false   # opcional: evita que volte a acontecer
```

## 4. Instalar dependências

```bash
sudo apt update
sudo apt install -y build-essential cmake git libapr1-dev \
  python3-colcon-common-extensions ros-jazzy-pcl-conversions ros-jazzy-rviz2
source /opt/ros/jazzy/setup.bash
```

O `ros-jazzy-rviz2` instala o RViz2, ferramenta de visualização 3D do ROS2. Ele exibe os dados publicados em tópicos (aqui, a nuvem de pontos do MID-360), mas não é um simulador como o Gazebo e não simula física.

O `ros-jazzy-pcl-conversions` é uma dependência de compilação do driver. Ele converte entre os tipos da Point Cloud Library (PCL) e a mensagem `sensor_msgs/PointCloud2` do ROS2.

Cada ponto da nuvem tem coordenadas X, Y, Z e uma intensidade, que indica a refletividade da superfície medida (quanto da energia do feixe inicial efetivamente volta à origem).

## 5. Compilar e instalar o Livox-SDK2

O driver depende desta biblioteca. Sem ela, o CMake falha com `Could not find LIVOX_LIDAR_SDK_LIBRARY`.

```bash
cd ~
git clone https://github.com/Livox-SDK/Livox-SDK2.git
cd Livox-SDK2 && mkdir build && cd build
cmake ..
make -j$(nproc)
sudo make install
sudo ldconfig
ls /usr/local/lib | grep -i livox         # deve listar liblivox_lidar_sdk_shared.so
```

Só se ocorrer o erro:

- **`cmake` reclama da versão mínima** (CMake 4.x): adicione `-DCMAKE_POLICY_VERSION_MINIMUM=3.5` ao comando `cmake ..`.
- **`make` falha com `uint8_t`/`uint16_t` não declarado**: adicione `#include <cstdint>` no topo dos arquivos indicados pelo compilador e rode `make` de novo.

## 6. Clonar e preparar o driver

O repositório serve para ROS1 e ROS2, então é preciso trocar os arquivos pelos de ROS2.

```bash
mkdir -p ~/ws_livox/src && cd ~/ws_livox/src
git clone https://github.com/Livox-SDK/livox_ros_driver2.git
cd livox_ros_driver2
cp package_ROS2.xml package.xml
cp -rf launch_ROS2/ launch/
git rev-parse --short HEAD                # anote o commit usado
```

## 7. Correção do CMake (workaround)

Neste setup, o build falhou com o erro abaixo, mesmo no Jazzy:

```
The following variables are used in this project, but they are set to NOTFOUND.
.../livox_ros_driver2/LIVOX_INTERFACES_INCLUDE_DIRECTORIES
```

O `CMakeLists.txt` escolhe, conforme a distro, entre um ramo moderno (que usa `rosidl_get_typesupport_target`) e um ramo antigo que gera esse erro. A causa exata de o Jazzy ter caído no ramo antigo não foi investigada (para investigar: `grep -n "DISTRO_ROS" CMakeLists.txt`). O workaround foi forçar o ramo moderno:

```bash
cd ~/ws_livox/src/livox_ros_driver2
sed -i 's/if(DISTRO_ROS STREQUAL "humble" OR DISTRO_ROS STREQUAL "jazzy"[^)]*)/if(TRUE)/' CMakeLists.txt
grep -n -A6 "get include directories of custom msg" CMakeLists.txt   # deve mostrar if(TRUE)
```

Se o `grep` ainda mostrar a condição antiga, o padrão não casou: edite a linha manualmente em um editor de texto.

## 8. Compilar o driver

```bash
cd ~/ws_livox
rm -rf build install log
source /opt/ros/jazzy/setup.bash
rosdep install --from-paths src --ignore-src -r -y
colcon build --symlink-install --cmake-args -DROS_EDITION=ROS2 -DPython3_EXECUTABLE=/usr/bin/python3
source install/setup.bash
```

O resultado esperado é `Summary: 1 package finished`. Os avisos (`warning`) do compilador, como `volatile` obsoleto e captura implícita de `this`, são normais e não impedem o build. O `-DPython3_EXECUTABLE=/usr/bin/python3` garante o uso do Python do sistema.

## 9. Configurar a rede

Ligue o G1 e conecte o cabo Ethernet ao PC. Use o mesmo nome de interface em todos os comandos.

```bash
ip -br a                                  # encontre a interface (en..., eth0); ignore wl..., lo, docker0
sudo ip addr flush dev <INTERFACE>        # enp2s0 neste pc (encontre a sua interface)
sudo ip addr add 192.168.123.148/24 dev <INTERFACE>
sudo ip link set <INTERFACE> up
ip -br a                                  # deve mostrar UP e 192.168.123.148/24
ping <IP_DO_LIDAR>                        # Geralmente 192.168.123.120
```

Se o `ping` falhar, descubra o que responde na rede:

```bash
nmap -sn 192.168.123.0/24
```

Essa configuração de IP é temporária e some ao reiniciar ou desconectar o cabo.

## 10. Editar o arquivo de configuração

```bash
gedit ~/ws_livox/src/livox_ros_driver2/config/MID360_config.json
```

- Em `host_net_info`, altere **todos** os campos de IP para o IP do PC (`192.168.123.148`). Os nomes dos campos podem variar um pouco entre versões (ex.: `cmd_data_ip`, `push_msg_ip`, `point_data_ip`, `imu_data_ip`, `log_data_ip`).
- Em `lidar_configs`, altere `ip` para o IP real do lidar.
- Não altere as portas.

Exemplo:

```json
"host_net_info": {
  "cmd_data_ip": "192.168.123.148",
  "push_msg_ip": "192.168.123.148",
  "point_data_ip": "192.168.123.148",
  "imu_data_ip": "192.168.123.148",
  "log_data_ip": "192.168.123.148"
},
"lidar_configs": [
  { "ip": "<IP_DO_LIDAR>" }
]
```

Como o build usou `--symlink-install`, não é preciso recompilar após editar, mas é necessário reiniciar o launch (o driver só lê a configuração ao iniciar). Se a edição parecer não ter efeito, confira a linha `user_config_path` em `launch/rviz_MID360_launch.py` para ver qual arquivo está sendo lido.

## 11. Executar

```bash
source /opt/ros/jazzy/setup.bash
source ~/ws_livox/install/setup.bash
ros2 launch livox_ros_driver2 rviz_MID360_launch.py
```

## 12. Verificar os dados

Em um segundo terminal, com os mesmos `source`:

```bash
ros2 topic list
ros2 topic hz /livox/lidar                # esperado: cerca de 10 Hz
```

Configuração do RViz2, se não vier pré-configurada:

1. **Fixed Frame:** `livox_frame`. Esse frame só existe depois que o driver começa a publicar.
2. **Add → By topic → `/livox/lidar` → PointCloud2.**
3. **Reliability Policy:** `Best Effort`.
4. **Size:** 0,03 a 0,05. **Color Transformer:** `Intensity` ou `AxisColor`.

O launch `rviz_MID360_launch.py` publica PointCloud2 (`xfer_format = 0`). O `msg_MID360_launch.py` publica o formato customizado da Livox, que o RViz não exibe.

## 13. Solução de problemas

| Problema | O que verificar |
| --- | --- |
| `No module named 'catkin_pkg'` no build | Python do conda em uso. Rode `conda deactivate` e use `-DPython3_EXECUTABLE=/usr/bin/python3`. |
| `Compatibility with CMake < 3.5 has been removed` | Adicione `-DCMAKE_POLICY_VERSION_MINIMUM=3.5` ao `cmake`. |
| `Could not find LIVOX_LIDAR_SDK_LIBRARY` | O Livox-SDK2 não foi instalado. Refaça a seção 5 e rode `sudo ldconfig`. |
| `LIVOX_INTERFACES_INCLUDE_DIRECTORIES ... NOTFOUND` | Aplique o workaround da seção 7. |
| `Frame [livox_frame] does not exist` no RViz | O driver não está recebendo dados. Veja as linhas abaixo. |
| `ping` falha | Cabo, nome da interface, IP configurado na interface correta, `nmap -sn 192.168.123.0/24`. |
| `ping` funciona, mas não há taxa em `/livox/lidar` | Os `host_ip` do JSON não coincidem com o IP do PC, ou o launch lê outro arquivo de configuração (`user_config_path`). |
| Ainda sem dados | `sudo tcpdump -i <INTERFACE> -n udp and host <IP_DO_LIDAR>` para ver se chegam pacotes, e `sudo ufw status` para o firewall. |
| Há taxa, mas o RViz está vazio | Fixed Frame, tópico do PointCloud2 e Reliability `Best Effort`. |

## 14. Observações

- Os passos acima valem para um PC externo. Rodar o driver dentro do Jetson do G1 é possível, mas exige compilar para ARM e escolher o `host_ip` do próprio Jetson. Não foi testado aqui.
- Consulte a documentação de desenvolvedor da Unitree para endereços, usuários e portas do robô, que podem mudar conforme o firmware.
