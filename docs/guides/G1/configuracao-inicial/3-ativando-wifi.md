---
title: Ativando Wi-Fi no G1
---

Ativar o Wi-Fi no G1 permite acesso SSH sem cabo Ethernet e facilita a instalação de pacotes.

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

Conecte-se à rede desejada (substitua `MobiLink` e `<senha>` pelos valores corretos):

```sh
sudo nmcli connection add type wifi ifname wlan0 con-name "MobiLink" ssid "MobiLink"
sudo nmcli connection modify "MobiLink" wifi-sec.key-mgmt wpa-psk
sudo nmcli connection modify "MobiLink" wifi-sec.psk "<senha>"
sudo nmcli connection modify "MobiLink" connection.autoconnect yes
sudo nmcli connection up "MobiLink"
```

Verifique se o IP foi atribuído e a conectividade:

```sh
ip a show wlan0
ping 8.8.8.8
```

## Referência

- [LeRobot: Enable WiFi on the robot](https://huggingface.co/docs/lerobot/unitree_g1#optional-enable-wifi-on-the-robot)
