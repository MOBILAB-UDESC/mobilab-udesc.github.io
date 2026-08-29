---
title: Instalação do sistema Jetson Thor
---

Este guia apresenta o fluxo utilizado no laboratório para instalar o sistema em uma placa **NVIDIA Jetson** a partir de um USB stick. Os nomes das opções e as telas de inicialização podem variar conforme o modelo da placa e a versão do JetPack.

## Documentação oficial

- [Página oficial do NVIDIA Jetson](https://developer.nvidia.com/embedded/jetson-modules)
- [Documentação do JetPack SDK](https://developer.nvidia.com/embedded/jetpack)
- [Arquivo de versões do JetPack](https://developer.nvidia.com/embedded/jetpack-archive)
- [Guia do desenvolvedor do Jetson Linux](https://docs.nvidia.com/jetson/archives/)
- [Guia de desenvolvimento da Jetson Thor](https://docs.nvidia.com/jetson/archives/r39.2.1/DeveloperGuide/index.html)
- [Baixar e executar o SDK Manager](https://docs.nvidia.com/sdk-manager/download-run-sdkm/index.html)
- [Instalar o software Jetson com o SDK Manager](https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html)

## Pré-requisitos

Antes de começar:

1. Consulte a documentação da placa e confirme a versão do JetPack compatível.
2. Conecte a placa à fonte de alimentação e ao computador host por USB, conforme indicado no manual do modelo.
3. Se estiver reinstalando, faça backup dos dados da placa. O processo de instalação pode apagar o armazenamento interno.

## Problemas ao instalar o sistema

Apesar do manual oficial orientar a instalação da ISO pelo USB Stick, essa opção falhou quando realizamos ela. Recebemos o erro:

```sh
board='NVIDIA Jetson Thor Developer Kit'
...
Unsupported board!
```

O hardware está sendo identificado como `NVIDIA Jetson Thor Developer Kit` mas o script do JetPack 7.2.1 procura por `NVIDIA Jetson AGX Thor Developer Kit`. Como a string não é idêntica, o instalador aborta. [Isso já foi reproduzido em unidades novas da Thor](https://forums.developer.nvidia.com/t/unsupported-board-installation-issue-install-script-mismatch-with-jetpack-r39-2-0/373157).

Em 20 de agosto, [um engenheiro da NVIDIA](https://forums.developer.nvidia.com/t/jetpack-7-2-1-iso-on-a-new-agx-thor-devkit-after-fixing-unsupported-board-install-fails-again-at-dtb-matching-and-leaves-nvme-unbootable-workaro/380595) confirmou que isso é um "known JP 7.2.1 ISO installer issue on AGX Thor" e recomendou evitar o ISO por enquanto.

## Instalação usando SDK Manager no Ubuntu

Como a instalação pelo USB stick apresentou o erro descrito acima, o procedimento recomendado para este caso é usar um computador host com Ubuntu e o **NVIDIA SDK Manager**.

### Pré-requisitos

1. Um computador host com Ubuntu em uma versão suportada pelo SDK Manager.
2. Uma conta NVIDIA Developer para fazer login no SDK Manager.
3. Uma conexão USB-C entre o host e a porta 5a da Jetson, conforme descrito em [Hardware Jetson Thor](./hardware.md).
4. A Jetson em **Force Recovery Mode** quando o SDK Manager solicitar o procedimento de flash.

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
2. Selecione o host Ubuntu e o hardware Jetson detectado.
3. Selecione a versão do **JetPack SDK** compatível com a Jetson Thor.
4. Revise os componentes do sistema e aceite os termos das licenças.
5. Clique em **Continue** para iniciar o download dos arquivos.

### Executar o flash

1. Quando o SDK Manager solicitar, coloque a Jetson em **Force Recovery Mode**.
2. Confirme o armazenamento de destino e as configurações do dispositivo.
3. Informe a senha `sudo` do Ubuntu quando solicitado.
4. Inicie a instalação e acompanhe os detalhes na aba **Terminal**.
5. Não desconecte a Jetson durante o flash ou enquanto os componentes do JetPack estiverem sendo instalados.

Ao final, revise o resumo da instalação e exporte os logs de debug caso algum componente apresente erro. Consulte o [guia oficial de instalação do software Jetson com o SDK Manager](https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html) para as telas e opções específicas da versão utilizada.

Esse método é diferente da instalação pelo USB stick: o Ubuntu executa o processo de flash diretamente na Jetson. Não use a ISO do USB stick como substituta dos arquivos baixados pelo SDK Manager sem confirmar a compatibilidade na documentação da versão escolhida.

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
