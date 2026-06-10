---
title: Conectando no Robô com Ethernet
---

Antes de começar.

For G1 robot, the network devices are assigned the following IP addresses:

| Device Name | IP Address | Subnet Mask | Username/Password |
| --- | --- | --- | --- |
| Locomotion Computer | 192.168.123.161 | 255.255.255.0 | not open to user |
| Development Computer | 192.168.123.164 | 255.255.255.0 | unitree/123 |
| Livx Mid-360 Lidar | 192.168.123.20 | 255.255.255.0 | N/A |

O computador que vamos acessar com ssh é o PC 2.
Porém, em várias operações nós vamos ler dados do G1 MCU.

The carrier board provides the following interfaces:

<img src="/img/guides/unitree-g1/carrier-board-interfaces.webp" alt="Interfaces da carrier board do Unitree G1" width="500" />

| No. | Connector Name | Interface Description | Interface specification |
| --- | --- | --- | --- |
| 1 | XT30UPB-F | VBAT | 58V/5A Battery power output (directly connected to battery power) |
| 2 | XT30UPB-F | 24V | 24V/5A power output |
| 3 | XT30UPB-F | 12V | 12V/5A power output |
| 4 | RJ45 | 1000 BASE-T | GbE (gigabit Ethernet) |
| 5 | RJ45 | 1000 BASE-T | GbE (gigabit Ethernet) |
| 6 | Type-C | Type-C | Support USB3.0 host, 5V/1.5A power output |
| 7 | Type-C | Type-C | Support USB3.0 host, 5V/1.5A power output |
| 8 | Type-C | Type-C | Support USB3.0 host, 5V/1.5A power output |
| 9 | Type-C | Alt Mode Type-C | Supports USB3.2 host and DP1.4 |
| 10 | 5577 | I/O OUT | 12V: 12V/3A power output |

You can directly access the development computer by connecting a Type-C to HDMI adapter to port 9 (adapter not included, requires separate purchase). This allows you to connect a monitor and keyboard to the development computer.

The recommended method for accessing the development computer is connecting an external computer (like a development laptop) via Ethernet using port 4 or 5.

## Conectando no robô com Ethernet

Conecte o cabo Ethernet na interface do G1 e no computador host:

```text
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

```sh
sudo ethtool enp194s0 | grep -E "Link detected|Speed|Duplex"
```

Expect to see:

```text
Link detected: yes
```

If you get:

```text
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

```sh
ip -4 addr
```

The Ethernet interface should be named something like `enp194s0`. Find the wired connection attached to `enp194s0`:

```sh
nmcli con show
```

In my case, it is named `netplan-enp194s0`. Then run:

```sh
sudo nmcli con mod "netplan-enp194s0" ipv4.method manual \
ipv4.addresses 192.168.123.2/24 \
ipv4.gateway "" ipv4.dns ""

sudo nmcli con down "netplan-enp194s0"
sudo nmcli con up "netplan-enp194s0"
```

Then verify:

```sh
ip -4 addr show dev enp194s0
ip route get 192.168.123.164
ping -c 4 192.168.123.164
```

If ping worked ...

### Connect on G1 using SSH

```sh
ssh unitree@192.168.123.164
```

Password: `123`

Then check if Unitree services are running:

```sh
ps aux | grep -i unitree
ps aux | grep -i dds
```

## TIPS

### Configure on the host machine to make your life easier

On host machine:

```sh
mkdir -p ~/.ssh
printf '\nHost g1\n    HostName 192.168.123.164\n    User unitree\n' >> ~/.ssh/config
chmod 600 ~/.ssh/config
ssh-keygen -t ed25519 -C "pc-to-g1"
ssh-copy-id g1
ssh g1
```

### Log G1 commands on the host machine

On host machine:

```sh
script -a ~/logs/g1_$(date +%Y%m%d_%H%M%S).txt
ssh g1
```
