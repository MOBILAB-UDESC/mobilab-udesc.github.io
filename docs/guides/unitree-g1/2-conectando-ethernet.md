---
title: Conectando ao Robô com Ethernet
---

Os dispositivos de rede do G1 usam os seguintes endereços IP:

| Dispositivo | IP | Máscara | Usuário/Senha |
| --- | --- | --- | --- |
| Computador de Locomoção | `192.168.123.161` | 255.255.255.0 | não aberto ao usuário |
| Computador de Desenvolvimento (PC2) | `192.168.123.164` | 255.255.255.0 | unitree/123 |
| LiDAR Livox Mid-360 | `192.168.123.20` | 255.255.255.0 | N/A |
| G1 MCU | — | — | acessado via Computador de Locomoção |

O **Computador de Desenvolvimento (PC2)** é o que acessamos via SSH.
O **G1 MCU** é o microcontrolador de baixo nível das juntas e motores e não possui IP próprio, os dados são lidos através do Computador de Locomoção via protocolo DDS.

O robô oferece as seguintes interfaces:

<img src="/img/guides/unitree-g1/carrier-board-interfaces.webp" alt="Interfaces da carrier board do Unitree G1" width="500" />

| Nº | Conector | Descrição | Especificação |
| --- | --- | --- | --- |
| 1 | XT30UPB-F | VBAT | Saída de bateria 58V/5A (conectado diretamente à bateria) |
| 2 | XT30UPB-F | 24V | Saída 24V/5A |
| 3 | XT30UPB-F | 12V | Saída 12V/5A |
| 4 | RJ45 | 1000 BASE-T | GbE (gigabit Ethernet) |
| 5 | RJ45 | 1000 BASE-T | GbE (gigabit Ethernet) |
| 6 | Type-C | Type-C | USB 3.0 host, saída 5V/1.5A |
| 7 | Type-C | Type-C | USB 3.0 host, saída 5V/1.5A |
| 8 | Type-C | Type-C | USB 3.0 host, saída 5V/1.5A |
| 9 | Type-C | Alt Mode Type-C | USB 3.2 host e DP1.4 |
| 10 | 5577 | I/O OUT | 12V: saída 12V/3A |

É possível acessar o computador de desenvolvimento conectando um adaptador Type-C para HDMI na porta 9 para usar um monitor e teclado.

O método recomendado é conectar um computador externo via Ethernet usando as portas 4 ou 5.

## Conectando via Ethernet

Conecte o cabo Ethernet na interface do G1 e no computador host:

```text
Porta Ethernet do host  <--- Cabo Ethernet --->  Porta Ethernet do G1 (PC2)
192.168.123.x                                    192.168.123.164
```

O IP Ethernet do G1 é fixo em `192.168.123.164`.
Usuário SSH: `unitree`, senha: `123`.

## Configuração da rede no host

Verificar a camada física:

```sh
sudo apt update
sudo apt install -y ethtool
sudo ethtool enp194s0 | grep -E "Link detected|Speed|Duplex"
```

Saída esperada:

```text
Link detected: yes
```

Se aparecer:

```text
Link detected: no
```

Há algum problema na camada física:

- Verifique se o cabo está conectado na porta Ethernet do G1.
- Empurre o conector até ouvir um clique.
- Teste com outro cabo Ethernet.
- Aguarde 1-2 minutos após ligar o robô.
- Reinicie o robô (power cycle).
- Teste a outra porta Ethernet do host, se houver.

### Configurar a conexão Ethernet

1. Descubra o nome da interface Ethernet no host:

   ```sh
   ip -4 addr
   ```

   Procure por uma interface do tipo `enp...` ou `eth...`. Exemplo de saída:

   ```
   1: lo: <LOOPBACK,UP,LOWER_UP> ...
        inet 127.0.0.1/8 ...
   3: enp194s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
        inet 192.168.123.2/24 ...
   4: wlp195s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
        inet 10.0.0.100/24 ...
   ```

   Neste exemplo, a interface Ethernet é `enp194s0`.

2. Identifique o nome da conexão NetworkManager associada a ela:

   ```sh
   nmcli con show
   ```

   Exemplo de saída:

   ```
   NAME                UUID                                  TYPE      DEVICE
   netplan-enp194s0    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ethernet  enp194s0
   ```

   Aqui o nome da conexão é `netplan-enp194s0`.

3. Configure um IP fixo para o host na mesma sub-rede do G1. Vamos usar `192.168.123.2/24` (um IP livre na rede `192.168.123.x`):

   ```sh
   sudo nmcli con mod "netplan-enp194s0" ipv4.method manual \
     ipv4.addresses 192.168.123.2/24 \
     ipv4.gateway "" ipv4.dns ""

   sudo nmcli con down "netplan-enp194s0"
   sudo nmcli con up "netplan-enp194s0"
   ```

4. Verifique se a configuração está correta:

   ```sh
   ip -4 addr show dev enp194s0
   ip route get 192.168.123.164
   ping -c 4 192.168.123.164
   ```

   - O primeiro comando mostra o IP atribuído à interface.
   - O segundo confirma a rota para o G1.
   - O terceiro testa a conectividade.

5. Se o ping funcionar, prossiga para o SSH.

### Conectar via SSH

```sh
ssh unitree@192.168.123.164
```

Verifique se os serviços do Unitree estão rodando:

```sh
ps aux | grep -i unitree
ps aux | grep -i dds
```

## Dicas

### Configurar atalho SSH no host

No computador host:

```sh
mkdir -p ~/.ssh
printf '\nHost g1\n    HostName 192.168.123.164\n    User unitree\n' >> ~/.ssh/config
chmod 600 ~/.ssh/config
ssh-keygen -t ed25519 -C "pc-to-g1"
ssh-copy-id g1
ssh g1
```

### Logar comandos do G1 no host

No computador host:

```sh
script -a ~/logs/g1_$(date +%Y%m%d_%H%M%S).txt
ssh g1
```
