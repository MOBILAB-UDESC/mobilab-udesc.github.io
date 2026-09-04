---
title: Ativando Wi-Fi no G1
description: Configure o Wi-Fi e o acesso SSH do robô humanoide Unitree G1 para operar sem cabo Ethernet.
---

Ativar o Wi-Fi no G1 permite acesso SSH sem cabo Ethernet e facilita a instalação de pacotes.

É recomendado executar a configuração de qualquer rede wifi utilizando o SSH com cabo de Ethernet:

```sh
ssh 192.168.123.164
```

O Wi-Fi vem bloqueado por padrão. Para habilitá-lo:

```sh
sudo rfkill unblock all
sudo ip link set wlan0 up
sudo nmcli radio wifi on
sudo nmcli device set wlan0 managed yes
sudo systemctl restart NetworkManager
```

## Conectar a uma rede Wi-Fi

Liste as redes disponíveis:

```sh
nmcli device wifi list
```

Lista todas as redes que o G1 está conectado e que já se conectou em algum momento.

```sh
nmcli connection show
```

Conectando a uma rede ja adicionada:

```sh
sudo nmcli connection up "NOME_DA_REDE"
```

Conecte-se à rede (nova) desejada (substitua `NOME_DA_REDE` e `SENHA_DA_REDE` pelos valores corretos):

```sh
sudo nmcli connection add type wifi ifname wlan0 con-name "NOME_DA_REDE" ssid "NOME_DA_REDE"
sudo nmcli connection modify "NOME_DA_REDE" wifi-sec.key-mgmt wpa-psk
sudo nmcli connection modify "NOME_DA_REDE" wifi-sec.psk "SENHA_DA_REDE"
sudo nmcli connection modify "NOME_DA_REDE" connection.autoconnect yes
sudo nmcli connection up "NOME_DA_REDE"
```

## Conectar a uma rede sem internet
Caso for um roteador sem internet, é necessário esse passo:
vá para a pasta `/etc/NetworkManager/conf.d/`. No Linux, essa pasta `conf.d` serve para colocar arquivos de regras extras para a rede.
Faça via terminal pois se trata de uma pasta do root, utilize o nano para isso:

```sh
sudo apt update && sudo apt install nano -y
```

Agora dentro do **G1**
```bash
unitree@ubuntu:~$ cd ..
unitree@ubuntu:/home$ cd ..
unitree@ubuntu:/$ cd etc/NetworkManager/conf.d/
unitree@ubuntu:/etc/NetworkManager/conf.d$ sudo nano 20-connectivity.conf
```

Dentro deste arquivo (caso esteja vazio) adicione:
```bash
[connectivity]
uri=
```
> Isso evita o sistema de se desconectar de uma rede por falta de internet

É recomendado desligar a economia d energia do wifi, na mesma pasta, acesse o arquivo ja existente `default-wifi-powersave-on.conf`. Apague o valor *3* e insira o *2* (o número 2 significa desativado no linux), o arquivo ficará assim:
```bash
[connection]
wifi.powersave = 2
```

Após essas alterações, reinicia a rede com essas novas regras!
```sh
sudo systemctl restart NetworkManager
```

## Verifique se o IP foi atribuído e a conectividade:

```sh
ip a show wlan0
ping 8.8.8.8
```

## Referência

- [LeRobot: Enable WiFi on the robot](https://huggingface.co/docs/lerobot/unitree_g1#optional-enable-wifi-on-the-robot)
