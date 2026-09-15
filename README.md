# 🏥 Gestión Hospitalaria — Frontend

Aplicación web para la **gestión integral de un sistema hospitalario**, desarrollada con **Angular 22**.

El sistema permite administrar pacientes, doctores y citas médicas desde una interfaz moderna y centralizada.

El frontend puede trabajar con una **API REST** o con **datos Mock**, permitiendo desarrollar y probar la aplicación sin depender del backend.

---

# 🏥 Gestión Hospitalaria — Frontend

Descripción...

---

## 🔗 Backend

Este proyecto frontend consume el backend de Gestión Hospitalaria,
desarrollado con Spring Boot y arquitectura de microservicios.

👉 Repositorio del Backend:
https://github.com/ClaudioCh-Dev/gestion-hospitalaria-microservicio-springboot

---

# ⚡ Inicio rápido

## 1. Clonar el proyecto

```bash
git clone <REPOSITORY_URL>

cd gestion-hospitalaria-frontend
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar variables de entorno

El proyecto utiliza un archivo `.env` para configurar la URL de la API de producción.

Copia el archivo:

```text
.env.template → .env
```

Configura `.env`:

```env
API_URL=https://miapi.com
```

> El archivo `.env` no debe subirse al repositorio.

## 4. Generar los environments

Ejecuta el script:

```bash
node scripts/start-environments.js
```

Este comando genera automáticamente:

```text
src/environments/
├── environment.ts
├── environment.dev.ts
├── environment.mock.ts
└── environment.prod.ts
```

> **Importante:** debes ejecutar este script después de crear o modificar `.env`.

## 5. Ejecutar el proyecto

### 🚀 Desarrollo

Para ejecutar el frontend conectado al backend:

```bash
npm start
```

Utiliza:

```text
http://localhost:4040
```

como API.

Frontend:

```text
http://localhost:4200
```

### 🧪 Mock

Para ejecutar el frontend utilizando **datos simulados**, sin necesidad de levantar el backend:

```bash
npm run start:mock
```

---

## 📌 Configuraciones disponibles

| Comando              | Configuración | Fuente de datos |
| -------------------- | ------------- | --------------- |
| `npm start`          | Development   | API REST        |
| `npm run start:mock` | Mock          | Datos simulados |
| `npm run build`      | Production    | API REST        |
| `npm run watch`      | Development   | API REST        |
| `npm test`           | —             | Tests           |

---

# 📸 Vistas de la aplicación

## Dashboard

Panel principal con una vista general del estado del sistema.

<img width="2129" height="1240" alt="Dashboard" src="https://github.com/user-attachments/assets/71064222-f9a8-4679-a84f-aa137b7cd594" />

---

## Gestión de pacientes

Módulo encargado de administrar la información de los pacientes registrados en el sistema.

Permite consultar, crear, editar y gestionar la información asociada a cada paciente.

<img width="2126" height="1241" alt="Gestión de pacientes" src="https://github.com/user-attachments/assets/73e75790-d9fc-4fe6-8b18-c3bf233a9a97" />

---

## Gestión de doctores

Módulo para administrar los profesionales médicos del hospital y su información correspondiente.

<img width="2126" height="1237" alt="Gestión de doctores" src="https://github.com/user-attachments/assets/7ece434c-90e1-4d60-a038-86ba669e24be" />

---

## Gestión de citas

Módulo destinado a la administración de las citas médicas entre pacientes y doctores.

<img width="2124" height="1241" alt="Gestión de citas" src="https://github.com/user-attachments/assets/ecc975f5-724d-4c84-8087-97537cb956c6" />

---

# 🚀 Tecnologías

* **Angular 22**
* **TypeScript**
* **RxJS**
* **Angular Reactive Forms**
* **Angular CDK**
* **Taiga UI**
* **Tailwind CSS**
* **Vitest**
* **REST API**
* **Standalone Components**
* **Signals**

---

# 📦 Funcionalidades

## 👤 Pacientes

* Listado de pacientes.
* Paginación.
* Creación de pacientes.
* Edición de pacientes.
* Consulta del detalle.
* Validación de formularios.
* Selección de género.
* Selección de tipo de sangre.
* Manejo de estados.

## 👨‍⚕️ Doctores

* Listado de doctores.
* Paginación.
* Creación y edición.
* Consulta de información.
* Gestión de especialidades.
* Validación de formularios.

## 📅 Citas

* Listado de citas.
* Gestión de pacientes y doctores.
* Administración de fechas.
* Estados de las citas.
* Paginación y filtros.

## 📊 Dashboard

* Resumen general del sistema.
* Indicadores principales.
* Información resumida de pacientes, doctores y citas.

---

# 🏗️ Arquitectura

El proyecto está organizado siguiendo una estructura orientada a funcionalidades, separando la lógica de presentación, servicios, modelos y elementos reutilizables.

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── models/
│   │   ├── pipes/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── doctors/
│   │   └── appointments/
│   │
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts
│   ├── environment.dev.ts
│   ├── environment.mock.ts
│   └── environment.prod.ts
│
└── main.ts
```

## Core

Contiene elementos globales de la aplicación:

