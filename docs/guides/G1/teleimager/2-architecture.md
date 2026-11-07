---
title: Architecture
description: Explicações sobre a arquitetura do TeleImager.
---

### 1. ZeroMQ (ZMQ)

O ZeroMQ funciona baseado em PUB-SUB, ou seja, o server (robô) se conecta ao ZeroMQ como um Publisher, em outras palavras, sendo a parte que enviará os frames da câmera para quem estiver inscrito. O Client é quem será o Subscriber, o lado que receberá estes frames. Este client pode ser o Meta Quest, ou propriamente um computador mesmo.

Para utilizá-lo, ambos os lados precisarão estar na mesma rede LAN, não sendo necessário um cabo de rede, podem estarem conectados na mesma rede Wi-Fi, ou, ambos estiverem no mesmo robô.

#### 1.1 Prós

O ZMQ oferece uma melhor qualidade de imagem e **baixíssima latência**, conseguindo entregar dezenas de milhares de mensagens por segundo e com latência quase nula (microssegundos na camada de transporte). Além disso ele oferece um controle total do pipeline e arquitetura brokerless, ou seja, não precisa de um servidor central pesado rodando no robô.

#### 1.2 Contras

Um dos contras é a incompatibilidade nativa com browsers, já que navegadores Web não conseguem consumir streams de sockets TCP/IPC puros do ZeroMQ nativamente. Mas isso é resolvido instalando um cliente dedicado, ou seja, instalando o client do TeleImager.

Outro é que o ZMQ não consegue ajustar em tempo real o bitrate ou a resolução do vídeo para fazer ela se ajustar, podendo travar mais facilmente em caso de gargalos na conexão.

Fazer uma conexão externa ao robô através de diferentes redes exigem configurações manuais de roteamento e abertura de portas (port forwarding).

#### 1.3 Arquitetura

Uma maneira de enxergar a arquitetura pensando na câmera, server e client, é a da imagem abaixo:

![[Pasted image 20261106150937.png]]

Como o Client usado pelo ZeroMQ é um cliente python (como o OpenCV por exemplo), o ZMQ manda os frames compactados, o client utiliza JPEG Decodings como o PyTurboJPEG.

Além disso, o cliente Python ainda vai utilizar de `ndarray` para converter os frames para arrays NumPy em formato BGR para o OpenCV conseguir trabalhar.

### 2. WebRTC

O WebRTC foi feito para oferecer uma interface de **preview em tempo real diretamente no navegador web**, sem a necessidade de instalar um software cliente no computador ou celular do usuário.

#### 2.1 Prós

**Acesso pelo Navegador**: o WebRTC permite você abrir um navegador como o Chrome, Firefox, Safari e, apenas inserindo um IP, consiga ter acesso as imagens da câmera do robô.

**Ajuste dinâmico da imagem**: este protocolo é munido de algoritmos nativos que ajustam a qualidade da imagem baseado nos gargalos da rede (Wi-Fi, 4G/5G).

**Transposição de NAT nativa**: facilita a conexão através de firewalls e roteadores complexos usando protocolos integrados (STUN/TURN), ideal para teleoperação remota fora da rede local.

#### 2.2 Contras

**Maior consumo de CPU no servidor**: para lidar com a criptografia pesada (DTLS/SRTP), handshake (ICE) e codificação de vídeo compatível com web, o WebRTC utiliza muito processamento do robô.

**Latência ligeiramente maior que Sockets puros**: embora seja ultra-rápido (sub-500ms), o processamento extra das camadas do WRTC adiciona alguns milissegundos a mais se comparado ao transporte direto via TCP/IPC do ZMQ.

#### 2.3 Arquitetura

Um pouco diferente da arquitetura do ZMQ, uma visualização simplificada do WebRTC seria:
![[Pasted image 20261106153744.png]]

Enquanto o ZMQ transmite os frames individualmente usando o PyTurboJPEG, a Web não consegue lidar com isso, então o WRTC utiliza codecs de streaming em tempo real para traduzi-los a uma linguagem mais amigável para navegadores, como o `aiortc` (H.264 ou VP8).

### Adendo sobre o XR_Teleoperate

O `xr_teleoperate` geralmente faz uma mescla dos dois, usando o ZMQ pela sua baixa latência e troca de dados estruturados (como dados de controle de pose, comandos de juntas/articulações e atualizações de estado entre os nós distribuídos do robô/simulador), e o WebRTC para **streaming de vídeo das câmeras do robô em tempo real** diretamente para o Meta Quest ou outro hardware de realidade virtual usado pelo laboratório, já que o WRTC garante a baixa latência necessária para o feedback visual imersivo do operador.