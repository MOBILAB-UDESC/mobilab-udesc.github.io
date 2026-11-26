---
title: Troubleshooting
description: Algumas soluções para problemas básicos que podem ocorrer na execução do TeleImager.
---

### 1. Múltiplos nós usam o mesmo serial_number

Parece absurdo a primeira vista, se pensarmos que serial_numbers eram para serem únicos. Mas realmente são! A questão é que uma mesma câmera pode disponibilizar múltiplos caminhos de vídeo (os video_id's).

Nesse caso, por conta do serial_number ter maior prioridade que o video_id, defina o serial_number como null (pode comentar a string se quiser) e explicite o id do video_id que você quer usar. Isso específica para o TeleImager qual caminho deve ser usado.

### 2. Resolução incorreta

Um outro erro que pode ocorrer é você informar nas configurações do `teleimager_server.yaml` uma resolução não suportada pela câmera. Para saber quais resoluções são suportadas, rode:

```
v4l2-ctl -d /dev/video{id} --list-formats-ext
```

Trocando id pelo número do id da câmera que está com problemas (lembre-se, não dê espaço entre "video" e o "id", eles são juntos/concatenados).