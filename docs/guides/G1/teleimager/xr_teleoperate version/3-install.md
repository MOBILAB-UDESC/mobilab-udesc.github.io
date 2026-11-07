---
title: Install (XR_Teleoperation Version)
description: Tutorial passo-a-passo de como instalar a versão que o xr_teleoperate usa do TeleImager.
---

Sabendo que o TeleImager tem duas _roles_ (client, server), mas, antes de baixar cada uma, o sistema precisa de alguns pré-requisitos instalados, vamos ver agora ver como instalá-los.

## 1. Instalando os Pré-Requisitos

Para codificar e descodificar, o TeleImager usa do **PyTurboJPEG**, uma biblioteca ctype que usa **libjpeg-turbo** na importação. Como o pip não consegue baixar essa biblioteca nativamente, temos duas opções para instalá-la:

```
sudo apt install -y libusb-1.0-0-dev libturbojpeg-dev
```
#### Configurando o Ambiente (conda)

Por uma decisão de compatibilidade, os desenvolvedores do TeleImager resolveram optar por rodar o software utilizando Python 3.10 (apesar das dependências necessárias, presentes no `pyproject.toml` não explicitarem uma necessidade específica dessa versão), portanto, vamos criar um ambiente isolado usando conda para baixar as dependências do TeleImager.

```
# for Jetson Orin NX (ARM architecture)

mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3 && rm ~/miniconda3/miniconda.sh
source ~/miniconda3/bin/activate && conda init --all

# Crie ative o ambiente de projeto
conda create -n teleimager python=3.10 -y
conda activate teleimager
```
## 2. Instalando o Client e o Server

```
# Option 1 — from source (recommended)
git clone https://github.com/unitreerobotics/teleimager.git
cd teleimager
# Se você apenas precisar do client
pip install -e .

# Se você quer usar o client E o server
pip install -e ".[server]"

# Option 2 — from PyPI
pip install "teleimager[realsense]"  # e.g. "teleimager[uvc]", "teleimager[all]"
```

Adicionar permissões de dispositivo de vídeo para usuários não-root:
```
bash setup_uvc.sh
```
### 3. Configurando os certificados (apenas para WebRTC)

#### Método 1: Usando o diretório de configuração (recomendado)

```
mkdir -p ~/.config/xr_teleoperate/
cp cert.pem key.pem ~/.config/xr_teleoperate/
```

#### Método 2: Usando variáveis de ambiente

```
echo 'export XR_TELEOP_CERT="your_file_path/cert.pem"' >> ~/.bashrc
echo 'export XR_TELEOP_KEY="your_file_path/key.pem"' >> ~/.bashrc
source ~/.bashrc
```

#### Método 3: Comportamento padrão

Bem, se você não seguir nenhum dos dois passos a cima, o TeleImager procurará os certificados nos caminhos do módulo padrão.