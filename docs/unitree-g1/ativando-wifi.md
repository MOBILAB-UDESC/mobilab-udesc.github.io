---
title: Ativando Wi-Fi no Robo
---

Facilita para fazer ssh direto por wifi e para instalar pacotes.

For wireless SSH access, you can enable WiFi on the G1 (it's blocked by default):

```sh
sudo rfkill unblock all
sudo ip link set wlan0 up
sudo nmcli radio wifi on
sudo nmcli device set wlan0 managed yes
sudo systemctl restart NetworkManager
```

Connect to a WiFi network:

```sh
nmcli device wifi list

sudo nmcli connection add type wifi ifname wlan0 con-name "MobiLink" ssid "MobiLink"
sudo nmcli connection modify "MobiLink" wifi-sec.key-mgmt wpa-psk
sudo nmcli connection modify "MobiLink" wifi-sec.psk "<MobiLinkPassword>"
sudo nmcli connection modify "MobiLink" connection.autoconnect yes
sudo nmcli connection up "MobiLink"

ip a show wlan0
ping 8.8.8.8
```

Reference:

- https://huggingface.co/docs/lerobot/unitree_g1#optional-enable-wifi-on-the-robot
