# Legacy Code Migration Frontend

Este es el repositorio frontend de la aplicacion web para la migracion de codigo legacy, proporciona una interfaz de usuario para interactuar con el backend del sistema.
## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- Node.js: [Descargar Node.js](https://nodejs.org/)
- npm (administrador de paquetes de Node.js): Viene incluido con Node.js
- Angular CLI: Instálalo globalmente con `npm install -g @angular/cli`

**Lenguajes utilizados:** TypeScript  
**Frameworks, herramientas o librerias utilizados:** Angular

## Scripts Disponibles
* Instalar Dependencias: `npm install`
* Construir la Aplicación: `npm run build`
* Construir la Aplicación en produccion: `npm run build:prod`
* Construir la Aplicación en produccion ofuscando el codigo: `npm run build:prod:obf`
* Revisar el codigo: `npm run lint`
* Correr los test unitarios y ver cobertura: `npm run test`
* Iniciar la Aplicación: `npm start`

## Paso a paso para ejecutar el repositorio
Para poder utilizar este repositorio debes seguir estas instrucciones y luego dirigirte al [Repositorio Legacy Code Migration Backend](https://github.com/juparefe/legacy-code-migration-backend) y seguir las instrucciones para levantar el complemento de la aplicacion
* Clonar el repositorio en el entorno local utilizando el comando 
```
git clone https://github.com/juparefe/legacy-code-migration-frontend.git
```
* Abrir la carpeta clonada utilizando algun editor de codigo
* Instala las dependencias:
```
npm install
```
* Ejecuta el siguiente comando para iniciar el servidor:
```
npm start
```
Por defecto la aplicacion se levanta en el puerto [4200](http://localhost:4200/)
