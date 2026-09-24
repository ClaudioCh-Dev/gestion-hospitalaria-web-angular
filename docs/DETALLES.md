# 📖 Detalles técnicos — Gestión Hospitalaria Frontend

Documentación técnica del frontend. Para la instalación, ver el [README](../README.md).

---

## Índice

1. [Arquitectura](#-arquitectura)
2. [Rutas de la aplicación](#-rutas-de-la-aplicación)
3. [Environments](#-environments)
4. [Modo Mock vs HTTP](#-modo-mock-vs-http)
5. [Comunicación con el backend](#-comunicación-con-el-backend)
6. [Endpoints consumidos](#-endpoints-consumidos)
7. [Autenticación](#-autenticación)
8. [Manejo de errores](#-manejo-de-errores)
9. [Build](#-build)
10. [Convenciones](#-convenciones)
11. [Estado del proyecto](#-estado-del-proyecto)

---

## 🏗️ Arquitectura

Estructura orientada a funcionalidades (*feature-based*):

```text
src/
├── app/
│   ├── core/
│   │   ├── interceptors/     → auth.interceptor, error.interceptor
│   │   └── services/         → auth, manejo de errores, notificaciones
│   │
│   ├── shared/
│   │   ├── components/       → alert-notification, error, modal-form, record-card
│   │   ├── models/           → PageResponse, ProblemDetail, ...
│   │   ├── operators/
│   │   ├── pipes/
│   │   └── services/
│   │
│   ├── layout/               → layout, navbar, sidebar
│   │
│   ├── features/
│   │   ├── auth/             → login
│   │   ├── dashboard/
│   │   ├── patient/
│   │   ├── doctor/
│   │   ├── appointment/
│   │   ├── medical-history/
│   │   └── billing/
│   │
│   ├── app.config.ts         → providers (HTTP, interceptors, Mock/HTTP)
│   └── app.routes.ts
│
├── environments/             → generados por src/scripts/start-environments.js
└── scripts/
    └── start-environments.js
```

Cada feature sigue la misma organización:

```text
features/patient/
├── components/
├── interfaces/     → modelos Request / Response
├── mocks/          → datos simulados
├── pages/
└── services/
    ├── patient.service.ts        → contrato (clase abstracta)
    ├── patient.service.http.ts   → implementación HTTP
    └── patient.service.mock.ts   → implementación Mock
```

- **Core**: elementos globales (interceptors, autenticación, manejo de errores).
- **Shared**: componentes, modelos, pipes y utilidades reutilizables.
- **Layout**: estructura visual común (navbar y sidebar).
- **Features**: cada módulo funcional aislado con su propia lógica.

---

## 🧭 Rutas de la aplicación

| Ruta                   | Página                       | Carga        |
| ---------------------- | ---------------------------- | ------------ |
| `/login`               | Login                        | Eager        |
| `/dashboard`           | Dashboard                    | Eager        |
| `/patients`            | CRUD de pacientes            | Lazy         |
| `/doctors`             | CRUD de doctores             | Lazy         |
| `/appointments`        | Listado de citas             | Lazy         |
| `/appointments/create` | Creación de cita             | Lazy         |
| `/appointment-types`   | Tipos de cita y tarifas      | Lazy         |
| `/medical-records`     | Historial médico             | Lazy         |
| `/billing`             | Facturación                  | Lazy         |
| `''` / `**`            | Redirige a `/dashboard`      | —            |

Todas las rutas (excepto `/login`) se renderizan dentro del `Layout`.

---

## ⚙️ Environments

Los environments se generan con:

```bash
npm run env   # node src/scripts/start-environments.js
```

El script lee `.env` (con `dotenv`) y falla si falta `API_URL` o `AUTH_URL`.

Estructura de cada environment:

```ts
export const environment = {
  useMocks: boolean,
  api: {
    baseUrl: string,  // API Gateway
    authUrl: string,  // Auth Server (incluye /auth-server)
  },
};
```

| Archivo               | Configuración Angular | `useMocks` | `baseUrl`               | `authUrl`                            |
| --------------------- | --------------------- | ---------- | ----------------------- | ------------------------------------ |
| `environment.ts`      | base                  | `true`     | `http://localhost:4040` | `http://localhost:3000/auth-server`  |
| `environment.dev.ts`  | `development`         | `false`    | `http://localhost:4040` | `http://localhost:3000/auth-server`  |
| `environment.mock.ts` | `mock`                | `true`     | `http://localhost:4040` | `http://localhost:3000/auth-server`  |
| `environment.prod.ts` | `production`          | `false`    | `API_URL`               | `AUTH_URL`                           |

Angular reemplaza `environment.ts` por el archivo correspondiente mediante `fileReplacements` en `angular.json`.

| Comando              | Configuración |
| -------------------- | ------------- |
| `npm start`          | development   |
| `npm run start:mock` | mock          |
| `npm run build`      | production    |
| `npm run watch`      | development   |

---

## 🧪 Modo Mock vs HTTP

Cada servicio de dominio es una clase abstracta con dos implementaciones. En `app.config.ts` se elige cuál inyectar según `environment.useMocks`:

```ts
{
  provide: PatientService,
  useClass: environment.useMocks ? PatientMockService : PatientHttpService,
}
```

```text
                  ┌── PatientHttpService ──→ API REST
PatientService ───┤
                  └── PatientMockService ──→ Datos simulados
```

Servicios con doble implementación: `PatientService`, `DoctorService`, `AppointmentService`, `AppointmentTypeService`, `BillingRecordService`, `BillingTariffService`, `MedicalRecordService`.

Los componentes solo dependen del contrato, por lo que no cambian entre modos.

---

## 🔌 Comunicación con el backend

```text
Component → Service (contrato) → HttpService → HttpClient
         → authInterceptor → errorInterceptor → API Gateway (4040) → Microservicio
```

El API Gateway enruta por prefijo (perfil `oauth2`) hacia cada microservicio, cuyo `context-path` coincide con ese prefijo:

| Prefijo gateway      | Microservicio             |
| -------------------- | ------------------------- |
| `/patients/**`       | patient-ms                |
| `/doctors/**`        | doctor-ms                 |
| `/appointments/**`   | appointment-ms            |
| `/billings/**`       | billing-ms                |
| `/medical-records/**`| medical-record-listener   |
| `/notifications/**`  | notification-ms           |

El **auth-server** no pasa por el gateway: el frontend lo llama directamente en `authUrl`.

---

## 📡 Endpoints consumidos

`{api}` = `environment.api.baseUrl` · `{auth}` = `environment.api.authUrl`

### Autenticación — `AuthService`

| Método | Endpoint                      | Descripción                       |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `{auth}/auth/login`           | Login, devuelve `accessToken`     |
| POST   | `{auth}/auth/refresh-token`   | Renueva el token (cookie)         |
| POST   | `{auth}/auth/logout`          | Cierra sesión                     |

### Pacientes — `PatientHttpService`

| Método | Endpoint                                   |
| ------ | ------------------------------------------ |
| GET    | `{api}/patients/crud?page&size&gender&search` |
| GET    | `{api}/patients/crud/{id}`                 |
| GET    | `{api}/patients/crud/document/{document}`  |
| POST   | `{api}/patients/crud`                      |
| PUT    | `{api}/patients/crud/{id}`                 |
| DELETE | `{api}/patients/crud/{id}`                 |

### Doctores — `DoctorHttpService`

| Método | Endpoint                                          |
| ------ | ------------------------------------------------- |
| GET    | `{api}/doctors/crud?page&size&search`             |
| GET    | `{api}/doctors/crud/{id}`                         |
| GET    | `{api}/doctors/crud/specialty/{id}?page&size&search` |
| POST   | `{api}/doctors/crud`                              |
| PUT    | `{api}/doctors/crud/{id}`                         |
| GET    | `{api}/doctors/specialties`                       |
| POST   | `{api}/doctors/specialties`                       |

### Citas — `AppointmentHttpService`

| Método | Endpoint                                   |
| ------ | ------------------------------------------ |
| GET    | `{api}/appointments/crud?page&size`        |
| GET    | `{api}/appointments/crud/{id}`             |
| GET    | `{api}/appointments/crud/patient/{id}`     |
| GET    | `{api}/appointments/crud/doctor/{id}`      |
| GET    | `{api}/appointments/crud/date/{date}`      |
| POST   | `{api}/appointments/crud`                  |
| PATCH  | `{api}/appointments/crud/{id}/status`      |
| DELETE | `{api}/appointments/crud/{id}` (cancelar)  |

Transiciones de estado (mismas reglas que appointment-ms):

| Estado actual | Acciones disponibles              |
| ------------- | --------------------------------- |
| `SCHEDULED`   | Confirmar, completar, cancelar    |
| `CONFIRMED`   | Completar, cancelar               |
| `COMPLETED`   | Ninguna (estado final)            |
| `CANCELLED`   | Ninguna (estado final)            |

### Tipos de cita — `AppointmentTypeHttpService`

| Método | Endpoint                                          |
| ------ | ------------------------------------------------- |
| GET    | `{api}/appointments/appointment-types`            |
| GET    | `{api}/appointments/appointment-types/{id}`       |
| POST   | `{api}/appointments/appointment-types`            |
| PUT    | `{api}/appointments/appointment-types/{id}`       |
| DELETE | `{api}/appointments/appointment-types/{id}` (desactivar) |

### Tarifas — `BillingTariffHttpService`

| Método | Endpoint                                 |
| ------ | ---------------------------------------- |
| GET    | `{api}/billings/tariffs`                 |
| GET    | `{api}/billings/tariffs/{appointmentTypeId}` |
| POST   | `{api}/billings/tariffs`                 |
| PUT    | `{api}/billings/tariffs/{appointmentTypeId}` |

Al crear un tipo de cita, appointment-ms publica `appointment-created-type` y billing-ms crea la tarifa. Al editar, el frontend actualiza la tarifa (o la crea si todavía no existe).

### Facturación — `BillingRecordHttpService`

| Método | Endpoint                                        |
| ------ | ----------------------------------------------- |
| GET    | `{api}/billings/crud?page&size&status&search&patientIds&sort` |
| GET    | `{api}/billings/crud/summary`                   |
| GET    | `{api}/billings/crud/patient/{id}?page&size`    |
| POST   | `{api}/billings/crud`                           |
| PATCH  | `{api}/billings/crud/{id}/pay`                  |

### Historial médico — `MedicalRecordHttpService`

| Método | Endpoint                                              |
| ------ | ----------------------------------------------------- |
| GET    | `{api}/medical-records/crud?page&size&search&specialty` |
| GET    | `{api}/medical-records/crud/summary`                  |
| GET    | `{api}/medical-records/crud/patient/{id}?page&size`   |

Las respuestas paginadas usan `PageResponse<T>` (`shared/models/page.type.ts`), compatible con `Page` de Spring.

### Búsqueda y resúmenes

- **`search`**: búsqueda parcial sin distinguir mayúsculas, resuelta en cada microservicio. Las páginas esperan 300 ms sin teclear (debounce) antes de consultar.
  - Pacientes: nombres, apellidos, DNI o correo.
  - Médicos: nombre, colegiatura, correo o especialidad.
  - Historial: paciente, médico, especialidad o motivo.
  - Facturación: billing-ms no guarda nombres, así que `search` solo acepta un número de factura, cita o paciente. Para buscar por nombre, el frontend consulta primero patient-ms y envía los IDs en `patientIds`.
- **`sort`** (facturación): formato de Spring, por ejemplo `issuedAt,desc` o `amount,asc`.
- **`/summary`**: totales calculados en el backend para las tarjetas de estadísticas y el dashboard (facturación: cantidad y monto por estado y cobrado en el mes; historial: consultas, pacientes únicos, completadas, ingresos y especialidades).

---

## 🔐 Autenticación

- `AuthService` guarda el `accessToken` en memoria (Signal), no en `localStorage`.
- El refresh token viaja en una cookie, por eso login, refresh y logout usan `withCredentials: true`.
- `authInterceptor`:
  1. Ignora las peticiones a `/auth/login`, `/auth/refresh-token` y `/auth/logout`.
  2. Agrega `Authorization: Bearer <token>` al resto.
  3. Ante un `401`, llama a `refreshToken()` y reintenta la petición con el nuevo token.
  4. Si el refresh falla, limpia el token.

---

## 🚨 Manejo de errores

- `errorInterceptor` captura los errores HTTP.
- El backend responde en formato **Problem Details** (`ProblemDetailMicroservice`: `title`, `detail`, `status`, `code`, `type`, `instance`).
- `NotificationHttpService` muestra el error como notificación de Taiga UI (se cierra a los 5 s).
- Cuando un microservicio no responde, el gateway devuelve un Problem Detail desde su `fallback` (circuit breaker).

---

## 🏗️ Build

```bash
npm run build
```

1. `prebuild` ejecuta `npm run env` y regenera los environments desde `.env`.
2. Se compila con la configuración **production** (por defecto en `angular.json`).
3. `environment.ts` se reemplaza por `environment.prod.ts` (`API_URL` / `AUTH_URL`).
4. La salida queda en `dist/`.

---

## 📁 Convenciones

- Standalone Components y Lazy Loading.
- Signals para estado local.
- Reactive / Typed Forms.
- Modelos separados en Request y Response.
- Servicios como contrato abstracto + implementaciones HTTP y Mock.
- Los componentes nunca llaman a `HttpClient` directamente.
- Interceptors para autenticación y errores.

---

## 📌 Estado del proyecto

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
| Estados de citas      | ✅      |
| Tipos de cita/tarifas | ✅      |
| Historial médico      | ✅      |
| Facturación           | ✅      |
| Integración REST      | ✅      |
| Autenticación         | 🚧     |
| Notificaciones        | 🚧     |

---

## 📚 Recursos

- [Angular](https://angular.dev/)
- [Taiga UI](https://taiga-ui.dev/)
- [Angular CDK](https://material.angular.dev/cdk/categories)
- [RxJS](https://rxjs.dev/)
- [Vitest](https://vitest.dev/)
