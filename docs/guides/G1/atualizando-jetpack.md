---
title: Updating JetPack
description: How to upgrade the Unitree G1 EDU Jetson Orin NX from JetPack 5.1.1 to JetPack 6.2.2 in Super mode.
---

The G1 EDU development computer (Jetson Orin NX 16 GB, in the chest) ships with **JetPack 5.1.1**. You can upgrade it to **JetPack 6.2.2 in Super mode**, which gives about 30% more GPU and 50% more DLA inference speed.

:::warning
This erases and reflashes the development computer. Make the full backup first.
:::

## Summary

1. **Prepare a host:** an x86_64 Ubuntu laptop with 60 GB free, Ethernet to the robot, and a USB-C **data** cable plugged straight into the laptop.
2. **Build the BSP:** clone [unitree-jetpack](https://github.com/legion1581/unitree-jetpack) (branch `g1`) and run `init`.
3. **Back up:** put the Jetson in recovery mode and run `backup`.
4. **Flash:** in recovery mode, run `flash all` with `--super`. It takes about 25 minutes.
5. **First boot:** never accept the "Software Updater". Run `apt-mark hold` on all `nvidia-l4t-*` packages **before** connecting to Wi-Fi.
6. **Install CUDA, cuDNN and TensorRT:** `apt-get install nvidia-jetpack`, keeping the L4T packages pinned to 36.5.0.
7. **Pick a power mode** with `nvpmodel`: `-m 0` (MAXN_SUPER) or `-m 4` (40 W).

For the exact commands, benchmarks and troubleshooting, follow the full guide:
[MOBILAB-UDESC/g1-jetpack6-super-guide](https://github.com/MOBILAB-UDESC/g1-jetpack6-super-guide).
