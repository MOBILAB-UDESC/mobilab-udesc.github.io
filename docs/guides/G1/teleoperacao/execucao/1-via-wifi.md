---
title: Quest via wifi
---

Esta seção resume os passos e verificações necessários para rodar a teleoperação, assumindo que a instalação, configuração e principalmente (pois iremos partir direto de lá) a **checklist** já foram feitas.

Seu setup deve estar assim para prosseguir:

<img src="/img/guides/teleoperacao/g1-pc-roteador-quest.jpg" alt="Mise en place para prosseguir." width="1500" />

### Topologia esperada
```text
Host:          enp194s0 = 192.168.123.2  (Ethernet para LAN)
               wlp195s0 = 192.168.123.106 (Wi-Fi para roteador)
PC2 (G1):      eth0    = 192.168.123.164 (Ethernet para LAN)
Robot G1 DDS:  192.168.123.161           (Ethernet para LAN)
Quest 3:       Wi-Fi  = 192.168.123.X    (Wi-Fi para roteador)
```

> Importante: Host e PC2 **não podem** usar Wi-Fi e Ethernet na mesma sub-rede sem rotas explícitas, ou o tráfego DDS/Vuer será roteado pela interface errada.
## PC2
```sh
ssh 192.168.123.164
conda activate teleimager
```
Estando dentro do G1, rode o script de inicialização da câmera criado durante a [Configuração do PC2](/guides/G1/teleoperacao/configuracao/configuracao-pc2)

```sh
cd unitree/teleimager
./run_realsense_server.sh
```

Verá isso ser printado no terminal:

```bash
03:09:05:748194 INFO     UVC driver reloaded successfully.                       image_server.py:535
03:09:05:757390 INFO     [Responser] Camera Config Responser initialized at      image_client.py:460
                         0.0.0.0:60000
03:09:06:313055 INFO     [OpenCVCamera: head_camera] initialized with 480x640 @ image_server.py:1078
                         30 FPS.
                         ZMQ: enabled, zmq port=55555; WebRTC: enabled, webrtc
                         port=60001
03:09:06:313352 INFO     [Image Server] Image server has started, waiting for   image_server.py:1240
                         client connections...
03:09:06:345748 INFO     [Image Server] head_camera is ready.                   image_server.py:1356
03:09:06:348130 INFO     [Image Server] Running... Press Ctrl+C to exit.        image_server.py:1431
```
**Atenção:** aguarde alguns segundos após ligar o robô antes de rodar este script.

## HOST

Agora no pc HOST é necessário rodar o script de teleoperação que foi instalado durante a [Configuração do HOST](/guides/G1/teleoperacao/configuracao/configuracao-host)

```sh
conda activate g1
cd ~/Desktop/Teleoperacao/xr_teleoperate/teleop
python
```

> Esses são os parâmetros principais e mais utilizados, caso necessite, consulte a [documentação oficial](https://github.com/unitreerobotics/xr_teleoperate)


| Parâmetro | Descrição | Opções | Default |
|:---------:|:---------:|:------:|:-------:|
| --input-mode | Escolhe qual a forma de controlar o robô | `hand` `controller` | `hand` |
| --e | Selecionar o end-effector (mãos) | `dex1` `dex3` `inspire_ftp` `inspire_dfx` `brainco` | None |
| --motion | Habilita o controle das pernas | | |

**Atenção:**  Para utilizar o modo motion o G1 deve estar em `Regular mode` (L2+B -> L2+UP -> R1+X), sem o --motion ele pode estar em `Debug mode`

```sh
python teleop_hand_and_arm.py --input-mode controller
```

Verá isso ser printado no terminal:

```bash
17:27:15.990775 INFO     Received camera config from server                      image_client.py:638
                         192.168.123.164:60000
17:27:15.992203 INFO     Saved camera config to local                            image_client.py:641
                         /home/infantaria/unitree_G1ws/xr_teleoperate/teleop/tel
                         eimager/cam_config_client.yaml
Serving file:///home/infantaria/unitree_G1ws/xr_teleoperate/teleop at /static
Visit: https://vuer.ai?grid=False
17:27:16.730450 INFO     [G1_29_ArmIK] >>> Loading cached robot model:            robot_arm_ik.py:37
                         g1_29_model_cache.pkl
17:27:16.747949 INFO     Initialize G1_29_ArmController...                           robot_arm.py:69
17:27:16.964648 INFO     [G1_29_ArmController] Subscribe dds ok.                    robot_arm.py:106
17:27:16.967171 INFO     Lock all joints except two arms...                         robot_arm.py:117
17:27:16.967551 INFO     Lock OK!                                                   robot_arm.py:137
17:27:16.969295 INFO     Initialize G1_29_ArmController OK!                         robot_arm.py:145
17:27:16.969867 INFO     ------------------------------------------------ teleop_hand_and_arm.py:267
                         ----------------
17:27:16.969969 INFO     🟢  Press [r] to start syncing the robot with    teleop_hand_and_arm.py:268
                         your movements.
17:27:16.970031 INFO     🔵  Recording is DISABLED (run with --record to  teleop_hand_and_arm.py:272
                         enable).
17:27:16.970091 INFO     🔴  Press [q] to stop and exit the program.      teleop_hand_and_arm.py:273
17:27:16.970142 INFO     ⚠️  IMPORTANT: Please keep your distance and     teleop_hand_and_arm.py:274
                         stay safe.
```
É muito comum haver erros neste terminal que no final envolvem os certificaods `key.pem` e `cert.pem`. Caso ocorra algum erro ou o robô não responda aos movimentos do seu braço é recomenda verificar se o caminha posto no bash esta correto para os certificados: `gedit ~/.bashrc`

## QUEST