* Guards.
* HTTP Interceptors.
* Servicios globales.
* Configuración.
* Autenticación.

## Shared

Contiene elementos reutilizables:

* Componentes.
* Modelos.
* Pipes.
* Utilidades.
* Elementos comunes de UI.

## Features

Cada funcionalidad mantiene su propia lógica y componentes.

```text
features/
└── patients/
    ├── components/
    ├── pages/
    ├── services/
    ├── models/
    └── patients.routes.ts
```

Esto permite mantener cada funcionalidad aislada y facilitar su mantenimiento.

---

# 🔌 Comunicación con el Backend

La aplicación consume una **API REST** mediante servicios HTTP.

El flujo principal es:

```text
Component
    ↓
Service
    ↓
HttpClient
    ↓
REST API
    ↓
Backend
```

Los componentes no se comunican directamente con la API.

Ejemplo:

```text
PatientComponent
       ↓
PatientService
       ↓
HttpClient
       ↓
GET /api/patients
       ↓
PatientResponse
```

---

# 🧪 Modo Mock

El proyecto dispone de un modo **Mock con datos simulados**.

No es necesario levantar el backend para utilizar esta configuración.

```text
                  ┌── HTTP Service ──→ API REST
PatientService ───┤
                  └── Mock Service ──→ Datos simulados
```

Para ejecutar el modo Mock:

```bash
npm run start:mock
```

---

# ⚙️ Configuración de Environments

Los environments son generados automáticamente mediante:

```text
scripts/start-environments.js
```

El archivo `.env` solamente contiene la configuración necesaria para generar el environment de producción.

### `.env`

```env
API_URL=https://miapi.com
```

El script genera las siguientes configuraciones:

### Development

```text
environment.dev.ts
```

Utiliza:

```text
useMocks: false
baseUrl: http://localhost:4040
```

### Mock

```text
environment.mock.ts
```

Utiliza:

```text
useMocks: true
baseUrl: http://localhost:4040
```

### Production

```text
environment.prod.ts
```

Utiliza:

```text
useMocks: false
baseUrl: API_URL
```

### Environment principal

```text
environment.ts
```

Es el environment base que Angular reemplaza dependiendo de la configuración utilizada.

---

# 🏗️ Build

El proyecto utiliza **Production como configuración por defecto** para el build.

Por lo tanto:

```bash
npm run build
```

genera directamente el **build de producción**.

La configuración de producción reemplaza:

```text
environment.ts
```

por:

```text
environment.prod.ts
```

La URL utilizada será la configurada en:

```env
API_URL=https://miapi.com
```

Los archivos compilados se generan dentro de:

```text
dist/
```

---

# 🧪 Testing

El proyecto utiliza **Vitest** para las pruebas unitarias.

Ejecutar:

```bash
npm test
```

---

# 📜 Scripts disponibles

```json
{
  "ng": "ng",
  "start": "ng serve",
  "start:mock": "ng serve --configuration mock",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

| Comando              | Descripción                           |
| -------------------- | ------------------------------------- |
| `npm start`          | Desarrollo utilizando API REST        |
| `npm run start:mock` | Desarrollo utilizando datos simulados |
| `npm run build`      | Build de producción                   |
| `npm run watch`      | Build en modo watch para desarrollo   |
| `npm test`           | Ejecuta las pruebas unitarias         |

---

# 📁 Convenciones

El proyecto utiliza:

* **Standalone Components**
* **Reactive Forms**
* **Signals**
* **Typed Forms**
* Servicios para comunicación con API.
* Separación entre modelos Request y Response.
* Componentes reutilizables.
* Lazy Loading.
* HTTP Interceptors.
* Guards.

---

# 🔄 Flujo de una funcionalidad

Una funcionalidad típica sigue este flujo:

```text
Usuario
   ↓
Component
   ↓
Form / UI
   ↓
Service
   ↓
HttpClient
   ↓
API REST
   ↓
Response
   ↓
Service
   ↓
Component
   ↓
UI
```

Por ejemplo, al crear un paciente:

```text
Formulario
    ↓
PatientComponent
    ↓
PatientService
    ↓
POST /api/patients
    ↓
PatientResponse
    ↓
Actualización de la vista
```

---

# 📌 Estado del proyecto

| Módulo                | Estado |
| --------------------- | ------ |
| Dashboard             | ✅      |
| Pacientes             | ✅      |
| Doctores              | ✅      |
| Citas                 | ✅      |
| Formularios dinámicos | ✅      |
| Validaciones          | ✅      |
| Paginación            | ✅      |
| Mock API              | ✅      |
| Integración REST      | 🚧     |
| Autenticación         | 🚧     |

---

# 📚 Recursos

* [Angular](https://angular.dev/)
* [Angular CLI](https://angular.dev/tools/cli)
* [Taiga UI](https://taiga-ui.dev/)
* [Angular CDK](https://material.angular.dev/cdk/categories)
* [RxJS](https://rxjs.dev/)
* [Vitest](https://vitest.dev/)

---

# 👨‍💻 Autor

**Rider**

Proyecto desarrollado como aplicación frontend para un sistema de gestión hospitalaria utilizando Angular y una arquitectura orientada a funcionalidades.
