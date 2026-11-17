---
title: Overview
description: Overview rápido sobre o TeleImager.
---

## 1. Introdução

O **TeleImager** é um serviço de aquisição e transmissão de imagens desenvolvido pela Unitree Robotics. Seu principal objetivo é capturar fluxos de imagens (_image streams_) de múltiplas câmeras conectadas a um dispositivo e disponibilizá-los para clientes remotos por meio de comunicação em rede.

O sistema fornece uma camada de abstração entre o hardware das câmeras e as aplicações que consomem os dados de imagem. Em vez de exigir que cada aplicação implemente seu próprio pipeline de aquisição e transmissão, o TeleImager centraliza o gerenciamento das câmeras, a aquisição dos frames e sua distribuição.

O TeleImager também integra o pipeline de vídeo utilizado pelo **XR Teleoperate**, permitindo a visualização remota das câmeras durante a teleoperação de robôs.

Suas principais funcionalidades incluem:

- Suporte a múltiplas câmeras operando simultaneamente.
    
- Compatibilidade com diferentes interfaces e backends de aquisição.
    
- Configuração de resolução e taxa de quadros (_frame rate_).
    
- Transmissão de imagens pela rede utilizando ZeroMQ e WebRTC.
    
- Descoberta e identificação de câmeras.
    
- Suporte à visualização remota e integração com aplicações personalizadas.
    

## 2. Arquitetura do Sistema

O TeleImager utiliza uma arquitetura cliente-servidor, composta por dois componentes principais:

- **Server:** executado na máquina conectada às câmeras. É responsável pela descoberta dos dispositivos, aquisição das imagens e distribuição dos fluxos.
    
- **Client:** executado em uma máquina ou aplicação remota. Inscreve-se nos fluxos publicados pelo servidor e disponibiliza os frames recebidos para outros componentes.
    

O fluxo geral de dados pode ser representado da seguinte maneira:

```
flowchart LR
    subgraph Robot["Robô / Máquina conectada às câmeras"]
        C1["Head Camera"]
        C2["Left Wrist Camera"]
        C3["Right Wrist Camera"]

        subgraph Server["TeleImager Server"]
            D["Camera Drivers"]
            P["Frame Processing"]
            Z["ZeroMQ Publisher"]
            W["WebRTC Server"]
        end

        C1 --> D
        C2 --> D
        C3 --> D
        D --> P
        P --> Z
        P --> W
    end

    subgraph Remote["Máquina Remota"]
        ZC["TeleImager Client"]
        WB["Web Browser / WebRTC Client"]
        APP["Aplicação Personalizada"]

        ZC --> APP
    end

    Z -->|"ZeroMQ PUB-SUB"| ZC
    W -->|"WebRTC"| WB
```

O servidor abstrai as diferenças entre o hardware das câmeras e suas respectivas interfaces de aquisição. Após a captura, os frames podem ser distribuídos pelos mecanismos de comunicação disponíveis, sem que os clientes precisem interagir diretamente com o hardware.

### 2.1. Server

O servidor é o componente central do sistema. Ele gerencia as câmeras configuradas e executa o pipeline de aquisição e distribuição de imagens.

Suas responsabilidades incluem:

- Descobrir as câmeras conectadas.
    
- Identificar os dispositivos por meio de identificadores de hardware.
    
- Inicializar o driver apropriado para cada câmera.
    
- Configurar resolução e taxa de quadros.
    
- Capturar os frames das câmeras.
    
- Publicar os fluxos de imagens utilizando ZeroMQ e/ou WebRTC.
    

Cada câmera é representada por uma entrada de configuração, que define seu backend de aquisição, identificadores, opções de transmissão e parâmetros de imagem.

Múltiplas câmeras podem ser configuradas independentemente, permitindo que o sistema distribua diferentes fluxos simultaneamente.

### 2.2. Client

O cliente é responsável por receber os fluxos de imagens publicados pelo servidor.

Ele pode ser utilizado em diferentes cenários, incluindo:

- Visualização dos fluxos das câmeras.
    
- Integração dos dados de imagem em aplicações de visão computacional.
    
- Fornecimento de frames para sistemas de teleoperação.
    
- Gravação de dados de imagem para pesquisas e geração de datasets.
    

O cliente Python disponibiliza os frames recebidos como arrays NumPy no formato BGR, permitindo a integração com bibliotecas como OpenCV.

