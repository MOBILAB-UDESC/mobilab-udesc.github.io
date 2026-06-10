---
title: Host Setup
---

## Initial checks

Check if robot is sending UDP packages:

```sh
sudo timeout 20 tcpdump -ni enp194s0 -e -vv 'host 192.168.123.161 and udp'
```

Change the firewall rules. Allow robot traffic on the Eth interface (this made me lost ~1 hour debugging :~( )

```sh
sudo ufw allow in on enp194s0 from 192.168.123.0/24
sudo ufw allow out on enp194s0 to 192.168.123.0/24

sudo ufw reload
sudo ufw status verbose
```

## Configuring host machine project

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
uv --version

sudo apt update
sudo apt install -y git cmake build-essential net-tools nmap arping ethtool
```

Create the project. LeRobot's current G1 guide uses Python 3.12 for the Unitree G1 environment, and Unitree's Python SDK requires Python >= 3.8 plus `cyclonedds==0.10.2` (https://huggingface.co/docs/lerobot/unitree_g1):

```sh
mkdir -p ~/Developer/unitreeG1
cd ~/Developer/unitreeG1

uv init
uv python install 3.10
uv python pin 3.10

uv add "numpy==2.2.6" "cyclonedds==0.10.2" "opencv-python"
uv sync

git clone https://github.com/unitreerobotics/unitree_sdk2_python.git src/unitree_sdk2_python
uv pip install --python .venv/bin/python --no-deps -e ./src/unitree_sdk2_python
```

Check the install:

```sh
uv run python --version
uv run python -c "import cyclonedds; print('cyclonedds ok')"
uv run python -c "import unitree_sdk2py; print('unitree_sdk2py ok')"
```

```text
Python 3.10.x
cyclonedds ok
unitree_sdk2py ok
```

## Read low state data from the robot

Run it:

```sh
source scripts/g1_env.sh
uv run python scripts/probe_g1_lowstate_callback.py "$G1_IFACE" 0
```

You're going to see a log like this:

```text
Initializing DDS domain=0, iface=enp194s0
subscribed: rt/lowstate [hg]
subscribed: rt/lf/lowstate [hg]
subscribed: rt/lowstate [go]
subscribed: rt/lf/lowstate [go]
Waiting for callbacks. Read-only. No publishers created.
Press Ctrl+C to stop.

--- rt/lowstate [hg] ---
messages: 12
mode_machine: 6
tick: 7593330
motor[0].q:  0.09887699037790298
motor[0].dq: -0.005454154219478369
imu gyro:  [0.0017453291220590472, -0.006981316488236189, 0.0]
imu accel: [-0.09000000357627869, -0.05000000074505806, 9.670000076293945]
```

## Run a clean read-only logger

Run:

```sh
source scripts/g1_env.sh
uv run python scripts/read_g1_state.py "$G1_IFACE"
```

Expected:

```text
hz=1000.x tick=... mode_machine=6 q0=... dq0=... imu_accel=[...]
```

## TIPS

You had multiple Python DDS processes listening simultaneously. Kill them before future tests:

```sh
pkill -f probe_g1_lowstate
pkill -f read_g1_lowstate
ss -lunp | grep python || true
```
