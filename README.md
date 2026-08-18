# PRO-RIFA

Aplicación de rifa solidaria a beneficio de Maida, deportista de ciclismo.
Incluye una página pública para elegir números y reservar por WhatsApp, y un
panel de administración para gestionar ventas.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Express + Prisma + PostgreSQL (Neon) + JWT

## Estructura

```
PRO-RIFA/
├── src/                  # Frontend (React)
│   ├── pages/Rifa/       # Página pública de la rifa
│   ├── pages/Admin/      # Login + panel de administración
│   └── services/api.ts   # Cliente de la API
├── public/               # Imágenes estáticas (background, maida)
├── backend/              # Backend (Express + Prisma)
│   ├── prisma/           # Schema, migraciones y seed
│   └── src/
│       ├── routes/       # /api/auth, /api/raffles, /api/admin
│       └── services/     # Lógica de negocio
```

## Puesta en marcha (desarrollo)

### 1. Backend

La base de datos es PostgreSQL alojada en [Neon](https://neon.tech) (plan gratuito).
Crea un proyecto y **dos bases de datos**: `neondb` (desarrollo) y `neondb_test`
(tests). Copia la URL de conexión sin pooling (directa).

```bash
cd backend
npm install

# Configurar variables (copiar y ajustar)
cp .env.example .env
#  - DATABASE_URL: URL de "neondb"
#  - TEST_DATABASE_URL: URL de "neondb_test"

# Base de datos: migrar y sembrar datos iniciales
npm run db:migrate
npm run db:seed

# Tests (aplica migraciones a neondb_test y corre la suite aislada)
npm test

# Levantar API en http://localhost:4000
npm run dev
```

Variables relevantes en `backend/.env`:

```
PORT=4000
DATABASE_URL="postgresql://USUARIO:CONTRASENA@ep-XXXX.region.aws.neon.tech/neondb?sslmode=require"
TEST_DATABASE_URL="postgresql://USUARIO:CONTRASENA@ep-XXXX.region.aws.neon.tech/neondb_test?sslmode=require"
ADMIN_USERNAME=****
ADMIN_PASSWORD=****
JWT_SECRET=****
FRONTEND_ORIGIN=http://localhost:5173
COOKIE_SECURE=false   # true solo en HTTPS/producción
```

- `FRONTEND_ORIGIN`: origen permitido por CORS (en dev es Vite).
- `COOKIE_SECURE`: marca la cookie de sesión como `Secure` (requiere HTTPS).

La autenticación usa una cookie `httpOnly` con JWT (expira en 1 día). El login
tiene rate-limit (10 intentos / 15 min por IP).

### 2. Frontend

```bash
npm install

# Tests (vitest + Testing Library)
npm test

# Levantar en http://localhost:5173 (proxy de /api -> :4000)
npm run dev
```

## Producción

El backend sirve el frontend compilado desde la misma carpeta `dist`:

```bash
# Compilar frontend
npm run build

# Compilar backend y levantar
cd backend
npm run build
npm start
```

En el servidor de producción configura la variable `DATABASE_URL` apuntando a la
base de Neon (misma URL de `neondb`) y aplica las migraciones **una sola vez**
al desplegar:

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
npm run db:seed
npm start
```

La aplicación queda disponible en `http://localhost:4000`
(`/rifa` para la página pública y `/admin` para el panel).

## API

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| GET | `/api/health` | público | Estado del servidor y la BD |
| GET | `/api/raffles` | público | Lista rifas activas con premios y números |
| GET | `/api/raffles/:id` | público | Detalle de una rifa activa |
| GET | `/api/raffles/:id/numbers` | público | Números de una rifa activa |
| POST | `/api/auth/login` | público | Login de admin (setea cookie httpOnly, con rate-limit) |
| POST | `/api/auth/logout` | cookie | Cierra sesión y limpia la cookie |
| GET | `/api/admin/me` | cookie | Valida la sesión y devuelve el usuario |
| GET | `/api/admin/raffles` | cookie | Lista todas las rifas (activas e inactivas) |
| GET | `/api/admin/raffles/:id/numbers` | cookie | Números con datos del cliente |
| PATCH | `/api/admin/raffles/:id/numbers/:number` | cookie | Marcar pendiente, vendido o liberar |
| PATCH | `/api/admin/raffles/:id` | cookie | Editar datos, premios, WhatsApp, activar/cerrar |

## Flujo de reservas

1. Un visitante elige números en `/rifa` y envía el mensaje por WhatsApp.
2. El administrador recibe el mensaje en su WhatsApp y en el panel
   (`/admin` → pestaña **Reservas**) marca el número como pendiente con el
   nombre y teléfono del cliente.
3. Al confirmar el pago, pasa el número a **Vendido** (o lo **Libera** si no
   se concretó).
4. La página pública se actualiza sola (~10 s): los números reservados y
   vendidos dejan de estar disponibles para otros visitantes.

## Notas

- El número de WhatsApp de la página pública se configura en
  `/admin` → **Configuración** (campo *WhatsApp de contacto*). Si está vacío,
  se usa el de `src/constants/rifa.ts` (`WHATSAPP_NUMBER`).
- La imagen de perfil de la rifa (`/maida.svg`) es un placeholder: reemplaza el
  archivo en `public/` y ajusta `personImage` en la configuración cuando tengas
  la foto real.
