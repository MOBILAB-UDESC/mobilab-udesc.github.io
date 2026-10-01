---
title: GORT quick start with DEX3
description: Run teleoperation on GORT, the configured Unitree G1 with DEX3 hands, using Meta Quest over Wi-Fi.
---

This quick start is for **GORT**, MobiLab's Unitree G1 robot with DEX3 hands.

## 1. Connect to the G1

If Wi-Fi is already connected and you know the robot's IP, connect directly with SSH and continue to step 2.

### Otherwise, connect via Ethernet

Connect the notebook to the G1 with an Ethernet cable and enable the notebook's Ethernet connection on the G1's subnet, as described in [Connecting via Ethernet](/guides/G1/configuracao-inicial/conectando-ethernet). Then open an SSH session:

```sh
ssh unitree@192.168.123.164
```

### Enable Wi-Fi on the G1

In the SSH session on the G1, activate the saved Wi-Fi connection and find its IP:

```sh
sudo nmcli connection up "MobiLab5G"
ip -4 addr show wlan0
```

Use the saved connection name for your network. If it has not been configured yet, follow [Enabling Wi-Fi](/guides/G1/configuracao-inicial/ativando-wifi).

The address after `inet` is the robot's Wi-Fi IP. For example, `192.168.50.113/24` means the IP is `192.168.50.113`. It can change between sessions.

Connect the notebook and Meta Quest to the same Wi-Fi network as the G1. From the notebook, verify SSH over Wi-Fi before disconnecting Ethernet:

```sh
ssh unitree@192.168.50.113
```

Replace `192.168.50.113` in the commands below with the robot's current Wi-Fi IP.

## 2. Put the G1 in motion mode

On the G1's remote controller, use this sequence:

1. `L2 + B` to enter damping.
2. `L2 + UP` to enter ready.
3. `R2 + A` to enter motion.

## 3. Start the camera server on the G1

In the first SSH terminal, run:

```sh
conda activate teleimager
cd ~/teleimager
./run_realsense_server.sh
```

Use the directory where `run_realsense_server.sh` is installed if it differs from `~/teleimager`. Leave this terminal running.

## 4. Start teleoperation on the G1

Open a second terminal on the notebook and connect to the G1, then run:

```sh
conda activate g1
cd ~/Teleoperacao/xr_teleoperate/teleop/
python teleop_hand_and_arm.py --display-mode ego --img-server-ip 192.168.50.113 --input-mode hand --ee dex3 --motion
```

For the G1 with DEX3 hands, include both `--input-mode hand` and `--ee dex3`. The `--motion` flag uses the motion mode selected in step 2. Leave this terminal running too.

## 5. Connect the Meta Quest and start

In the Quest browser, open `https://192.168.50.113:8012`, using the G1's current Wi-Fi IP. If the browser shows a warning for the configured self-signed certificate, proceed to the page.

Wait for `websocket is connected` to appear in the teleoperation terminal. Then press `r` in that terminal to start synchronizing the robot with your movements.

To finish, press `q` in the teleoperation terminal, then `Ctrl+C` in the camera-server terminal.
