# 🏥 Gestión Hospitalaria — Frontend

Aplicación web para la **gestión integral de un sistema hospitalario**, desarrollada con **Angular 22**.

Permite administrar pacientes, doctores, citas, historial médico y facturación desde una interfaz centralizada. Puede trabajar contra la **API REST** del backend o con **datos Mock**, sin necesidad de levantar el backend.

> 📖 Arquitectura, endpoints, autenticación y más detalles técnicos en **[docs/DETALLES.md](docs/DETALLES.md)**.

---

## 🔗 Backend

Este frontend consume el backend de Gestión Hospitalaria (Spring Boot + microservicios).

👉 https://github.com/ClaudioCh-Dev/gestion-hospitalaria-microservicio-springboot

---

# ⚡ Instalación

## Requisitos

| Herramienta | Versión                         |
| ----------- | ------------------------------- |
| Node.js     | 22 o superior                   |
| npm         | 10 o superior                   |
| Git         | Cualquiera                      |
| Backend     | Solo si no usas el modo Mock    |

## 1. Clonar el proyecto

```bash
git clone https://github.com/ClaudioCh-Dev/gestion-hospitalaria-web-angular.git
cd gestion-hospitalaria-web-angular
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar variables de entorno

Copia la plantilla:

```bash
cp .env.template .env
```

Edita `.env` con las URLs del **gateway** y del **auth-server** que usará el build de producción:

```env
API_URL=http://localhost:4040
AUTH_URL=http://localhost:3000/auth-server
```

| Variable   | Descripción                                               |
| ---------- | --------------------------------------------------------- |
| `API_URL`  | URL del API Gateway (pacientes, doctores, citas, etc.)    |
| `AUTH_URL` | URL del auth-server, incluyendo el context-path `/auth-server` |

> `.env` está en `.gitignore` y **no debe subirse** al repositorio.
> Si despliegas en un servidor, reemplaza `localhost` por el dominio o IP del servidor.

## 4. Generar los environments

```bash
npm run env
```

Genera `src/environments/` a partir del `.env`:

```text
src/environments/
├── environment.ts        → mock (por defecto)
├── environment.dev.ts    → API local
├── environment.mock.ts   → datos simulados
└── environment.prod.ts   → API_URL / AUTH_URL del .env
```

> `npm run build` ejecuta este script automáticamente (`prebuild`). Vuelve a correrlo si modificas `.env`.

## 5. Levantar el backend (opcional)

Solo es necesario si no usas el modo Mock. Sigue las instrucciones del [repositorio del backend](https://github.com/ClaudioCh-Dev/gestion-hospitalaria-microservicio-springboot) (por ejemplo con `docker compose up`).

El frontend espera:

| Servicio     | URL                                  |
| ------------ | ------------------------------------ |
| API Gateway  | `http://localhost:4040`              |
| Auth Server  | `http://localhost:3000/auth-server`  |

El gateway permite CORS desde `http://localhost:4200` por defecto.

## 6. Ejecutar

### 🚀 Conectado al backend

```bash
npm start
```

### 🧪 Con datos simulados (sin backend)

```bash
npm run start:mock
```

Abre **http://localhost:4200**

---

# 📜 Scripts

| Comando              | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm start`          | Servidor de desarrollo contra la API local         |
| `npm run start:mock` | Servidor de desarrollo con datos simulados         |
| `npm run env`        | Genera los environments desde `.env`               |
| `npm run build`      | Build de producción en `dist/` (corre `env` antes) |
| `npm run watch`      | Build en modo watch (development)                  |
| `npm test`           | Pruebas unitarias con Vitest                       |

---

# 🧩 Módulos

| Módulo             | Ruta                 | Qué permite                                                             |
| ------------------ | -------------------- | ----------------------------------------------------------------------- |
| Dashboard          | `/dashboard`         | Totales, citas de los últimos 7 días, pacientes por género y próximas citas |
| Pacientes          | `/patients`          | Listar, filtrar, crear, editar, ver detalle y eliminar                  |
| Médicos            | `/doctors`           | Listar, filtrar por especialidad, crear, editar y crear especialidades  |
| Citas              | `/appointments`      | Agenda diaria por médico; confirmar, completar y cancelar citas         |
| Tipos de cita      | `/appointment-types` | Crear, editar y desactivar tipos de cita con su tarifa                  |
| Historias clínicas | `/medical-records`   | Historial de atenciones con filtros y exportación CSV                   |
| Facturación        | `/billing`           | Facturas, cobro, resumen de montos y exportación CSV                    |

---

# 📸 Vistas de la aplicación

## Dashboard

<img width="2129" height="1240" alt="Dashboard" src="https://github.com/user-attachments/assets/71064222-f9a8-4679-a84f-aa137b7cd594" />

## Gestión de pacientes

<img width="2126" height="1241" alt="Gestión de pacientes" src="https://github.com/user-attachments/assets/73e75790-d9fc-4fe6-8b18-c3bf233a9a97" />

## Gestión de doctores

<img width="2126" height="1237" alt="Gestión de doctores" src="https://github.com/user-attachments/assets/7ece434c-90e1-4d60-a038-86ba669e24be" />

## Gestión de citas

<img width="2124" height="1241" alt="Gestión de citas" src="https://github.com/user-attachments/assets/ecc975f5-724d-4c84-8087-97537cb956c6" />

---

# 🚀 Tecnologías

Angular 22 · TypeScript · RxJS · Signals · Standalone Components · Reactive Forms · Angular CDK · Taiga UI · Tailwind CSS · Vitest

