---
title: Instalação do sistema Jetson Thor
---

Este guia apresenta o fluxo para instalar o sistema na placa **NVIDIA Jetson** a partir de um pendrive.

## Documentação oficial

- [Página oficial do NVIDIA Jetson](https://developer.nvidia.com/embedded/jetson-modules)
- [Documentação do JetPack SDK](https://developer.nvidia.com/embedded/jetpack)
- [Baixar e executar o SDK Manager](https://docs.nvidia.com/sdk-manager/download-run-sdkm/index.html)
- [Instalar o software Jetson com o SDK Manager](https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html)

## Problemas ao instalar o sistema

Apesar do manual oficial orientar a instalação da ISO pelo pendrive, essa opção falhou quando realizamos ela. Recebemos o erro:

```sh
board='NVIDIA Jetson Thor Developer Kit'
...
Unsupported board!
```

O hardware está sendo identificado como `NVIDIA Jetson Thor Developer Kit` mas o script do JetPack 7.2.1 procura por `NVIDIA Jetson AGX Thor Developer Kit`. Como a string não é idêntica, o instalador aborta. [Isso já foi reproduzido em unidades novas da Thor](https://forums.developer.nvidia.com/t/unsupported-board-installation-issue-install-script-mismatch-with-jetpack-r39-2-0/373157).

Em 20 de agosto, [um engenheiro da NVIDIA](https://forums.developer.nvidia.com/t/jetpack-7-2-1-iso-on-a-new-agx-thor-devkit-after-fixing-unsupported-board-install-fails-again-at-dtb-matching-and-leaves-nvme-unbootable-workaro/380595) confirmou que isso é um "known JP 7.2.1 ISO installer issue on AGX Thor" e recomendou evitar o ISO por enquanto.

## Instalação usando SDK Manager no Ubuntu

Como a instalação pelo pendrive apresentou o erro descrito acima, o procedimento recomendado para este caso é usar um computador host com Ubuntu e o **NVIDIA SDK Manager**.

### Pré-requisitos

1. A recomendação é usar Ubuntu 24.x. Usamos o Ubuntu 26.x sem problema.
2. A máquina host deve usar arquitetura **x86_64**.
3. Um pendrive de pelo menos **16 GB** para realizar o flash do sistema. Esse pendrive é obrigatório mesmo quando a instalação é feita pelo SDK Manager: o aplicativo solicitará a gravação dos arquivos nele e, em seguida, ele deverá ser conectado à Jetson Thor.
4. Uma conta NVIDIA Developer para fazer login no SDK Manager.
5. O cabo USB-C que acompanha a Jetson Thor para conectar o host à porta 5a da Jetson, conforme descrito em [Hardware Jetson Thor](./hardware.md).

### Baixar e iniciar o SDK Manager

1. Baixe o SDK Manager pela [página oficial de download e execução](https://docs.nvidia.com/sdk-manager/download-run-sdkm/index.html).
2. Instale o pacote `.deb` no Ubuntu:

```bash
sudo apt install ./sdkmanager_*.deb
```

3. Inicie o aplicativo:

```bash
sdkmanager
```

4. Faça login com sua conta NVIDIA Developer.

### Configurar a instalação

No SDK Manager:

1. Selecione a categoria de produto **Jetson**.
2. Conecte a Jetson Thor ao host Ubuntu usando o cabo USB-C que acompanha a placa na porta 5a.
3. Selecione **Jetson AGX Thor Developer Kit** como hardware de destino.
4. Selecione a versão do **JetPack SDK** compatível com a Jetson Thor.
5. Revise os componentes do sistema e aceite os termos das licenças.
6. Clique em **Continue** para iniciar o download dos arquivos.

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

- Se o SDK Manager não abrir no Ubuntu, verifique a escala da tela nas configurações do sistema e defina-a como **100%**. A escala de exibição pode impedir a inicialização correta da interface do SDK Manager.
- Se o pendrive não aparecer no menu de inicialização, confirme a gravação da ISO, teste outra porta USB e confira o procedimento específico do modelo.
- Se a gravação da ISO falhar, repita o processo com outro pendrive e sem hubs ou adaptadores intermediários.
- Não misture versões de JetPack, Jetson Linux, CUDA e bibliotecas sem verificar a matriz de compatibilidade oficial.
