---
title: Quick Start
description: Tutorial passo-a-passo de como usar o TeleImager pela primeira vez (na versão do xr_teleoperate).
---

Para conseguir utilizar o TeleImager pela primeira vez, precisamos configurar o `teleimager_server.yaml`, presente no diretório `/home/{nome_usuario}/.config/teleimager/` (não confunda com o mesmo arquivo presente no `src`, este é apenas uma cópia).

Neste arquivo nós configuramos se queremos usar ZMQ ou WRTC na respectiva câmera, além da taxa de quadros, resolução e o tipo de driver que vamos utilizar nela (vai depender do suporte que ela tem). Mas, sobretudo, configuramos também a identificação dela, e é sobre ela que bvamos falar agora.

### 5.1 Formas de identificar uma câmera

O TeleImager suporta 3 tipos de identificação, sendo nessa seguinte ordem de importância:
`physical_path > serial_number > video_id`

Vou explicar rapidamente o que é cada uma:
1. **physical_path**: é o caminho da porta USB específica que o Kernel do Linux registra quando plugamos a câmera lá.
2. **serial_number**: é o ID específico dado à câmera no momento da fabricação dela, ela é única e imutável, funcionando como uma espécie de "CPF/RG" do produto.
3. **video_id**: É o caminho (`/dev/videoX`) para um arquivo especial criado pelo V4L2 para reconhecer aquela "webcam". O primeiro dispositivo que você conectar será o `/dev/video0`, o segundo será `/dev/video1` e assim por diante.

Segue abaixo uma tabela detalhando os trade-offs de cada identificador:

|        Identificador         |                                                    🎯 Força                                                     |                                            ⚠️ Ponto Fraco                                            |     |
| :--------------------------: | :-------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | --- |
|      **physical_path**       | Estável enquanto a porta é inalterada; independente do firmware; ideal para plataformas fixas (cabeça + pulsos) |                     Deve atualizar a configuração se for movido para outra porta                     |     |
|      **serial_number**       |                                Portátil entre portas; o ID único por dispositivo                                |                 Câmeras baratas podem compartilhá-lo, deixá-lo vazio ou malformá-lo                  |     |
| **video_id** → `/dev/videoX` |                                    Mais simples: basta preencher o número X                                     | Alterações com ordem de tomada / reinicialização / enumeração — não confiável com mais de uma câmera |     |

Ok, e como você vai saber essas informações? Fácil, basta rodar:

```
python -m teleimager.image_server --cf

# ou

teleimager-server --cf
```

Você verá algo similar a isto:

