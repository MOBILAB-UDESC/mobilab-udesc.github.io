---
title: Controlando o Robo pelo SDK
---

Antes de executar qualquer comando remotamente, precisamos colocar o robo no estado correto. Como estamos usando um Unitree G1 EDU+ com controle R3-1, faca:

- L2 + B para colocar o robo em dumping.
- L2 + UP para colocar o robo em ready.
- R2 + A para entrar em motion state.
- Start para toggle stand/walk.

---

## Safe controller sequence

1. Confirm controller link.
2. Keep joysticks centered.
3. Do not press L2 + B again.
4. Enter ready state.
5. Enter motion state.
6. Toggle stand/walk.
7. Test motion minimally.

Details:

- Remote is powered on.
- Right "DL" indicator is on. The G1 manual says this indicates the remote is connected to the robot's data transmission module.
- Do not touch the sticks while switching states.
- Have one person near the robot, ready to support it at the shoulders.
- Use the safety rope or support frame if available.
- On R3-1 / newer G1 docs, L2 + B is damping mode. It is the soft emergency stop.
- Use L2 + B only if the robot becomes unstable or enters an unexpected state.
- For ready state: hold L2, tap UP, and release both.
- Expected ready result: the robot should move into a neutral ready posture.
- For motion state: press R2 + A.
- Expected motion result: the control program starts, and G1 transitions from ready state to motion state.
- For stand/walk: press START once.
- Left stick: tiny forward/back or lateral input.
- Right stick: tiny yaw input.
- Release sticks immediately and verify it stops.

## Practical state machine

```text
Zero torque / booted
        |
        |  L2 + B  only if needed to enter damping/unlock
        v
Damping
        |
        |  L2 + UP
        v
Ready / neutral posture
        |
        |  R2 + A
        v
Motion state
        |
        |  START
        v
Stand <-> walk toggle
```

## Important mismatch to know

Older G1 manuals mention L1 + A for damping, L1 + UP for ready, and R2 + X or R1 + X for operation control. Your R3-1 mapping is different: damping is L2 + B, ready is L2 + UP, and motion start is R2 + A. Use the controller sticker / R3-1 mapping over the older manual.

## Run the demo

- https://github.com/MOBILAB-UDESC/unitree-g1#2-run-the-host-demo
- https://support.unitree.com/home/en/developer/Get_remote_control_status
