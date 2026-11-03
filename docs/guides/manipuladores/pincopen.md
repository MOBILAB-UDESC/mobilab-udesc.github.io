---
id: pincopen
title: Pinc'Open
description: Garra paralela open source e de baixo custo, com ponte para o software da garra Unitree Dex1.
slug: /guides/manipuladores/pincopen
---

> Repositório: [MOBILAB-UDESC/PincOpen](https://github.com/MOBILAB-UDESC/PincOpen)

O Pinc'Open é uma garra paralela open source e de baixo custo, acionada por um servo **Feetech STS3215**. O repositório do MobiLab é um fork do [Pinc'Open da Pollen Robotics](https://github.com/pollen-robotics/PincOpen), derivado da garra do Reachy 2. Projeto, lista de materiais, arquivos CAD e guia de montagem estão no [README original](https://github.com/pollen-robotics/PincOpen#readme).

<div align="center">
  <img src="/img/guides/pincopen/pincopen_open_close.gif" alt="Pinc'Open abrindo e fechando" width="360" />
</div>

## O que o fork adiciona

- Um notebook para configurar e testar o motor Feetech.
- Uma ponte (`dex1_bridge/`) que permite controlar a garra com o software da garra Unitree Dex1, por exemplo `xr_teleoperate --ee dex1`. A ponte publica nos mesmos tópicos DDS do [serviço Dex1_1 da Unitree](https://github.com/unitreerobotics/dex1_1_service): `rt/dex1/<right|left>/cmd` e `/state`, com `q = 0` fechada e `q = 5.4` rad aberta.

## Hardware

<img src="/img/guides/pincopen/pincopen_setup.jpg" alt="Pinc'Open conectado ao adaptador de servo serial da Waveshare" width="600" />

Conecte o motor por um adaptador de servo serial Feetech/Waveshare e **alimente o adaptador**: só a USB não alimenta o servo.

As instruções de configuração do motor e de uso da ponte Dex1 estão no [README do repositório](https://github.com/MOBILAB-UDESC/PincOpen#readme).

## Licença

Baseado no [Pinc'Open](https://github.com/pollen-robotics/PincOpen) da Pollen Robotics, licenciado sob [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
