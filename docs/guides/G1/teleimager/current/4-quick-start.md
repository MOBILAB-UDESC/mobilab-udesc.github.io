---
title: Quick Start
description: Tutorial passo-a-passo de como usar o TeleImager pela primeira vez (na versão mais atual).
---

Para conseguir utilizar o TeleImager pela primeira vez, precisamos configurar o `teleimager_server.yaml`, presente no diretório `/home/{nome_usuario}/.config/teleimager/` (não confunda com o mesmo arquivo presente no `src`, este é apenas uma cópia).

Neste arquivo nós configuramos se queremos usar ZMQ ou WRTC na respectiva câmera, além da taxa de quadros, resolução e o tipo de driver que vamos utilizar nela (vai depender do suporte que ela tem). Mas, sobretudo, configuramos também a identificação dela, e é sobre ela que bvamos falar agora.

### 5.1 Formas de identificar uma câmera

O TeleImager suporta 5 tipos de identificação, sendo nessa seguinte ordem de importância:
`physical_path > serial_number > bcd_device > vid_pid > video_id`

Vou explicar rapidamente o que é cada uma:
1. **physical_path**: é o caminho da porta USB específica que o Kernel do Linux registra quando plugamos a câmera lá.
2. **serial_number**: é o ID específico dado à câmera no momento da fabricação dela, ela é única e imutável, funcionando como uma espécie de "CPF/RG" do produto.
3. **bcd_device**: O número identificador BCD de um dispositivo (comumente chamado de bcdDevice) representa a versão de revisão ou número de liberação (release) do hardware ou firmware do dispositivo, codificado em formato decimal codificado em binário.
4. **vid_pid**: Aqui temos duas coisas, o VID e o PID. O VID (Vendor ID) é o número único que identifica a empresa que fabricou o produto. Já o PID é um número específico criado pela empresa para separar aquele **modelo** de aparelho específico de outros da mesma empresa. Cada identificador tem 16 bits.
5. **video_id**: É o caminho (`/dev/videoX`) para um arquivo especial criado pelo V4L2 para reconhecer aquela "webcam". O primeiro dispositivo que você conectar será o `/dev/video0`, o segundo será `/dev/video1` e assim por diante.

Segue abaixo uma tabela detalhando os trade-offs de cada identificador:

|        Identificador         |                                                                  🎯 Força                                                                  |                                            ⚠️ Ponto Fraco                                            |     |
| :--------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | --- |
|      **physical_path**       |              Estável enquanto a porta é inalterada; independente do firmware; ideal para plataformas fixas (cabeça + pulsos)               |                     Deve atualizar a configuração se for movido para outra porta                     |     |
|      **serial_number**       |                                             Portátil entre portas; o ID único por dispositivo                                              |                 Câmeras baratas podem compartilhá-lo, deixá-lo vazio ou malformá-lo                  |     |
|        **bcd_device**        | Hardcoded no firmware, sobrevive a reinicializações e alterações de porta; pode atuar como um _serial-number_ quando o fornecedor pretende |                       Muitas vezes idêntico em todas as unidades de um modelo                        |     |
|         **vid_pid**          |                                                Muito estável; distingue modelos de relance                                                 |                     Unidades do mesmo modelo geralmente compartilham um vid_pid                      |     |
| **video_id** → `/dev/videoX` |                                                  Mais simples: basta preencher o número X                                                  | Alterações com ordem de tomada / reinicialização / enumeração — não confiável com mais de uma câmera |     |

Ok, e como você vai saber essas informações? Fácil, basta rodar:

```
teleimager-server --cf --uvc --v4l2        # adicione --rs para RealSense, --gst para GStreamer
```

Exemplo de output:

