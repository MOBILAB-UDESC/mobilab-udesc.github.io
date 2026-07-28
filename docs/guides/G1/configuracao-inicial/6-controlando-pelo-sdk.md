---
title: Controlando o G1 pelo SDK
---

## Execute o Primeiro Exemplo

Com as informações das seções anteriores, é possível começar a rodar experimentos no robô!

Usaremos o exemplo [Quick Development](https://support.unitree.com/home/en/G1_developer/quick_development) fornecido pela Unitree como estudo de caso. Este exemplo demonstra como executar o controle de baixo nível de balanço do tornozelo (`g1_ankle_swing_example`) da biblioteca `unitree_sdk2` no robô G1.

Consulte a página oficial para instruções detalhadas. Esta seção fornece informações complementares para ajudar você a relacionar o exemplo com os conceitos discutidos nas seções anteriores.

Você pode executar este exemplo no computador de desenvolvimento (PC2) ou em um computador externo (host).

### 1. Coloque o G1 no estado correto

Use o controle R3-1 para colocar o robô no estado de motion:

- `L2 + B` para colocar em damping
- `L2 + UP` para ready
- `R2 + A` para motion state
- `Start` para alternar entre parado e andando

Abra um terminal (A) e inicie o monitor de FSM para acompanhar os estados:

```sh
uv run python scripts/g1_monitor_fsm.py enp194s0
```

Teste o movimento minimamente com o controle:

- Joystick esquerdo: leve entrada para frente/trás ou lateral
- Joystick direito: leve entrada de rotação
- Solte os joysticks imediatamente e verifique se o robô para

O estado confirmado para executar ações nos braços é:

```text
fsm_id=(0, 801) fsm_mode=(0, 0)
```

### 2. Execute o exemplo no host

Com o terminal A mostrando um estado válido para ações nos braços, execute o exemplo no terminal B:

```sh
uv run python scripts/g1_action_arm_wave.py enp194s0 --execute
```

Este comando envia `release arm` seguido de `high wave`.

Códigos de retorno esperados:

```text
release arm: code=0
high wave: code=0
```

Se o comando retornar `7404`, volte ao terminal A e verifique o FSM. O robô não está no estado `500`, `501` ou `801` válido.

### Diagnóstico de erros

Códigos de retorno comuns observados durante testes:

| Código | Significado |
|--------|-------------|
| `0` | Sucesso |
| `3203` | API não implementada pelo firmware/serviço do robô |
| `7004` | Mudança de modo do motion switcher rejeitada |
| `7400` | `rt/arm_sdk` está ocupado |
| `7401` | Braço está segurando; envie `release arm` ou repita a ação |
| `7402` | ID de ação do braço inválido |
| `7404` | FSM inválido para ação do braço |

### Scripts de referência

Todos os scripts ficam no repositório [MOBILAB-UDESC/unitree-g1](https://github.com/MOBILAB-UDESC/unitree-g1):

- `scripts/g1_monitor_fsm.py` — monitora a máquina de estados do robô
- `scripts/g1_monitor_lowstate.py` — lê o estado de baixo nível (taxa, mode_machine, motores, IMU)
- `scripts/g1_monitor_controller.py` — verifica dados do controle R3-1
- `scripts/g1_action_arm_wave.py` — executa ações programadas nos braços