O cliente pode se inscrever individualmente nos fluxos de cada câmera utilizando suas respectivas portas de comunicação.

## 3. Backends de Aquisição de Câmeras

O TeleImager oferece suporte a diferentes backends de aquisição, cada um projetado para interagir com determinados tipos de câmeras ou interfaces de captura.

Um **backend de câmera** define como o servidor interage com o dispositivo físico e obtém seus frames. Ele é independente do protocolo de rede utilizado posteriormente para distribuir esses dados.

Os backends disponíveis incluem:

|Backend|Descrição|Aplicação típica|
|---|---|---|
|UVC|Utiliza a interface USB Video Class por meio da biblioteca Python `pupil-labs-uvc`.|Câmeras USB compatíveis com UVC.|
|V4L2|Utiliza a interface Linux Video4Linux2 por meio do PyAV.|Câmeras expostas como dispositivos de vídeo no Linux.|
|GStreamer|Utiliza pipelines GStreamer para adquirir e processar fluxos de imagens.|Câmeras GMSL, MIPI CSI e outros pipelines especializados.|
|RealSense|Utiliza o SDK Intel RealSense por meio do `pyrealsense2`.|Câmeras Intel RealSense e seus recursos específicos.|

O backend é selecionado individualmente para cada câmera por meio do arquivo de configuração do servidor.

Por exemplo, um robô pode utilizar V4L2 para sua câmera frontal, UVC para as câmeras dos pulsos e GStreamer para outra câmera conectada por meio de um pipeline especializado.

Essa separação permite adaptar o sistema a diferentes configurações de hardware.

## 4. Mecanismos de Comunicação

Após adquirir os frames, o servidor pode distribuí-los por meio de dois mecanismos de comunicação: **ZeroMQ** e **WebRTC**.

Ambos podem ser habilitados independentemente para cada câmera configurada.

### 4.1. ZeroMQ

ZeroMQ é uma biblioteca de comunicação por mensagens utilizada pelo TeleImager para distribuir frames por meio do padrão de comunicação _publish-subscribe_.

O servidor atua como um publicador (_publisher_), enquanto os clientes se inscrevem nos respectivos fluxos de câmeras.

O TeleImager utiliza o padrão PUB-SUB para distribuição de imagens, permitindo que múltiplos clientes recebam frames sem exigir processos independentes de aquisição para cada consumidor.

Esse mecanismo é particularmente útil para:

- Comunicação entre processos em uma rede local.
    
- Integração com aplicações Python personalizadas.
    
- Pipelines de processamento de imagens e visão computacional.
    
- Gravação de dados de imagem para pesquisas.
    

O servidor também disponibiliza uma interface ZeroMQ separada, utilizando o padrão REQ-REP, para comandos relacionados à configuração das imagens.

### 4.2. WebRTC

WebRTC é uma tecnologia de comunicação em tempo real que permite transmitir fluxos de imagens para clientes remotos, incluindo navegadores web.

O TeleImager utiliza WebRTC para oferecer transmissão de vídeo com baixa latência, sendo especialmente útil para aplicações que exigem visualização em tempo real.

Seus principais casos de uso incluem:

- Teleoperação de robôs.
    
- Visualização remota das câmeras.
    
- Interfaces baseadas em navegadores.
    
- Integração com aplicações de realidade virtual (VR).
    

A implementação WebRTC oferece suporte aos codecs H.264 e VP8, além de parâmetros configuráveis de bitrate.

### 4.3. ZeroMQ vs. WebRTC

Embora ambos os mecanismos distribuam frames, eles atendem a finalidades diferentes.

|Característica|ZeroMQ|WebRTC|
|---|---|---|
|Padrão de comunicação|PUB-SUB|Comunicação de mídia em tempo real|
|Finalidade principal|Distribuição de imagens entre aplicações|Transmissão de vídeo em tempo real|
|Consumidor típico|Aplicações Python e pipelines de processamento|Navegadores e interfaces de visualização remota|
|Integração|Clientes ZeroMQ|Clientes compatíveis com WebRTC|
|Configuração|Porta de comunicação|Porta de sinalização e parâmetros do encoder|

A escolha depende da aplicação que irá consumir o fluxo de imagens. Ambos os mecanismos podem operar simultaneamente quando diferentes consumidores precisam acessar a mesma câmera.