```
[Teleimager] 🎯 Camera Finder Report
├─ UVCCamera (3 found)   [type: uvc]
│  ├─ 📷 USB HDR Camera (Generic)
│  │  ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-3/1-3.1/1-3.1:1.0
│  │  ├─ serial_number : 200901010001
│  │  ├─ bcdDevice     : 0200           (USB device release number)
│  │  ├─ vid : pid     : 1e45:2050      (VendorID : ProductID)
│  │  ├─ video_id      : 0              (/dev/video0)
│  │  └─ modes (MJPG)  [width x height @ fps]:
│  │     ├─ 320x240 @ [30, 60]
│  │     
│  │     └─ 1920x1080 @ [30, 60]
│  ├─ 📷 Abham Image (HHWei Technology Co., Ltd.)
│  │  ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-1/1-1:1.0
│  │  ├─ serial_number : HHW001
│  │  ├─ bcdDevice     : 0200           (USB device release number)
│  │  ├─ vid : pid     : 1c45:6200      (VendorID : ProductID)
│  │  ├─ video_id      : 10             (/dev/video10)
│  │  └─ modes (MJPG)  [width x height @ fps]:
│  │     ├─ 640x480 @ [5, 10, 15, 20, 25, 30]
│  │     ...
│  │     └─ 2688x1520 @ [5, 10, 15, 20, 25, 30]
│  └─ 📷 Cherry Dual Camera (DECXIN)
│     ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-3/1-3.2/1-3.2:1.0
│     ├─ serial_number : 01.00.00
│     ├─ bcdDevice     : 0217           (USB device release number)
│     ├─ vid : pid     : 1bcf:2d4f      (VendorID : ProductID)
│     ├─ video_id      : 2              (/dev/video2)
│     └─ modes (MJPG)  [width x height @ fps]:
│        ├─ 320x232 @ [10, 15, 20, 25, 30, 60, 120]
│        ├─ 640x240 @ [10, 15, 20, 25, 30, 60, 120]
│        ├─ 800x592 @ [10, 15, 20, 25, 30, 60, 120]
│        ├─ 800x600 @ [10, 15, 20, 25, 30, 60, 120]
│        ├─ 1280x480 @ [10, 15, 20, 25, 30, 60, 120]
|        ...
│        └─ 3200x1296 @ [10, 15, 20, 25, 30, 60]
└─ V4L2Camera (4 found)   [type: v4l2]
   ├─ 📷 USB HDR Camera (Generic)
   │  ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-3/1-3.1/1-3.1:1.0
   │  ├─ serial_number : 200901010001
   │  ├─ bcdDevice     : 0200           (USB device release number)
   │  ├─ vid : pid     : 1e45:2050      (VendorID : ProductID)
   │  ├─ video_id      : 0              (/dev/video0)
   │  └─ modes  [width x height @ fps]:
   │     ├─ MJPG   1920x1080 @ [60.0, 30.0]
   ...
   │     └─ YUYV   640x480 @ [30.0]
   ├─ 📷 Abham Image (HHWei Technology Co., Ltd.)
   │  ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-1/1-1:1.0
   │  ├─ serial_number : HHW001
   │  ├─ bcdDevice     : 0200           (USB device release number)
   │  ├─ vid : pid     : 1c45:6200      (VendorID : ProductID)
   │  ├─ video_id      : 10             (/dev/video10)
   │  └─ modes  [width x height @ fps]:
   │     ├─ MJPG   2688x1520 @ [30.0, 25.0, 20.0, 15.0, 10.0, 5.0]
   ...
   │     └─ YUYV   640x480 @ [30.0]
   ├─ 📷 Cherry Dual Camera (DECXIN)
   │  ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-3/1-3.2/1-3.2:1.0
   │  ├─ serial_number : 01.00.00
   │  ├─ bcdDevice     : 0217           (USB device release number)
   │  ├─ vid : pid     : 1bcf:2d4f      (VendorID : ProductID)
   │  ├─ video_id      : 2              (/dev/video2)
   │  └─ modes  [width x height @ fps]:
   │     ├─ MJPG   3200x1296 @ [60.0, 30.0, 25.0, 20.0, 15.0, 10.0]
   ...
   │     ├─ YUYV   640x240 @ [60.0, 30.0, 25.0, 20.0, 15.0, 10.0]
   │     └─ YUYV   320x232 @ [120.0, 60.0, 30.0, 25.0, 20.0, 15.0, 10.0]
   └─ 📷 Intel(R) RealSense(TM) Depth Camera 435i (Intel(R) RealSense(TM) Depth Camera 435i)
      ├─ physical_path : /sys/devices/pci0000:00/0000:00:14.0/usb1/1-11/1-11.2/1-11.2:1.3
      ├─ serial_number : (none)
      ├─ bcdDevice     : 50d0           (USB device release number)
      ├─ vid : pid     : 8086:0b3a      (VendorID : ProductID)
      ├─ video_id      : 8              (/dev/video8)
      └─ modes  [width x height @ fps]:
         ├─ YUYV   424x240 @ [60.0, 30.0, 15.0, 6.0]
         ├─ YUYV   640x480 @ [30.0, 15.0, 6.0]
         ├─ YUYV   1280x720 @ [15.0, 10.0, 6.0]
         └─ YUYV   1920x1080 @ [8.0]
```

Cada _flag_ indica ao TeleImager quais câmeras você quer baseadas na disponibilidade delas pelo driver. Como já falamos antes, a RealSense suporta V4L2 e o próprio SDK oficialmente.

**IMPORTANTE**: há alguns cuidados que você deve levar em conta na hora de preencher as informações no `teleimager_server.yaml`, o `serial_number`, mesmo que seja um número, deve ser preenchido como string, e deve estar entre aspas (mesmo que a IDE mostre o valor como string sem aspas). Mesma coisa para o `physical_path`. Já o `video_id`, você deve registrar apenas o **X** do `/dev/videoX`, e ele será um inteiro.

### 5.2 Primeiro Uso

Após configurar todas as câmeras desejadas, você pode rodar o comando:

```
teleimager-server
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