---
title: Conhecendo a Arquitetura do Robo
---

The Unitree proprietary software stack runs on the onboard locomotion computer. It is responsible for low-level control of the robot, including motor control, sensor data processing, and communication with the development computer. It exposes a set of APIs for users to interact with the robot using the CycloneDDS middleware. The `unitree_sdk2` allows you to talk with the locomotion computer directly using DDS. Since CycloneDDS and ROS2 are compatible at the DDS level, you can also use the ROS2 package `unitree_ros2` to communicate with the robot. The relationship between the different software components is illustrated in the diagram below:

<img src="/img/5-unitree-g1-arquitetura-1779642811598.webp" alt="Arquitetura de software do Unitree G1" width="500" />

The `unitree_sdk2` C++ library and `unitree_ros2` ROS2 package are used to access the robot "built-in" functionalities. **From the programming perspective, the robotic hands and other peripherals such as the Livox Lidar are treated as third-party add-ons. As a result, you will have to set up the driver for each peripheral separately.**

Another concept you may encounter when working with the SDK or ROS driver is the "high-level" and "low-level" control. The high-level control refers to the control of the robot as a whole, while the low-level control refers to the control of each joint or motor individually. The `unitree_sdk2` and `unitree_ros2` packages provide both high-level and low-level APIs for controlling the robot. Note that the "high-level" control for the G1 robot is mainly for lower-body joints and it's the Unitree locomotion controller that takes care of the low-level control to keep the robot balanced and be capable of dynamic movements (with a limited number of pre-defined upper-body motions). For the upper-body joints, you will have to implement your own low-level control algorithms. From the programming perspective, if you want to utilize the Unitree locomotion controller, you can think of the G1 robot as a mobile manipulation platform that has two arms installed on top of a mobile base that moves with legs. Of course, you can also develop your own controller that coordinates all joints together to take full advantage of the robot's capabilities with a full low-level control setup.

With the high-level and low-level control concept in mind, you may have realized that there are possibilities when conflicting commands are sent to the robot. For example, if both Unitree's locomotion controller and your own controller are trying to control the same joint, the result may be unpredictable. This may be better safeguarded by the Unitree software in future releases. For now, you should be mindful of this issue and implement your control behavior carefully.

<img src="/img/5-unitree-g1-arquitetura-1779642973724.webp" alt="Fluxo de controle do Unitree G1" width="500" />

Unitree provides a way to disable its locomotion controller by getting the robot into **Debug Mode**. This allows user to take full control of the robot.

- When G1 is suspended and in damping state, press the remote control L2 + R2 combination, G1 will enter debug mode.
- Now press L2 + A, G1 will enter the position mode and pose a specific diagnostic position.
- You can press L2 + B to let G1 to enter the damping state again. You may use this to confirm whether G1 has successfully entered debug mode.

<img src="/img/5-unitree-g1-arquitetura-1779643010598.webp" alt="Controle remoto do Unitree G1" width="500" />

<img src="/img/5-unitree-g1-arquitetura-1779643015168.webp" alt="Modo de debug do Unitree G1" width="500" />

## Run the First Example

With the background information described in the previous sections, you should be ready to run your first example on the robot. We will use the [Quick Development](https://support.unitree.com/home/en/G1_developer/quick_development) example provided by Unitree as a case study. This example demonstrates how to run the ankle swing low-level control example (`g1_ankle_swing_example`) from the `unitree_sdk2` library on the G1 robot. You should still refer to that page for the detailed instructions. The rest of this section will provide complementary information to help you relate the example to the concepts discussed in the previous sections.

You can run this example on the development computer or on an external computer. The following diagram illustrates the two options:

<img src="/img/5-unitree-g1-arquitetura-1779643233395.webp" alt="Opcoes de execucao de exemplos no Unitree G1" width="500" />
