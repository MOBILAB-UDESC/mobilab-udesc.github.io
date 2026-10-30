---
title: Ativando Wi-Fi automaticamente
description: Configurando um service para, quando o G1 ligar, ele se conectar automaticamente ao Wi-Fi.
---

As etapas para configurar o G1 automaticamente ao Wi-Fi ao ser ligado envolve duas coisas:
1. A primeira é configurar um shell script (.sh), que vai executar os comandos que já conhecemos para se conectar à rede sem fio.
2. A segunda é configurar um service, um arquivo especial linux capaz de executar comandos sozinho logo após bootar.

Ao final do arquivo, temos uma sessão de documentação sobre shell script e services, que podem ser úteis para quem nunca mexeu com essas ferramentas ;)

### Configurando um arquivo shell

Dentro do G1, execute:
```
touch g1-wifi.sh
```

Agora, entre no arquivo usando nano:
```
nano g1-wifi.sh
```

Dentro do `g1-wifi.sh`, escreva:

```
#!/bin/sh

set -e

rfkill unblock all
ip link set wlan0 up
nmcli radio wifi on
nmcli device set wlan0 managed yes
```

Por fim, vamos tornar executável o nosso arquivo shell:

```
chmod +x g1-wifi.sh
```

Vou agora detalhar o que cada linha faz (você pode pular se quiser ou caso já saiba sobre isso):

`set -e` : caso o nosso script falhe, ele emite um alerta ao service, avisando de que ele falhou, permitindo ao service não confiar cegamente no sucesso da execução do shell.

`rfkill unblock all` : desbloqueia todos os dispositivos de rádio e comunicação sem fio do computador (como Wi-Fi, Bluetooth, GPS e etc) que possam estar bloqueados.

`ip link set wlan0 up` : ativa a placa de rede sem fio, que no caso do G1 nós identificamos como `wlan0`.

`nmcli radio wifi on` : liga a placa de rede Wi-Fi do Linux através do NetworkManager.

`nmcli device set wlan0 managed yes` : devolve o controle da placa de rede sem fio `wlan0` para o NetworkManager.

### Configurando um service

Agora que já configuramos nosso shell script, vamos configurar o nosso service. Dentro do G1, digite:

```
touch g1-wifi.service
```

Para entrar no arquivo:

```
nano g1-wifi.service
```

Dentro do nosso arquivo service, digite:

```
[Unit]
Description = Configura e conecta o G1 ao Wi-Fi (MobiLink)
After = NetworkManager.service
Requires = NetworkManager.service

[Service]
Type = oneshot
ExecStart = /home/unitree/g1-wifi.sh
Restart = on-failure
User = root

[Install]
WantedBy = multi-user.target
```

Vamos agora mover o nosso service para o local adequado (geralmente em /etc/systemd/system):

```
sudo mv g1-wifi.service /etc/systemd/system/
sudo systemctl daemon-reload
```

Agora, vamos iniciar a execução do nosso service:

```
systemctl enable g1-wifi.service
systemctl start g1-wifi.service
```

Verifique se tudo ocorre bem:

```
systemctl status g1-wifi.service
```

Reinicie o G1 e veja se já funciona, o esperado é você já conseguir se conectar ao G1 usando SSH via Wi-Fi no primeiro teste!

Vou agora explicar o que cada linha de código do servicê faz:

1. Unit

`After = NetworkManager.service` : pede ao Linux para que execute este service após a inicialização do NetwokManager.

`Requires = NetworkManager.service` : diz ao Linux que, todos os services listados no Requires sejam inicializados junto (não implicitando uma ordem, e por isso é importante definir o After) do nosso service, pois eles são necessários para o próprio funcionamento do service.

2. Service

`Type = oneshot` : significa que o nosso service é executado uma única vez, e, ao terminar, são fechados, pois não precisam rodar em segundo plano.

`ExecStart = /home/unitree/g1-wifi.sh` : indica o caminho do script que queremos executar. É *importante* notar que se você não colocou o `g1-wifi.sh` no home do G1, você alterar o caminho de execução para o caminho em que você colocou!

`Restart = on-failure` : significa que o serviço será reiniciado automaticamente apenas se ele for encerrado de forma anormal.

`User = root` : indica o tipo de usuário necessário para rodar este service (root no nosso caso).

3. Install

`WantedBy = multi-user.target` : indica que quando o sistema inicia o estágio de inicialização multiusuário (multi-user.target), o nosso serviço deve ser iniciado automaticamente.


### Referências
1. [Documentação oficial do Ubuntu sobre services.](https://manpages.ubuntu.com/manpages/focal/man5/systemd.service.5.html#service-templates)
2. [Guia básico de shell script](https://www.vivaolinux.com.br/artigo/Programando-em-Shell-Script-para-iniciantes/)