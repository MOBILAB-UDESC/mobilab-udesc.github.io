---
title: Instalação
---

Este guia apresenta o fluxo utilizado no laboratório para instalar o sistema em uma placa **NVIDIA Jetson** a partir de um USB stick. Os nomes das opções e as telas de inicialização podem variar conforme o modelo da placa e a versão do JetPack.

## Documentação oficial

- [Página oficial do NVIDIA Jetson](https://developer.nvidia.com/embedded/jetson-modules)
- [Documentação do JetPack SDK](https://developer.nvidia.com/embedded/jetpack)
- [Arquivo de versões do JetPack](https://developer.nvidia.com/embedded/jetpack-archive)
- [Guia do desenvolvedor do Jetson Linux](https://docs.nvidia.com/jetson/archives/)
- [Guia de desenvolvimento da Jetson Thor](https://docs.nvidia.com/jetson/archives/r39.2.1/DeveloperGuide/index.html)

## Pré-requisitos

Antes de começar:

1. Consulte a documentação da placa e confirme a versão do JetPack compatível.
2. Conecte a placa à fonte de alimentação e ao computador host por USB, conforme indicado no manual do modelo.
3. Se estiver reinstalando, faça backup dos dados da placa. O processo de instalação pode apagar o armazenamento interno.

## Preparar o USB stick

Para a instalação utilizada no laboratório, usamos a seguinte imagem ISO para a Jetson Thor:

[Baixar a ISO `jetsoninstaller-r39.2.1`](https://developer.nvidia.com/downloads/embedded/l4t/r39_release_v2.1/iso/jetsoninstaller-r39.2.1-2026-08-07-18-30-47-arm64.iso)

Para gravar a ISO no USB stick, utilize o [balenaEtcher](https://etcher.balena.io/#download-etcher):

1. Baixe e instale o balenaEtcher no computador host.
2. Abra o balenaEtcher e selecione **Flash from file**.
3. Selecione a ISO baixada.
4. Selecione o USB stick como destino em **Select target**.
5. Clique em **Flash** e aguarde a conclusão da gravação.
6. Ejete o USB stick com segurança antes de conectá-lo à Jetson.

> A gravação da ISO apaga o conteúdo do USB stick. Confirme o dispositivo selecionado no balenaEtcher antes de iniciar o processo.

## Instalar a partir do USB stick

1. Desligue a Jetson.
2. Conecte o USB stick preparado à placa.
3. Ligue a Jetson e abra o menu de inicialização, usando o procedimento indicado para o modelo da placa.
4. Selecione o USB stick como dispositivo de inicialização.
5. Siga as etapas apresentadas pelo instalador para selecionar o armazenamento de destino e concluir a instalação.
6. Remova o USB stick quando solicitado e reinicie a Jetson.

Consulte o [guia oficial de inicialização e instalação via USB stick da Jetson AGX Thor](https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/0.1.0/quick_start.html) para os procedimentos específicos de conexão, inicialização e seleção do dispositivo.

## Verificar a instalação

Depois do primeiro boot, conecte-se à placa e confira a versão do sistema:

```bash
cat /etc/nv_tegra_release
```

Confira também se a GPU está disponível:

```bash
sudo tegrastats
```

Para verificar os componentes CUDA instalados, quando aplicável:

```bash
nvcc --version
```

O comando `nvcc` pode não estar disponível se o CUDA Toolkit não estiver incluído na imagem instalada.

## Solução de problemas

- Se o USB stick não aparecer no menu de inicialização, confirme a gravação da ISO, teste outra porta USB e confira o procedimento específico do modelo.
- Se a gravação da ISO falhar, repita o processo com outro USB stick e sem hubs ou adaptadores intermediários.
- Se o sistema iniciar sem rede, configure a interface conforme o modelo da placa e consulte o guia de rede do Jetson Linux.
- Não misture versões de JetPack, Jetson Linux, CUDA e bibliotecas sem verificar a matriz de compatibilidade oficial.
