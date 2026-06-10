---
title: Configuração do computador host
---

## Verificações iniciais

Verifique se o robô está enviando pacotes UDP:

```sh
sudo timeout 20 tcpdump -ni enp194s0 -e -vv 'host 192.168.123.161 and udp'
```

Configure o firewall para permitir tráfego do robô na interface Ethernet:

```sh
sudo ufw allow in on enp194s0 from 192.168.123.0/24
sudo ufw allow out on enp194s0 to 192.168.123.0/24

sudo ufw reload
sudo ufw status verbose
```

## Configurar o projeto no host

Instale o gerenciador de pacotes `uv` e as dependências do sistema:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
uv --version

sudo apt update
sudo apt install -y git cmake build-essential net-tools nmap arping ethtool
```

Crie o projeto. O SDK Python da Unitree funciona com Python >= 3.8 e requer `cyclonedds==0.10.2` ([referência](https://huggingface.co/docs/lerobot/unitree_g1)):

```sh
git clone git@github.com:MOBILAB-UDESC/unitree-g1.git
cd ~/Developer/unitree-g1
uv sync
```

## Ler dados de estado do robô

Carregue as variáveis de ambiente e execute o monitor de low state:

```sh
source scripts/g1_config_env.sh
uv run python scripts/g1_monitor_lowstate.py "enp194s0"
```

A saída deve ser semelhante a:

```text
hz=1000.x tick=... mode_machine=6 q0=... dq0=... imu_accel=[...]
```

## Dicas

Se houver múltiplos processos Python DDS rodando simultaneamente, finalize-os antes de novos testes:

```sh
pkill -f g1_monitor_lowstate
ss -lunp | grep python || true
```
