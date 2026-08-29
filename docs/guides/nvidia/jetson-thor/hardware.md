---
title: Hardware Jetson Thor
---

Para o mapa completo dos conectores, consulte o [layout oficial do hardware da Jetson AGX Thor](https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/hardware_layout.html).

## Botões e LED

<img src="https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/0.1.0/_images/JAT-Button-Side_transparent.png" alt="Botões laterais da Jetson AGX Thor" style={{width: "50%", maxWidth: "50%"}} />

| Identificação | Componente | Função |
| --- | --- | --- |
| 11 | Power button | Liga e desliga a placa. |
| 12 | Force Recovery button | Coloca a placa em **Force Recovery Mode**. Esse modo é usado em procedimentos de recuperação ou de gravação externa, quando necessário. |
| 13 | Reset button | Reinicia a placa imediatamente. |
| 14 | White LED | Indica o estado de alimentação e funcionamento da placa. |

### Force Recovery Mode

Para entrar no modo de recuperação:

1. Pressione e mantenha pressionado o botão **Force Recovery** (12).
2. Enquanto mantém o botão pressionado, pressione brevemente o botão **Reset** (13).
3. Solte o botão **Force Recovery**.
4. A placa reiniciará em **Force Recovery Mode**.

O modo de recuperação não é necessário para o fluxo de instalação via USB stick descrito em [Instalação](./install.md), mas pode ser necessário em procedimentos de manutenção e recuperação.

## Conectores e portas

<img src="https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/_images/JAT-IO-Side_5ab_dark.png" alt="Layout do lado de I/O da Jetson AGX Thor" style={{width: "50%", maxWidth: "50%"}} />

| Identificação | Conector | Características principais |
| --- | --- | --- |
| 1 | 2 portas USB Type-A | USB 3.2 Gen 2, até 10 Gbps. |
| 2 | Ethernet RJ45 | Rede de 5 Gbps. |
| 3 | DisplayPort | Saída de vídeo. |
| 4 | HDMI | Saída de vídeo. |
| 5a | USB-C com Force Recovery | USB device mode, USB 3.2 Gen 1, entrada de energia USB-C PD de até 140 W e função de Force Recovery. |
| 5b | USB-C | USB device mode, USB 3.2 Gen 1 e entrada de energia USB-C PD de até 140 W. |
| 6 | Cage QSFP28 | Quatro conexões de 25 Gbps. |
| 7 | Entrada de energia Micro-fit | Entrada DC de 9 a 28 V, até 8 A. |
| 8 | USB-C de debug | Porta de debug localizada atrás da tampa. |

### USB-C usado para conexão externa

Quando a placa for conectada a um computador host para procedimentos externos, a NVIDIA orienta conectar o cabo USB do host à porta USB-C **5a**, localizada ao lado do conector HDMI. A fonte de alimentação USB-C deve ser conectada à outra porta, **5b**.

Se o dispositivo `APX` não aparecer no host ao verificar com `lsusb`, confira se o cabo está conectado à porta USB-C correta e se a placa está no modo de recuperação esperado pelo procedimento.

## Referências

- [Hardware Layout, NVIDIA Jetson AGX Thor Developer Kit](https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/hardware_layout.html)
- [Quick Start Guide, instalação via USB](https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/0.1.0/quick_start.html)
- [Guia de desenvolvimento da Jetson Thor](https://docs.nvidia.com/jetson/archives/r39.2.1/DeveloperGuide/index.html)
