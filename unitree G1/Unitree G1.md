> Antes de começar, [leia o manual oficial](https://support.unitree.com/home/en/G1_developer/about_G1)!

1. [[Unitree G1 - ligando o robô]]
2. [[Unitree G1 - conectando no robô com Ethernet]]

## Initial checks

Check if robot is sending UDP packages:
```
sudo timeout 20 tcpdump -ni enp194s0 -e -vv 'host 192.168.123.161 and udp'
```

Change the firewall rules. Allow robot traffic on the Eth interface (this made me lost ~1 hour debugging :~( )
```
sudo ufw allow in on enp194s0 from 192.168.123.0/24
sudo ufw allow out on enp194s0 to 192.168.123.0/24

sudo ufw reload
sudo ufw status verbose
```

## Configuring host machine project

```
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
uv --version

sudo apt update
sudo apt install -y git cmake build-essential net-tools nmap arping ethtool
```

Create the project. LeRobot's current G1 guide uses Python 3.12 for the Unitree G1 environment, and Unitree's Python SDK requires Python >= 3.8 plus `cyclonedds==0.10.2` (https://huggingface.co/docs/lerobot/unitree_g1):

```
mkdir -p ~/Developer/unitreeG1
cd ~/Developer/unitreeG1

uv inituv python install 3.10
uv python pin 3.10 
 
uv add "numpy==2.2.6" "cyclonedds==0.10.2" "opencv-python"  
uv sync

git clone https://github.com/unitreerobotics/unitree_sdk2_python.git src/unitree_sdk2_python  
uv pip install --python .venv/bin/python --no-deps -e ./src/unitree_sdk2_python
```

Check the install:
```
uv run python --version
uv run python -c "import cyclonedds; print('cyclonedds ok')"
uv run python -c "import unitree_sdk2py; print('unitree_sdk2py ok')"
```

```
Python 3.10.x  
cyclonedds ok  
unitree_sdk2py ok
```

## Read low state data from the robot

Run it:
```
source scripts/g1_env.sh
uv run python scripts/probe_g1_lowstate_callback.py "$G1_IFACE" 0
```

You're going to see a log like this:

```
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

--- rt/lowstate [hg] ---
messages: 1073
mode_machine: 6
tick: 7594337
motor[0].q:  0.09887699037790298
motor[0].dq: 0.00436332356184721
imu gyro:  [0.0017453291220590472, -0.00523598724976182, 0.00872664526104927]
imu accel: [-0.09000000357627869, -0.029999999329447746, 9.6899995803833]

--- rt/lf/lowstate [hg] ---
messages: 21
mode_machine: 6
tick: 7594333
motor[0].q:  0.09887699037790298
motor[0].dq: -0.007635816000401974
imu gyro:  [0.00523598724976182, -0.00872664526104927, 0.01047197449952364]
imu accel: [-0.12999999523162842, -0.009999999776482582, 9.760000228881836]

--- rt/lowstate [hg] ---
messages: 2129
mode_machine: 6
tick: 7595342
motor[0].q:  0.09887699037790298
motor[0].dq: -0.005454154219478369
imu gyro:  [0.0017453291220590472, -0.00523598724976182, 0.00523598724976182]
imu accel: [-0.14000000059604645, 0.0, 9.6899995803833]

--- rt/lf/lowstate [hg] ---
messages: 41
mode_machine: 6
tick: 7595321
motor[0].q:  0.09888551384210587
motor[0].dq: 0.01308997068554163
imu gyro:  [0.0, -0.012217302806675434, 0.01047197449952364]
imu accel: [-0.05999999865889549, 0.009999999776482582, 9.6899995803833]
```

## Run a clean read-only logger

Run:

```
source scripts/g1_env.sh
uv run python scripts/read_g1_state.py "$G1_IFACE"
```

Expected:

```
hz=1000.x tick=... mode_machine=6 q0=... dq0=... imu_accel=[...]
```


## TIPS

 You had multiple Python DDS processes listening simultaneously. Kill them before future tests:

```
pkill -f probe_g1_lowstate
pkill -f read_g1_lowstate
ss -lunp | grep python || true
```



# Referências

Unitree G1 Guides
- https://support.unitree.com/home/en/G1_developer/about_G1
- https://github.com/unitreerobotics/unitree_guide
- https://docs.quadruped.de/projects/g1

Unitree G1 Control
- https://github.com/unitreerobotics/unitree_ros2
- https://github.com/unitreerobotics/unitree_sdk2_python

Unitree G1 Teleoperation
- https://support.unitree.com/home/en/Teleoperation/avp_teleoperate
- https://github.com/unitreerobotics/xr_teleoperate

Unitree G1 Machine Learning
- https://github.com/unitreerobotics/unitree_lerobot
- https://github.com/unitreerobotics/unifolm-vla
- https://huggingface.co/unitreerobotics
- https://huggingface.co/docs/lerobot/unitree_g1
- 