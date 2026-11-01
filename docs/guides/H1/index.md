---
id: index
title: Unitree H1-2
description: Guias para ligar, operar e desenvolver com o robô humanoide Unitree H1-2 no MobiLab UDESC.
slug: /guides/H1
---

> Antes de começar, [leia o manual oficial do H1-2](https://support.unitree.com/home/en/H1_developer/About_H1-2)!

O robô do laboratório é um **Unitree H1-2** (hostname do PC4: `unitree-h1-2-pc4`). O H1-2 é uma versão atualizada do H1 original, com mais graus de liberdade nos braços e nas pernas. A documentação oficial da Unitree cobre os dois modelos no mesmo [guia de desenvolvimento do H1](https://support.unitree.com/home/en/H1_developer): quando houver uma página específica "H1-2", use ela.

## Componentes

O H1-2 tem **27 graus de liberdade**, um motor por junta:

- **Braço (×2):** 7 graus de liberdade (ombro em três eixos, cotovelo em dois eixos e punho em dois eixos).
- **Perna (×2):** 6 graus de liberdade (quadril em três eixos, joelho e tornozelo em dois eixos).
- **Cintura:** 1 grau de liberdade.

<img src="/img/guides/unitree-h1/h1-2-components.png" alt="Nomes dos componentes e juntas do Unitree H1-2" width="800" />

## Interfaces elétricas

As interfaces elétricas ficam no lado direito do robô: conexões dos motores, periféricos e sensores e portas Ethernet, usadas para depuração e desenvolvimento.

**Atenção:** é proibido conectar ou desconectar qualquer conector de aviação com o robô ligado (hot swap). Isso pode danificar o equipamento e não é coberto pela garantia.

<img src="/img/guides/unitree-h1/h1-2-electrical-interfaces.png" alt="Interfaces elétricas no lado direito do Unitree H1-2" width="600" />

## Computadores embarcados

| | PC1: controle de movimento | PC4: desenvolvimento |
| --- | --- | --- |
| CPU | Intel i5-1235U | Intel i7-1255U / i7-1265U |
| Memória | 8 GB LPDDR5 | 16 GB ou 32 GB LPDDR5 |
| Armazenamento | 500 GB ou mais | 500 GB ou mais |
| IP | sem acesso do usuário | `192.168.123.164` |

O PC1 roda os programas de controle de movimento da Unitree e não pode ser usado. Todo o desenvolvimento é feito no PC4. Veja [Conectando com ethernet](/guides/H1/conectando-ethernet).

## Sensores

- **Lidar Livox MID-360** na cabeça. IP `192.168.124.20` (em versões antigas, `192.168.123.120`).
- **Câmera de profundidade Intel RealSense D435** na cabeça.

## Numeração e limites das juntas

A ordem das juntas é a usada pelo SDK (índice do motor em `LowCmd`/`LowState`).

| Nº | Junta | Limites (rad) | Nº | Junta | Limites (rad) |
| --- | --- | --- | --- | --- | --- |
| 0 | `left_hip_yaw` | -0.43 ~ +0.43 | 6 | `right_hip_yaw` | -0.43 ~ +0.43 |
| 1 | `left_hip_pitch` | -3.14 ~ +2.5 | 7 | `right_hip_pitch` | -3.14 ~ +2.5 |
| 2 | `left_hip_roll` | -0.43 ~ +3.14 | 8 | `right_hip_roll` | -3.14 ~ +0.43 |
| 3 | `left_knee` | -0.26 ~ +2.05 | 9 | `right_knee` | -0.26 ~ +2.05 |
| 4 | `left_ankle_pitch` | -0.897 ~ +0.524 | 10 | `right_ankle_pitch` | -0.897 ~ +0.524 |
| 5 | `left_ankle_roll` | -0.262 ~ +0.262 | 11 | `right_ankle_roll` | -0.262 ~ +0.262 |
| 12 | `torso` | -3.14 ~ +1.57 | | | |
| 13 | `left_shoulder_pitch` | -3.14 ~ +1.57 | 20 | `right_shoulder_pitch` | -1.57 ~ +3.14 |
| 14 | `left_shoulder_roll` | -0.38 ~ +3.4 | 21 | `right_shoulder_roll` | -3.4 ~ +0.38 |
| 15 | `left_shoulder_yaw` | -3.01 ~ +2.66 | 22 | `right_shoulder_yaw` | -2.66 ~ +3.01 |
| 16 | `left_elbow_pitch` | -2.53 ~ +1.6 | 23 | `right_elbow_pitch` | -1.6 ~ +2.53 |
| 17 | `left_elbow_roll` | -2.967 ~ +2.967 | 24 | `right_elbow_roll` | -2.967 ~ +2.967 |
| 18 | `left_wrist_pitch` | -0.471 ~ +0.349 | 25 | `right_wrist_pitch` | -0.471 ~ +0.349 |
| 19 | `left_wrist_yaw` | -1.012 ~ +1.012 | 26 | `right_wrist_yaw` | -1.012 ~ +1.012 |

<img src="/img/guides/unitree-h1/h1-2-joint-numbering.png" alt="Numeração das juntas do Unitree H1-2" width="800" />

## Guias

1. [Ligando e desligando](/guides/H1/ligando-desligando)
2. [Conectando com ethernet](/guides/H1/conectando-ethernet)

### Mão Dex5-1

[Especificações, instalação e controle da mão Dex5-1](/guides/H1/dex5-1)

Para acessar o PC4 sem senha, veja [SSH aliases](/guides/ferramentas/ssh-aliases) em Ferramentas.

## Referências

[Documentação e repositórios externos](/guides/H1/referencias)
