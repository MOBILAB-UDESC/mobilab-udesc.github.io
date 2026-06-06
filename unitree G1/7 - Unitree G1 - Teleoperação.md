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

## Generate Quest-compatible certificates on the host

The Quest connects through HTTPS/WSS to the host on port `8012`, and Unitree's setup explicitly requires SSL certificates for Quest/Pico/AVP browser access.

Run `scripts/teleoperation/g1_config_televuer_tls.sh` to generate the certificate.



