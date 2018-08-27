Back Project
============

Un entorno de desarrollo basado en BASH. de múltiples lenguajes y múltiples sistemas. Capas de montar un proyecto tan solo creando una serie de comandos generales.


Comandos
--------

### Initialization

Inicializa el tentornode del proyecto.

```bash
bp init
```

Crea un documento (`bp.json`) dentro del directorio del proyecto que almacena las configuraciones para iniciar para y reiniciar el proyecto, al igual que almacena las configuraciones para instalar y desinstallar el software desde su codigo fuente.


### Install

Instala los componentes por defecto para poder iniciar correctamente el proyecto.

```bash
bp install
```


### Information

Retorna la información del proyecto.

```bash
bp info
```

Obtiene un informe completo con toda la información relacionada con el proyecto, desde los script a ejecutar para iniciar el proyecto, como la información almacenada dentro del equipo a nivel local.



## Abrir editor

Abre el editor con el directorio del proyecto.

```bash
bp edit
```
