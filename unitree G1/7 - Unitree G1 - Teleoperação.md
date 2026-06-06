Target architecture

```
Quest 3 browser
  |
  | Wi-Fi
  v
Wi-Fi router/AP
  |
  | Ethernet LAN, same subnet preferred
  |
  +-- Ubuntu host
  |     enp194s0 = 192.168.123.X
  |     runs xr_teleoperate / Vuer / SDK2 DDS
  |
  +-- Unitree G1 PC2
        usually 192.168.123.164
        runs teleimager camera server
```

Teleoperation scripts are stored in the main unitree G1 repository:
https://github.com/MOBILAB-UDESC/unitree-g1

## Configuring Meta Quest 3
https://github.com/unitreerobotics/xr_teleoperate/wiki/XR_Device

Enable Developer Mode for the Quest 3 In the Meta Horizon mobile app:
Devices -> your Quest 3 -> Headset settings -> Developer Mode -> ON

## Install adb on the host computer

```
apt-get install adb
```

List devices

```
sudo adb devices
List of devices attached
2G0YC5ZG6P005M  unauthorized
```

1. Put on the Quest 3 while it is plugged in.
2. Look for the prompt: Allow USB debugging?
3. Select Always allow from this computer if available.
4. Press Allow.
5. Run again:
sudo adb devices
Expected:
2G0YC5ZG6P005M    device

Start ADB port reverse forwarding by executing:

sudo adb -s 2G0YC5ZG6P005M reverse tcp:8012 tcp:8012

You can verify the result using:

```shell
$ sudo adb -s 2G0YC5ZG6P005M reverse --list
UsbFfs tcp:8012 tcp:8012
```