## 5. Identificação e Configuração das Câmeras

Quando múltiplas câmeras estão conectadas à mesma máquina, o servidor precisa diferenciá-las.

O TeleImager oferece cinco campos de identificação:

|Identificador|Descrição|
|---|---|
|`physical_path`|Identifica a câmera por meio de seu caminho físico de conexão USB.|
|`serial_number`|Utiliza o número de série de hardware da câmera.|
|`bcd_device`|Utiliza a versão de lançamento do dispositivo USB.|
|`vid_pid`|Identifica o fabricante e o produto por meio dos identificadores USB.|
|`video_id`|Identifica um dispositivo de vídeo do Linux, como `/dev/video4`.|

Esses identificadores possuem diferentes níveis de especificidade e confiabilidade.

Por exemplo, o número de série pode identificar uma câmera física independentemente da porta USB utilizada, enquanto o `video_id` identifica uma interface específica de captura disponibilizada pelo Linux.

Uma distinção importante é que um único dispositivo físico pode expor múltiplos nós de vídeo. Portanto, identificar a câmera física não significa necessariamente identificar a interface de captura que deverá ser utilizada.

O arquivo de configuração associa cada câmera a um nome de tópico definido pelo usuário e especifica seu backend de aquisição, identificadores, parâmetros de imagem e configurações de comunicação.

## 6. Gerenciamento Interno dos Frames

O TeleImager também implementa mecanismos para gerenciar os frames entre os processos de aquisição e distribuição.

Um desses mecanismos é o **triple ring buffer**, que permite compartilhar dados de imagem entre processos sem depender de uma fila FIFO convencional.

Essa abordagem oferece duas características importantes:

- **Redução da contenção entre frames:** leitores e escritores operam sobre posições distintas do buffer, reduzindo a possibilidade de leitura de um frame enquanto ele ainda está sendo escrito.
    
- **Entrega de frames recentes:** frames antigos podem ser sobrescritos em vez de permanecerem acumulados em uma fila, evitando que os consumidores processem imagens cada vez mais desatualizadas.
    

Esse comportamento é particularmente relevante em aplicações de robótica em tempo real, nas quais receber o frame mais recente geralmente é mais importante do que processar todos os frames capturados anteriormente.

## 7. TeleImager em Robótica e Teleoperação

Em aplicações robóticas, o feedback visual é essencial para compreender o ambiente ao redor do robô e acompanhar suas ações.

O TeleImager fornece um mecanismo centralizado para distribuir imagens de diferentes câmeras do robô para aplicações remotas.

No contexto do pipeline XR Teleoperate da Unitree, os fluxos das câmeras podem ser utilizados para fornecer feedback visual durante a operação remota do robô.

Uma configuração com múltiplas câmeras pode fornecer diferentes perspectivas, como:

- Uma câmera frontal para percepção geral do ambiente.
    
- Câmeras posicionadas nos pulsos para observação de objetos durante tarefas de manipulação.
    
- Câmeras adicionais para tarefas específicas de percepção.
    

Ao separar a aquisição das câmeras do consumo das imagens, o TeleImager permite que diferentes aplicações acessem a mesma infraestrutura de câmeras sem precisar implementar pipelines independentes de aquisição.

## 8. Considerações Finais

O TeleImager é um serviço modular de aquisição e transmissão de imagens projetado para sistemas com múltiplas câmeras.

Sua arquitetura separa três responsabilidades fundamentais:

1. **Aquisição das câmeras:** diferentes backends permitem acessar os dispositivos físicos e seus respectivos fluxos de imagens.
    
2. **Gerenciamento dos frames:** o servidor gerencia os frames adquiridos e os prepara para distribuição.
    
3. **Comunicação em rede:** ZeroMQ e WebRTC oferecem diferentes mecanismos para entregar os fluxos de imagens aos consumidores remotos.
    

Essa arquitetura torna o TeleImager adequado para aplicações de robótica, teleoperação, visão computacional e outros cenários que exigem aquisição e distribuição de imagens entre diferentes processos ou máquinas.

Compreender esses componentes fornece a base necessária para configurar o servidor, selecionar os backends de aquisição, estabelecer a comunicação em rede e integrar o TeleImager a um sistema robótico mais amplo.