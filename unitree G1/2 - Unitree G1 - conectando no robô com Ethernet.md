Antes de começar. O G1 tem vários computadores:

| IP Address           | Device            | Username | Password  |     |
| -------------------- | ----------------- | -------- | --------- | --- |
| 192.168.123.161      | G1 MCU            | x        | x         |     |
| 192.168.123.164      | G1 Auxiliary PC 2 | unitree  | 123       |     |
| 192.168.123.120      | Mid360 Lidar      | x        | x         |     |

O computador que vamos acessar com ssh é o PC 2.
Porém, em várias operações nós vamos ler dados do G1 MCU.
# Conectando no robô com Ethernet

Conecte o cabo Ethernet na interface do G1 e no computador host:

```
SER9 Ethernet port  <--- Ethernet cable --->  G1 PC2 Ethernet port
192.168.123.x                                 192.168.123.164
```

The G1 Ethernet IP is fixed at `192.168.123.164`. 
SSH user is `unitree`, password is `123`.

## Host ethernet setup

Install dependencies in the host:
```sh
sudo apt update  
sudo apt install -y ethtool
```

### Check the physical layer

```
sudo ethtool enp194s0 | grep -E "Link detected|Speed|Duplex"
```

Expect to see:
```
Link detected: yes
```

If you get:
```
Link detected: no
```

It means some issue in the physical layer:
- Make sure the cable is plugged into the G1 PC2 Ethernet port, usually the one at the back of the neck/head area.
- Push the connector until it clicks.
- Try another Ethernet cable.
- Wait 1-2 minutes after the robot boots.
- Try power cycling the robot.
- Try the other SER9 Ethernet port if it has more than one.

### Configuring the Ethernet connection

Get the device name:
```
ip -4 addr
```

The Ethernet interface should be named something like `enp194s0`. Find the wired connection attached to `enp194s0`:

```
nmcli con show
```

In my case, it is named `netplan-enp194s0`. Then run:

```
sudo nmcli con mod "netplan-enp194s0" ipv4.method manual \
ipv4.addresses 192.168.123.2/24 \
ipv4.gateway "" ipv4.dns ""

sudo nmcli con down "netplan-enp194s0"
sudo nmcli con up "netplan-enp194s0"
```

Then verify:

```
ip -4 addr show dev enp194s0
ip route get 192.168.123.164
ping -c 4 192.168.123.164
```

If ping worked ...

### Connect on G1 using SSH

```
ssh unitree@192.168.123.164
```
Password: `123`

Then check if Unitree services are running:

```
ps aux | grep -i unitree
ps aux | grep -i dds
```

## TIPS

### Configure on the host machine to make your life easier:

On host machine:
```
mkdir -p ~/.ssh
printf '\nHost g1\n    HostName 192.168.123.164\n    User unitree\n' >> ~/.ssh/config
chmod 600 ~/.ssh/config
ssh-keygen -t ed25519 -C "pc-to-g1"
ssh-copy-id g1
ssh g1
```

### Log G1 commands on the host machine

On host machine:
```
script -a ~/logs/g1_$(date +%Y%m%d_%H%M%S).txt
ssh g1
```
