---
title: Quest cabeado
---

Esta seção resume os passos e verificações necessários **toda vez** que for rodar a teleoperação, assumindo que a instalação e configuração já foram feitas.

Seu setup deve estar assim para prosseguir:

<img src="/img/guides/teleoperacao/g1-pc-quest.png" alt="Mise en place para prosseguir." width="1500" />

### Topologia esperada
```text
Host:          enp194s0 = 192.168.123.2  (Ethernet para LAN)
               wlp195s0 = 192.168.123.106 (Wi-Fi para roteador)
PC2 (G1):      eth0    = 192.168.123.164 (Ethernet para LAN)
               wlan0   = 192.168.123.113 (Wi-Fi para roteador)
Robot G1 DDS:  192.168.123.161           (Ethernet para LAN)
Quest 3:       Wi-Fi  = 192.168.123.X    (Wi-Fi para roteador)
```

> Importante: Host e PC2 **não podem** usar Wi-Fi e Ethernet na mesma sub-rede sem rotas explícitas, ou o tráfego DDS/Vuer será roteado pela interface errada.

### 1. Verificações no Host

Execute este comando para obter o seu `enp` e o `wlp`
```sh
ip -br a
```
Agora execute e verifique:
```bash
# 1. Interfaces com IP esperado
ip -4 addr show enp194s0     # deve mostrar 192.168.123.2/24
ip -4 addr show wlp195s0     # deve mostrar 192.168.123.106/24

# 2. Rota padrão via Wi-Fi (para Quest alcançar o host)
ip route show default

# 3. Rotas específicas para PC2 e robô via Ethernet
ip route get 192.168.123.164  # esperado: dev enp194s0 src 192.168.123.2
ip route get 192.168.123.161  # esperado: dev enp194s0 src 192.168.123.2

# 4. Ping para PC2 e robô
ping -c 2 192.168.123.164     # PC2 (camera server)
ping -c 2 192.168.123.161     # G1 controller (DDS peer)
```

Se os `ip route get` mostrarem `dev wlp195s0`, corrija com:

```bash
sudo ip route replace 192.168.123.164/32 dev enp194s0 src 192.168.123.2 metric 10
sudo ip route replace 192.168.123.161/32 dev enp194s0 src 192.168.123.2 metric 10
```

### 2. Verificações no PC2 (SSH)

```bash
ssh unitree@192.168.123.164

# 1. Interface com IP esperado
ip -4 addr show eth0     # deve mostrar 192.168.123.164/24

# 2. Rota para host
ip route get 192.168.123.2    # esperado: dev eth0 src 192.168.123.164

# 3. Ping para robô
ping -c 2 192.168.123.161     # deve responder (0.1-0.5ms)

# 4. Certificados instalados
ls -l ~/.config/xr_teleoperate/   # deve conter cert.pem e key.pem

exit
```

### 3. Iniciar camera server (PC2)

```bash
ssh unitree@192.168.123.164
source ~/.bashrc
conda activate teleimager
cd /home/unitree/teleimager
teleimager-server
# Deixe este terminal aberto
```

Saída esperada:

```text
[teleimager-server] Listening on port 60000
[teleimager-server] WebRTC server on port 60001
```

### 4. Configurar rotas (Host)

```bash
sudo ip route replace 192.168.123.164/32 dev enp194s0 src 192.168.123.2 metric 10
sudo ip route replace 192.168.123.161/32 dev enp194s0 src 192.168.123.2 metric 10
```

Verifique:

```bash
ip route get 192.168.123.164  # dev enp194s0
ip route get 192.168.123.161  # dev enp194s0
ping -c 2 192.168.123.164     # OK
ping -c 2 192.168.123.161     # OK
```