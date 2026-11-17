---
title: Install (Current)
description: Tutorial passo-a-passo de como instalar a última versão do TeleImager.
---

Sabendo que o TeleImager tem duas _roles_ (client, server), mas, antes de baixar cada uma, o sistema precisa de alguns pré-requisitos instalados, vamos ver agora ver como instalá-los.

## 1. Instalando os Pré-Requisitos

Para codificar e descodificar, o TeleImager usa do **PyTurboJPEG**, uma biblioteca ctype que usa **libjpeg-turbo (3.0+ required)** na importação. Como o pip não consegue baixar essa biblioteca nativamente, temos duas opções para instalá-la:

#### Alternativa 1 - Conda (recomendado por ser multi-plataforma)
```
conda install -c conda-forge libjpeg-turbo
```

#### Alternativa 2 - Homebrew (MacOS)
```
brew install jpeg-turbo
```

#### Configurando o Ambiente (conda)

Por uma decisão de compatibilidade, os desenvolvedores do TeleImager resolveram optar por rodar o software utilizando Python 3.10 (apesar das dependências necessárias, presentes no `pyproject.toml` não explicitarem uma necessidade específica dessa versão), portanto, vamos criar um ambiente isolado usando conda para baixar as dependências do TeleImager.

```
# Instalação miniconda (pule se já tiver instalado). Use o instalador aarch64 no Jetson/ARM.

mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3 && rm ~/miniconda3/miniconda.sh
source ~/miniconda3/bin/activate && conda init --all

# Crie ative o ambiente de projeto
conda create -n teleimager python=3.10 -y
conda activate teleimager
```

Finalmente, vamos começar a instalar o client.
## 2. Instalando o Client

Como foi explicado na nota 02 - Arquitetura, o Client tem em sua composição o _Handless_ e o _Viewer_.

Para baixar APENAS o Handless, execute:
```
pip install teleimager
```

Caso você queira baixar o Handless E o Viewer, execute:
```
pip install "teleimager[viewer]"
```

## 3. Instalando o Server

#### 3. 1 Escolhendo o Driver

Para instalar o server, você precisa saber qual backend (pode chamar também de driver da câmera) você quer rodar, para então saber qual baixar (você pode baixar todos, se quiser).

Um backend é um driver de captura do TeleImager, ele vai depender de qual câmera você quer usar. Estes drivers funcionam de maneira preguiçosa (lazily loaded), ou seja, se você baixar mais de um driver por exemplo, ao iniciar o TeleImager, ele não inicializará todos automaticamente, apenas aquele(s) que você pediu.

Segue abaixo uma tabela presente no README do próprio repositório do TeleImager, ele será útil para você saber qual escolher:
![[Pasted image 20261105120021.png]]

**IMPORTANTE**: como nesta documentação, nossa intenção é primariamente usar o RealSense, é interessante que você saiba que há duas formas de acessar esta câmera:
1. Usando o **V4L2** (Video4Linux2), uma forma que transforma a câmera numa WebCam via cabo USB, assim transmitindo a imagem com menor latência, mas com menor qualidade e uma integração mais dificultosa com o mapa de profundidade (depth).
2. Usando o próprio SDK oficial do RealSense, o `pyrealsense2`, isso permite uma imagem melhor, com maior taxa de quadros (até 90FPS), integração automática com o mapa de profundidade, imagem colorida, etc. Mas, peca em latência, usa muito mais processamento da Jetson e é mais problemática quanto a crashes de memória ou bugs de inicialização.

Para o caso de usar a câmera para gravação de episódios e posterior treinamento usando ML, o recomendável, segundo o README do próprio TeleImager, é usar o SDK do próprio RealSense em vez do V4L2.

#### 3.2 Instalando

Voltando a instalação, temos duas opções:
```
# Option 1 — from source (recommended)
git clone https://github.com/unitreerobotics/teleimager.git
cd teleimager
pip install -e ".[realsense]"        # e.g. ".[uvc]", ".[all]"

# Option 2 — from PyPI
pip install "teleimager[realsense]"  # e.g. "teleimager[uvc]", "teleimager[all]"
```

Repare que, você pode instalar apenas o server se quiser:
```
pip install -e ".[server]"

ou

pip install "teleimager[server]"
```

Mas o RealSense já baixa por padrão o `teleimager[server]`, é uma dependência dele, como está presente no `pyproject.toml` da documentação oficial do [TeleImager](https://github.com/unitreerobotics/teleimager/blob/main/pyproject.toml):
```
realsense = ["teleimager[server]", "pyrealsense2"]
```
#### 3.3. Configurando os certificados TLS (apenas para WebRTC)

Veja o [Guia CA](https://github.com/unitreerobotics/xr_teleoperate/wiki/CA) para mais detalhes. Ou gere um par auto-assinado rapidamente usando openssl:
```
# Gera um certificado auto-assinado valido por 365 dias (cert.pem / key.pem)

openssl req -x509 -newkey rsa:2048 -nodes -days 365 -keyout key.pem -out cert.pem -subj "/CN=teleimager"
```

Agora, deixe o TeleImager encontrar estes certificados usando uma das duas maneiras:
```
# Opção A — diretório de configuração padrão (recomendado, mesmo diretório que o servidor yaml)
mkdir -p ~/.config/teleimager/
cp cert.pem key.pem ~/.config/teleimager/

# Opção B — Colocar em qualquer caminho no CLI
teleimager-server --cert /path/to/cert.pem --key /path/to/key.pem
```