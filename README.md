# 🏥 Gestión Hospitalaria — Frontend

Aplicación web para la **gestión integral de un sistema hospitalario**, desarrollada con **Angular 22**.

El sistema permite administrar las principales operaciones de un hospital desde una interfaz moderna y centralizada, incluyendo la gestión de **pacientes, doctores y citas médicas**, además de un dashboard con información general del sistema.

El frontend está preparado para consumir una API REST y cuenta con una configuración de **Mock** para trabajar durante el desarrollo sin depender del backend.

---

## 📸 Vistas de la aplicación

### Dashboard

Panel principal con una vista general del estado del sistema hospitalario.

<img width="2129" height="1240" alt="Dashboard" src="https://github.com/user-attachments/assets/71064222-f9a8-4679-a84f-aa137b7cd594" />

---

### Gestión de pacientes

Módulo encargado de administrar la información de los pacientes registrados en el sistema.

Permite consultar, crear, editar y gestionar la información asociada a cada paciente.

<img width="2126" height="1241" alt="image" src="https://github.com/user-attachments/assets/73e75790-d9fc-4fe6-8b18-c3bf233a9a97" />

---

### Gestión de doctores

Módulo para administrar los profesionales médicos del hospital y su información correspondiente.

<img width="2126" height="1237" alt="Gestión de doctores" src="https://github.com/user-attachments/assets/7ece434c-90e1-4d60-a038-86ba669e24be" />

---

### Gestión de citas

Módulo destinado a la administración de las citas médicas entre pacientes y doctores.

<img width="2124" height="1241" alt="Gestión de citas" src="https://github.com/user-attachments/assets/ecc975f5-724d-4c84-8087-97537cb956c6" />

---

## 🚀 Tecnologías

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

---

## 📦 Funcionalidades

### 👤 Pacientes

* Listado de pacientes.
* Paginación.
* Creación de pacientes.
* Edición de pacientes.
* Consulta del detalle.
* Validación de formularios.
* Selección de género.
* Selección de tipo de sangre.
* Manejo de estados.

### 👨‍⚕️ Doctores

* Listado de doctores.
* Paginación.
* Creación y edición.
* Consulta de información.
* Gestión de especialidades.
* Validación de formularios.

### 📅 Citas

* Listado de citas.
* Gestión de pacientes y doctores.
* Administración de fechas.
* Estados de las citas.
* Paginación y filtros.

### 📊 Dashboard

* Resumen general del sistema.
* Indicadores principales.
* Información resumida de pacientes, doctores y citas.

---

## 🏗️ Arquitectura

El proyecto está organizado siguiendo una estructura orientada a funcionalidades, separando la lógica de presentación, servicios, modelos y elementos reutilizables.

Una estructura aproximada:

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
│   └── environment.mock.ts
│
└── main.ts
```

### Core

Contiene elementos globales de la aplicación que normalmente tienen una única instancia:

* Guards.
* HTTP Interceptors.
* Servicios globales.
* Configuración de la aplicación.
* Autenticación.

### Shared

Contiene elementos reutilizables por diferentes funcionalidades:

* Componentes.
* Modelos.
* Pipes.
* Utilidades.
* Elementos comunes de UI.

### Features

Cada módulo funcional mantiene su propia lógica y componentes.

Por ejemplo:

```text
features/
└── patients/
    ├── components/
    ├── pages/
    ├── services/
    ├── models/
    └── patients.routes.ts
```

Esto permite que cada funcionalidad permanezca aislada y sea más fácil de mantener.

---

## 🔌 Comunicación con el Backend

La aplicación está diseñada para consumir una **API REST** mediante servicios HTTP.

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

Los componentes no deberían comunicarse directamente con la API.

Por ejemplo:

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

Esto permite mantener separada la lógica de presentación de la comunicación con el backend.

---

## 🧪 Modo Mock

Durante el desarrollo se puede utilizar información simulada sin necesidad de levantar el backend.

La aplicación puede seleccionar entre una implementación HTTP real y una implementación Mock.

```text
                    ┌── PatientHttpService ──→ API
PatientService ─────┤
                    └── PatientMockService ──→ Mock
```

Esto permite desarrollar y probar la interfaz independientemente del estado del backend.

Para ejecutar la aplicación con la configuración Mock:

```bash
ng serve -c mock
```

Para utilizar la configuración normal:

```bash
ng serve
```

---

## ⚙️ Requisitos

Antes de ejecutar el proyecto necesitas tener instalado:

* Node.js
* Angular CLI
* npm

Puedes verificar las versiones:

```bash
node --version
npm --version
ng version
```

---

## 💻 Instalación

Clona el repositorio:

```bash
git clone <REPOSITORY_URL>
```

Entra al proyecto:

```bash
cd gestion-hospitalaria-frontend
```

Instala las dependencias:

```bash
npm install
```

---

## ▶️ Desarrollo

Inicia el servidor de desarrollo:

```bash
ng serve
```

Después abre:

```text
http://localhost:4200/
```

La aplicación se actualizará automáticamente cuando se modifiquen los archivos del proyecto.

### Desarrollo con Mock

```bash
ng serve -c mock
```

---

## 🏗️ Build

Para generar el build:

```bash
ng build
```

Los archivos compilados se generan dentro de:

```text
dist/
```

Para producción:

```bash
ng build --configuration production
```

---

## 🧪 Testing

El proyecto utiliza **Vitest** para las pruebas unitarias.

Ejecutar:

```bash
ng test
```

---

## 📁 Convenciones

El proyecto utiliza:

* **Standalone Components**
* **Reactive Forms**
* **Signals** cuando corresponde.
* **Typed Forms**.
* Servicios para comunicación con API.
* Separación entre modelos de request y response.
* Componentes reutilizables.
* Lazy Loading para funcionalidades cuando corresponde.
* Interceptors para comportamiento HTTP global.
* Guards para protección de rutas.

---

## 🔄 Flujo de una funcionalidad

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

## 📌 Estado del proyecto

Actualmente el frontend cuenta con los siguientes módulos principales:

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

## 📚 Recursos

* [Angular](https://angular.dev/)
* [Angular CLI](https://angular.dev/tools/cli)
* [Taiga UI](https://taiga-ui.dev/)
* [Angular CDK](https://material.angular.dev/cdk/categories)
* [RxJS](https://rxjs.dev/)
* [Vitest](https://vitest.dev/)

---

## 👨‍💻 Autor

**Rider**

Proyecto desarrollado como aplicación frontend para un sistema de gestión hospitalaria utilizando Angular y una arquitectura orientada a funcionalidades.
