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

En modo Mock puedes entrar con estas cuentas de prueba:

| Rol            | Correo               | Contraseña |
| -------------- | -------------------- | ---------- |
| Administrador  | `admin@example.com`  | `123456`   |
| Médico         | `doctor@example.com` | `123456`   |

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

| Módulo             | Ruta                 | Qué permite                                                                 |
| ------------------ | -------------------- | --------------------------------------------------------------------------- |
| Dashboard          | `/dashboard`         | Totales, citas de los últimos 7 días, pacientes por género y próximas citas |
| Pacientes          | `/patients`          | Listar, filtrar, crear, editar, ver detalle y eliminar                      |
| Médicos            | `/doctors`           | Listar, filtrar por especialidad, crear, editar y crear especialidades      |
| Citas              | `/appointments`      | Agenda diaria de todos los médicos; confirmar, completar y cancelar citas   |
| Mi agenda          | `/appointments`      | El médico ve solo su día: línea de tiempo, ocupación y ficha del paciente   |
| Tipos de cita      | `/appointment-types` | Crear, editar y desactivar tipos de cita con su tarifa y color              |
| Historias clínicas | `/medical-records`   | Historial de atenciones con filtros y exportación CSV                       |
| Facturación        | `/billing`           | Facturas, cobro, resumen de montos y exportación CSV                        |
| Usuarios           | `/users`             | Cuentas del sistema: crear, cambiar rol, reenviar activación y desactivar   |
| Activar cuenta     | `/activate`          | El usuario define su contraseña desde el enlace que recibe por correo       |
| Bienvenida         | `/welcome`           | Inicio para usuarios sin acceso al dashboard                                |

> El menú y las rutas se filtran por los **permisos** del token (JWT): cada usuario solo ve y puede abrir las secciones de su rol.

---

# 📸 Vistas de la aplicación

> Capturas tomadas en modo Mock. Haz clic en cualquier imagen para verla en tamaño completo.

### 🖥️ Escritorio

<table>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/01-login.png"><img src="docs/screenshots/01-login.png" alt="Inicio de sesión" width="400"></a>
      <br><sub><b>Inicio de sesión</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/02-dashboard.png"><img src="docs/screenshots/02-dashboard.png" alt="Dashboard" width="400"></a>
      <br><sub><b>Dashboard</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/03-agenda.png"><img src="docs/screenshots/03-agenda.png" alt="Agenda de citas" width="400"></a>
      <br><sub><b>Agenda de citas</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/04-nueva-cita.png"><img src="docs/screenshots/04-nueva-cita.png" alt="Nueva cita" width="400"></a>
      <br><sub><b>Nueva cita</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/14-mi-agenda.png"><img src="docs/screenshots/14-mi-agenda.png" alt="Mi agenda (médico)" width="400"></a>
      <br><sub><b>Mi agenda (médico)</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/05-pacientes.png"><img src="docs/screenshots/05-pacientes.png" alt="Pacientes" width="400"></a>
      <br><sub><b>Pacientes</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/06-medicos.png"><img src="docs/screenshots/06-medicos.png" alt="Médicos" width="400"></a>
      <br><sub><b>Médicos</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/07-tipos-cita.png"><img src="docs/screenshots/07-tipos-cita.png" alt="Tipos de cita y tarifas" width="400"></a>
      <br><sub><b>Tipos de cita y tarifas</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/08-historias.png"><img src="docs/screenshots/08-historias.png" alt="Historias clínicas" width="400"></a>
      <br><sub><b>Historias clínicas</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/09-facturacion.png"><img src="docs/screenshots/09-facturacion.png" alt="Facturación" width="400"></a>
      <br><sub><b>Facturación</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/10-usuarios.png"><img src="docs/screenshots/10-usuarios.png" alt="Usuarios" width="400"></a>
      <br><sub><b>Usuarios</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/11-editar-usuario.png"><img src="docs/screenshots/11-editar-usuario.png" alt="Editar usuario" width="400"></a>
      <br><sub><b>Editar usuario</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/12-confirmacion.png"><img src="docs/screenshots/12-confirmacion.png" alt="Diálogo de confirmación" width="400"></a>
      <br><sub><b>Diálogo de confirmación</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/13-perfil.png"><img src="docs/screenshots/13-perfil.png" alt="Mi perfil" width="400"></a>
      <br><sub><b>Mi perfil</b></sub>
    </td>
  </tr>
</table>

### 📱 Móvil

<table>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/19-movil-login.png"><img src="docs/screenshots/19-movil-login.png" alt="Login" width="220"></a>
      <br><sub><b>Login</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/20-movil-pacientes.png"><img src="docs/screenshots/20-movil-pacientes.png" alt="Pacientes" width="220"></a>
      <br><sub><b>Pacientes</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/21-movil-detalle.png"><img src="docs/screenshots/21-movil-detalle.png" alt="Detalle a pantalla completa" width="220"></a>
      <br><sub><b>Detalle a pantalla completa</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <a href="docs/screenshots/22-movil-agenda.png"><img src="docs/screenshots/22-movil-agenda.png" alt="Agenda" width="220"></a>
      <br><sub><b>Agenda</b></sub>
    </td>
    <td align="center" valign="top">
      <a href="docs/screenshots/23-movil-mi-agenda.png"><img src="docs/screenshots/23-movil-mi-agenda.png" alt="Mi agenda (médico)" width="220"></a>
      <br><sub><b>Mi agenda (médico)</b></sub>
    </td>
  </tr>
</table>

---

# 🚀 Tecnologías

Angular 22 · TypeScript · RxJS · Signals · Signal Forms · Standalone Components · Lazy loading · Guards por permisos · Reactive Forms · Angular CDK · Taiga UI · Tailwind CSS · Vitest

- **Zoneless + OnPush** con signals, `rxResource` y `linkedSignal`.
- **Rutas lazy** y bundle inicial reducido; los mocks se sustituyen en build (`fileReplacements`) y no llegan a producción.
- **Diseño responsive**: tablas en escritorio, listas `tuiCell` y detalle a pantalla completa en móvil.