Configure local HTTPS using a self-signed certificate, this step fuction same as [2.2.3 create certificate](https://github.com/unitreerobotics/avp_teleoperate)

```shell
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

## Configuring router
Based on https://github.com/unitreerobotics/xr_teleoperate/wiki/Router_Device
https://github.com/unitreerobotics/xr_teleoperate/wiki/Network

Good expected Wi-Fi condition:
5GHz
80MHz or 160MHz width
signal around -50 dBm or better
low channel overlap

Add to file packages/unitree_sdk2_python/unitree_sdk2py/core/channel_config.py

```
ChannelConfigAutoDetermine = '''<?xml version="1.0"?>
<CycloneDDS>
  <Domain Id="any">
    <General>
      <Interfaces>
        <NetworkInterface autodetermine="true"/>
      </Interfaces>
      <AllowMulticast>spdp</AllowMulticast>
      <DontRoute>true</DontRoute>
    </General>
    <Discovery>
      <Peers>
        <Peer Address="192.168.123.161"/>
        <Peer Address="192.168.123.164"/>
      </Peers>
    </Discovery>
  </Domain>
</CycloneDDS>'''****
```

This change matters because your PC has multiple network interfaces on the same subnet:
enp194s0 = 192.168.123.2
wlp195s0 = 192.168.123.106
Without explicit DDS config, discovery can pick the wrong interface or route inconsistently.

Setup Plan
 1. Confirm the router model and that it supports Wi-Fi 6 or better.
 2. Configure router 5GHz as described above.
 3. Connect your PC to the router Wi-Fi.
 4. Connect Quest 3 to the same 5GHz router Wi-Fi.
 5. Keep robot/network devices on the same 192.168.123.x network.
 6. Apply the guide’s channel_config.py change in the local vendored SDK.
 7. Reinstall/editable sync if needed:
uv pip install -e packages/unitree_sdk2_python
 8. Verify Python SDK still imports:
uv run python -c "import cyclonedds, unitree_sdk2py; print('ok')"
 9. Test robot discovery using the known interface:
uv run python scripts/g1_monitor_fsm.py enp194s0

## add Unitree camera

Para usar a realsense, use a porta USB 9
https://support.unitree.com/home/en/G1_developer
https://github.com/unitreerobotics/xr_teleoperate/wiki/Camera_and_Image
![[Pasted image 20260606144952.png]]

$ rs-enumerate-devices
Device info: 
    Name                          : 	Intel RealSense D435I
    Serial Number                 : 	406122071162
    Firmware Version              : 	05.15.01.55
    Recommended Firmware Version  : 	05.13.00.50
    Physical Port                 : 	/sys/devices/platform/3610000.xhci/usb2/2-3/2-3:1.0/video4linux/video0
    Debug Op Code                 : 	15
    Advanced Mode                 : 	YES
    Product Id                    : 	0B3A
    Camera Locked                 : 	YES

## Host config
Following https://github.com/unitreerobotics/xr_teleoperate

Install the packages (did on the unitreeg1 project):

git submodule add https://github.com/unitreerobotics/xr_teleoperate.git packages/xr_teleoperate
git submodule update --init --recursive

Follow the instalations. Although we have been using uv, for the xr teleoperate follow the conda recommendations:

https://github.com/unitreerobotics/xr_teleoperate#1--installation


## Unitree config

### copy keys

Use ssh to create the config directory on PC2, then scp both files.
From your host:
ssh unitree@192.168.123.164 'mkdir -p ~/.config/xr_teleoperate'
scp /home/alfakini/Developer/unitreeG1/cert.pem /home/alfakini/Developer/unitreeG1/key.pem unitree@192.168.123.164:~/.config/xr_teleoperate/
Then verify on PC2:
ssh unitree@192.168.123.164 'ls -l ~/.config/xr_teleoperate/'
Expected:
cert.pem
key.pem
If PC2’s teleimager directory also expects the files directly there:
scp /home/alfakini/Developer/unitreeG1/cert.pem /home/alfakini/Developer/unitreeG1/key.pem unitree@192.168.123.164:~/teleimager/

### install packages

These notes summarize the installation performed on this machine so it can be reproduced on another Unitree/Jetson-style Ubuntu system.

Environment
- Machine architecture: `aarch64`
- Kernel/platform: NVIDIA Tegra / Jetson-style Ubuntu
- Repository path: `/home/unitree/teleimager`
- Conda install path: `/home/unitree/miniconda3`
- Conda environment: `teleimager`
- Python version: `3.10`

#### 1. Install Miniconda

```bash
mkdir -p /tmp/opencode
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh -O /tmp/opencode/miniconda.sh
bash /tmp/opencode/miniconda.sh -b -u -p /home/unitree/miniconda3
rm /tmp/opencode/miniconda.sh
```

If Conda requires channel Terms of Service acceptance, run:

```bash
/home/unitree/miniconda3/bin/conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main
/home/unitree/miniconda3/bin/conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r
```

Initialize Conda for bash:

```bash
/home/unitree/miniconda3/bin/conda init bash
source ~/.bashrc
```

## 2. Create Tele Imager Environment

```bash
/home/unitree/miniconda3/bin/conda create -n teleimager python=3.10 -y
conda activate teleimager
```

## 3. Install System Packages

`libusb-1.0-0-dev` was already installed on this machine. `libturbojpeg-dev` was not installed because sudo required an interactive password prompt.

Run this locally with sudo access:

```bash
sudo apt update
sudo apt install -y libusb-1.0-0-dev libturbojpeg-dev
```

> NOTE: if needed, refresh the keys for apt
> sudo apt install curl gnupg -y
curl -fsSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo gpg --dearmor -o /tmp/ros-archive-keyring.gpg
sudo mv /tmp/ros-archive-keyring.gpg /usr/share/keyrings/ros-archive-keyring.gpg
> curl -fsSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -
sudo apt update

## 4. Install Tele Imager

The repository already existed at `/home/unitree/teleimager`.

```bash
cd /home/unitree/teleimager
/home/unitree/miniconda3/envs/teleimager/bin/python -m pip install -e ".[server]"
```

## 5. Dependency Fix Applied

The current latest `logging_mp` package exposes `getLogger`, but Tele Imager `1.5.0` calls `get_logger`. This caused both `teleimager-server` and `teleimager-client` to fail at startup.

The local `pyproject.toml` was updated from:

```toml
"logging_mp",
```

to:

```toml
"logging_mp==0.1.6",
```

Then the editable install was refreshed:

```bash
cd /home/unitree/teleimager
/home/unitree/miniconda3/envs/teleimager/bin/python -m pip install -e ".[server]"
```

## 6. UVC Permissions

The user is already in the `video` group, but the UVC udev rule was not installed because sudo required an interactive password prompt.

Run this locally with sudo access:

```bash
cd /home/unitree/teleimager
bash setup_uvc.sh
```

This installs `/etc/udev/rules.d/10-libuvc.rules`, reloads udev rules, and attempts to reload the `uvcvideo` driver.

## 7. Verification

Verify command availability:

```bash
/home/unitree/miniconda3/envs/teleimager/bin/teleimager-server --help
/home/unitree/miniconda3/envs/teleimager/bin/teleimager-client --help
```

Run camera discovery:

```bash
cd /home/unitree/teleimager
/home/unitree/miniconda3/envs/teleimager/bin/python -m teleimager.image_server --cf
```

The command ran successfully. It may still log this if `setup_uvc.sh` has not been run:

```text
Failed to reload driver: Command 'sudo modprobe -r uvcvideo' returned non-zero exit status 1.
```

That error is from the sudo-only driver reload step; discovery can still continue.

## 8. RealSense Note

An Intel RealSense D435i was detected in normal discovery at one point. RealSense mode requires `pyrealsense2`.

The available pip wheels for `pyrealsense2` on `aarch64` required `GLIBC_2.32`, but this Ubuntu system has an older GLIBC. Tested versions included `2.58.1.10581` and `2.55.1.6486`; both failed with the same GLIBC requirement.

For `teleimager-server --cf --rs` or `teleimager-server --rs`, build/install `librealsense` and its Python bindings locally against this system instead of using the pip wheel.

## 9. Typical Usage

```bash
source ~/.bashrc
conda activate teleimager
cd /home/unitree/teleimager
teleimager-server --cf
```

After filling `cam_config_server.yaml`, start the server:

```bash
teleimager-server
```


---

changes we make to the scripts:

```
(teleimager) unitree@ubuntu:~/teleimager$ git diff
diff --git a/cam_config_server.yaml b/cam_config_server.yaml
index 06c5628..e9494bc 100644
--- a/cam_config_server.yaml
+++ b/cam_config_server.yaml
@@ -21,12 +21,12 @@ head_camera:
   #   - "opencv"    → opencv driver
   #   - "realsense" → pyrealsense2 driver
   #   - "uvc"       → pyuvc driver
-  type: uvc
+  type: opencv

   # Image Format
   # image resolution: [height, width]
-  image_shape: [480, 1280]
-  binocular: true
+  image_shape: [480, 640]
+  binocular: false
   # frame per second
   fps: 30

@@ -43,17 +43,17 @@ head_camera:
   #   - type "realsense": supports serial_number only (but a RealSense can also be used as opencv/uvc if desired)
   #   - type "opencv":    supports video_id, serial_number, physical_path
   #   - type "uvc":       supports video_id, serial_number, physical_path
-  video_id: 0
-  serial_number: 01.00.00
-  physical_path: null
+  video_id: null
+  serial_number: null
+  physical_path: /sys/devices/platform/3610000.xhci/usb2/2-3/2-3:1.3

 # =====================================================
 # Left wrist camera configuration
 # =====================================================
 left_wrist_camera:
-  enable_zmq: true
+  enable_zmq: false
   zmq_port : 55556
-  enable_webrtc: true
+  enable_webrtc: false
   webrtc_port : 60002
   webrtc_codec: h264
   type: uvc
@@ -68,9 +68,9 @@ left_wrist_camera:
 # Right wrist camera configuration
 # =====================================================
 right_wrist_camera:
-  enable_zmq: true
+  enable_zmq: false
   zmq_port : 55557
-  enable_webrtc: true
+  enable_webrtc: false
   webrtc_port: 60003
   webrtc_codec: h264
   type: uvc
@@ -79,4 +79,4 @@ right_wrist_camera:
   fps: 30
   video_id: 4
   serial_number: 200901010002
-  physical_path: null
\ No newline at end of file
+  physical_path: null
diff --git a/pyproject.toml b/pyproject.toml
index 38c1597..3181e2f 100644
--- a/pyproject.toml
+++ b/pyproject.toml
@@ -9,7 +9,7 @@ license = { file = "LICENSE" }
 readme = "README.md"
 requires-python = ">=3.8,<3.11"
 dependencies = [
-    "logging_mp",
+    "logging_mp==0.1.6",
     "opencv-python",
     "numpy>=1.21,<2",
     "pyyaml",
diff --git a/setup_uvc.sh b/setup_uvc.sh
index 47009dc..1cd57ef 100644
--- a/setup_uvc.sh
+++ b/setup_uvc.sh
@@ -31,8 +31,13 @@ MODPROBE_PATH=$(which modprobe)
 echo "ALL ALL=(ALL) NOPASSWD: $MODPROBE_PATH -r uvcvideo, $MODPROBE_PATH uvcvideo debug=*" | sudo tee /etc/sudoers.d/uvc_modprobe > /dev/null
 sudo chmod 0440 /etc/sudoers.d/uvc_modprobe

-# Step 4: reload UVC driver
-sudo $MODPROBE_PATH -r uvcvideo
-sudo $MODPROBE_PATH uvcvideo debug=0
-
-echo "UVC setup completed successfully."
\ No newline at end of file
+# Step 4: reload UVC driver when possible. On Unitree systems, built-in
+# video services may keep uvcvideo active, so setup should not fail here.
+if sudo $MODPROBE_PATH -r uvcvideo; then
+    sudo $MODPROBE_PATH uvcvideo debug=0
+else
+    echo "Warning: uvcvideo is currently in use; skipping driver reload."
+    echo "Stop camera/video services or reboot if you need to reload it."
+fi
+
+echo "UVC setup completed successfully."
diff --git a/src/teleimager/image_server.py b/src/teleimager/image_server.py
index 8e1ccb6..04e22b7 100644
--- a/src/teleimager/image_server.py
+++ b/src/teleimager/image_server.py
@@ -534,7 +534,7 @@ def reload_uvc_driver():
         time.sleep(1)
         logger_mp.info("UVC driver reloaded successfully.")
     except subprocess.CalledProcessError as e:
-        logger_mp.error(f"Failed to reload driver: {e}")
+        logger_mp.warning(f"UVC driver is currently in use; skipping reload: {e}")

 # ========================================================
 # camera finder and cameras
@@ -642,7 +642,7 @@ class CameraFinder:
         try:
             import pyrealsense2 as rs
             return rs
-        except ImportError:
+        except (ImportError, OSError) as e:
             arch = platform.machine()
             system = platform.system()
             print(f"[RealSense] Platform: {system} / {arch}")
@@ -666,6 +666,7 @@ class CameraFinder:
                     "[RealSense] pyrealsense2 not installed. You can try:\n"
                     "    pip install pyrealsense2\n"
                 )
+            msg = f"{msg}\nOriginal import error: {e}"
             raise RuntimeError(msg)

     def _list_realsense_serial_numbers(self):
```

---

```
sudo ufw disable
```

---
#### 10. Autostart

Autostart was not enabled during this install. After camera discovery and server configuration are confirmed, run:

```bash
cd /home/unitree/teleimager
conda activate teleimager
bash setup_autostart.sh
```

### In the unitree


```
pkill -TERM -f teleimager-client
pkill -TERM -f teleimager-server
pkill -f "python.*teleimager-server"
pkill -TERM -f teleimager-server
cd ~/teleimager
conda activate teleimager
./run_realsense_server.sh
```

Kill it
```
pkill -f "python.*teleimager-server"
pkill -TERM -f teleimager-server
```


### In the host 

Start a client from another terminal:

```bash
cd packages/xr_teleoperate/teleop/teleimager
uv run teleimager-client --host 192.168.123.164
```

Kill it
```
pkill -f "python.*teleimager-client"
```

YOU SHOULD SEE THE CAMERA NOW!!!!!


Running teleop

```
cd packages/xr_teleoperate/teleop
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate tv

 python teleop_hand_and_arm.py \
  --input-mode hand \
  --arm G1_29 \
  --record \
  --img-server-ip 192.168.123.164 \
  --network-interface enp194s0
```