```
(teleimager) unitree@ubuntu:~$ python -m teleimager.image_server --cf
10:24:35:849900 INFO     ======================= Camera Discovery Start ================================== image_server.py:216
10:24:35:851008 INFO     Found video devices: ['/dev/video0', '/dev/video1', '/dev/video2', '/dev/video3', image_server.py:217
                         '/dev/video4', '/dev/video5']                                                                        
10:24:35:852089 INFO     Found RGB video devices: ['/dev/video0', '/dev/video2', '/dev/video4']            image_server.py:218
10:24:35:852280 INFO     ------------------------- UVC Camera 1 ------------------------------------       image_server.py:227
10:24:35:852575 INFO     video_path    : /dev/video0                                                       image_server.py:228
10:24:35:852759 INFO     video_id      : 0                                                                 image_server.py:229
10:24:35:852844 INFO     serial_number : 200901010002                                                      image_server.py:230
10:24:35:852919 INFO     physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-5/1-5:1.0             image_server.py:231
10:24:35:852989 INFO     extra_info:                                                                       image_server.py:232
10:24:35:853062 INFO         name: USB HDR Camera                                                          image_server.py:239
10:24:35:853133 INFO         manufacturer: Generic                                                         image_server.py:239
10:24:35:853198 INFO         serialNumber: 200901010002                                                    image_server.py:239
10:24:35:853261 INFO         idProduct: 8272                                                               image_server.py:239
10:24:35:853336 INFO         idVendor: 7749                                                                image_server.py:239
10:24:35:853399 INFO         device_address: 4                                                             image_server.py:239
10:24:35:853735 INFO         bus_number: 1                                                                 image_server.py:239
10:24:35:853829 INFO         uid: 1:4                                                                      image_server.py:239
...
10:24:36:033234 INFO         format: 480x640@30 MJPG                                                       image_server.py:243
10:24:36:033249 INFO         format: 480x640@60 MJPG                                                       image_server.py:243
...
10:24:36:034519 INFO     ------------------------- UVC Camera 2 ------------------------------------       image_server.py:227
10:24:36:034551 INFO     video_path    : /dev/video2                                                       image_server.py:228
10:24:36:034567 INFO     video_id      : 2                                                                 image_server.py:229
10:24:36:034582 INFO     serial_number : 01.00.00                                                          image_server.py:230
10:24:36:034595 INFO     physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-11/1-11.1/1-11.1:1.0  image_server.py:231
10:24:36:034608 INFO     extra_info:                                                                       image_server.py:232
10:24:36:034622 INFO         name: Cherry Dual Camera                                                      image_server.py:239
10:24:36:034635 INFO         manufacturer: DECXIN                                                          image_server.py:239
10:24:36:034647 INFO         serialNumber: 01.00.00                                                        image_server.py:239
10:24:36:034658 INFO         idProduct: 11599                                                              image_server.py:239
10:24:36:034670 INFO         idVendor: 7119                                                                image_server.py:239
10:24:36:034683 INFO         device_address: 9                                                             image_server.py:239
10:24:36:034695 INFO         bus_number: 1                                                                 image_server.py:239
10:24:36:034710 INFO         uid: 1:9                                                                      image_server.py:239
...
10:24:36:435928 INFO         format: 480x1280@10 MJPG                                                      image_server.py:243
10:24:36:435988 INFO         format: 480x1280@15 MJPG                                                      image_server.py:243
10:24:36:436047 INFO         format: 480x1280@20 MJPG                                                      image_server.py:243
10:24:36:436108 INFO         format: 480x1280@25 MJPG                                                      image_server.py:243
10:24:36:436168 INFO         format: 480x1280@30 MJPG                                                      image_server.py:243
10:24:36:436227 INFO         format: 480x1280@60 MJPG                                                      image_server.py:243
10:24:36:436286 INFO         format: 480x1280@120 MJPG                                                     image_server.py:243
...
10:24:36:524038 INFO     ------------------------- UVC Camera 3 ------------------------------------       image_server.py:227
10:24:36:524203 INFO     video_path    : /dev/video4                                                       image_server.py:228
10:24:36:524282 INFO     video_id      : 4                                                                 image_server.py:229
10:24:36:524345 INFO     serial_number : 200901010001                                                      image_server.py:230
10:24:36:524398 INFO     physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-11/1-11.2/1-11.2:1.0  image_server.py:231
10:24:36:524449 INFO     extra_info:                                                                       image_server.py:232
10:24:36:524531 INFO         name: USB HDR Camera                                                          image_server.py:239
10:24:36:524672 INFO         manufacturer: Generic                                                         image_server.py:239
10:24:36:524734 INFO         serialNumber: 200901010001                                                    image_server.py:239
10:24:36:524789 INFO         idProduct: 8272                                                               image_server.py:239
10:24:36:524843 INFO         idVendor: 7749                                                                image_server.py:239
10:24:36:524893 INFO         device_address: 10                                                            image_server.py:239
10:24:36:524942 INFO         bus_number: 1                                                                 image_server.py:239
10:24:36:524989 INFO         uid: 1:10                                                                     image_server.py:239
10:24:36:688311 INFO         format: 240x320@30 MJPG                                                       image_server.py:243
...
10:24:36:689031 INFO         format: 480x640@30 MJPG                                                       image_server.py:243
10:24:36:689089 INFO         format: 480x640@60 MJPG                                                       image_server.py:243
...
10:24:36:714374 INFO     =========================== Camera Discovery End ================================
```

**IMPORTANTE**: há alguns cuidados que você deve levar em conta na hora de preencher as informações no `teleimager_server.yaml`, o `serial_number`, mesmo que seja um número, deve ser preenchido como string, e deve estar entre aspas (mesmo que a IDE mostre o valor como string sem aspas). Mesma coisa para o `physical_path`. Já o `video_id`, você deve registrar apenas o **X** do `/dev/videoX`, e ele será um inteiro.

### 5.2 Primeiro Uso

Após configurar todas as câmeras desejadas, você pode rodar o comando:

```
python -m teleimager.image_server
python -m teleimager.image_server --rs   # se estiver usando RealSense

# ou

teleimager-server
teleimager-server --rs
```

O esperado é você conseguir inicializar a câmera, mas erros, principalmente de configuração, podem ocorrer (como foi o caso de quem está escrevendo está documentação 🫠), por isso, pode ser interessante acessar o arquivo `06 - Troubleshooting` escrito na raiz dessa seção, lá eu documentei alguns dos erros que eu tive e como consegui superá-los 😉.

### 5.3 Rodando o Cliente

#### 5.3.1 ZeroMQ

Com o servidor rodando, inicie o cliente em outro terminal (ou outra máquina) e aponte para o IP do servidor:

```
teleimager-client --host 192.168.123.164        # default: 192.168.123.164
```

Cada câmera que for ligada e gerar stream dos dados abrirá sua própria janela OpenCV (necessita do `"teleimager[viewer]"`).

#### 5.3.2 WebRTC

Abra a página do servidor WebRTC no seu navegador e clique em **start** no centro da página:

```
https://<host_ip>:<webrtc_port>      # exemplo: https:192.168.123.164:60001
```

Para saber o IP WebRTC, verifique diretamente no `teleimager_server.yaml` o IP que foi configurado para aquela câmera.