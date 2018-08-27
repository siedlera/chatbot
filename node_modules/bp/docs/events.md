Eventos
=======

Init
----

Realiza una inicialización del proyecto que permite crear un documento JSON, con todas las especificaciones del proyecto para este poder ser ejecutada, instalada, detenida o des-instalada.

Este proceso se encargar de referir parámetros que permitan crear el documento JSON con sus especificaciones.
 
 - type: Contiene el tipo de proyecto, por su defecto obtiene el valor de 'literal'.
 - maintainer: Contiene los datos de contacto de la persona que se encarga de mantener el proyecto o tan solo el documento JSON.
 - install: Contiene las instrucciones para instalar el proyecto.
 - uninstall: Contiene las instrucciones para des-instalar el proyecto.
 - start: Contiene las instruciones para iniciar el proyecto, por ejemplo. `php -S localhost:8008 -t .` (Levantar un sitio web usando PHP en la URL `localhost:8008`). 
 - stop: Detiene la ejecución del proyecto.


