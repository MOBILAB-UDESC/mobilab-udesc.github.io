---
title: Projects
hide_table_of_contents: true
sidebar_label: Projects
description: Sagan robot and MobiLab projects with Joinville's firefighters and Infrastructure Department.
slug: /mobilab/projetos
---

<div className="academic-overview">
<section>

## Sagan robot

Sagan is a four-wheeled mobile robot developed at MobiLab. Each wheel has its own drive motor and its own steering joint, so the robot can steer all four wheels independently. It is built for autonomous navigation and mapping, and its software runs on ROS 2 with a Gazebo simulation that shares the same description and launch files as the real robot.

- **Control:** a ros2_control hardware interface talks over I2C to two microcontroller boards, one per side, that drive the wheels and read motor current. A drive controller handles the four wheel and steering commands.
- **Sensing and state estimation:** a 2D lidar and an MPU9250 IMU (with magnetometer calibration), fused with wheel odometry in an extended Kalman filter.
- **Navigation:** Nav2 and SLAM Toolbox for mapping and planning, frontier-based autonomous exploration, and a Kanayama path-tracking controller exposed as a ROS 2 action that follows a path of waypoints.

<p className="academic-meta">
  <a href="https://github.com/MOBILAB-UDESC/sagan_workspace">Code on GitHub</a>
</p>

</section>
<section>

## Firefighters

Proposed use of quadruped robots in search, rescue, and firefighting with the Joinville Volunteer Fire Department. Applications include locating people, pulling loads, and controlling fire nozzles.

<p className="academic-meta">
  <a href="https://www.udesc.br/cct/noticia/bombeiros_voluntarios_conhecem_os_robos_da_udesc_joinville">UDESC report, February 5, 2026</a>
</p>

</section>
<section>

## Joinville's Infrastructure Department

Proposed use of the Unitree B2W to inspect urban tunnels and underground drainage systems with Joinville's Infrastructure Department. The project aims to collect visual and spatial data in places where human access is difficult or hazardous.

<p className="academic-meta">
  <a href="https://www.udesc.br/noticia/udesc_joinville_recebe_cinco_novos_robos_chineses">UDESC announcement, December 2, 2025</a>
</p>

</section>
</div>
