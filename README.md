# Chiapas En Tus Manos

MVP web para registrar proveedores turisticos, agencias, guias certificados y marcas Marca Chiapas, publicar servicios/productos, aprobarlos desde administracion y permitir reservas o solicitudes por WhatsApp.

## Stack

- Next.js App Router
- React
- API Routes
- PostgreSQL
- Prisma ORM
- Autenticacion email/password con cookie firmada
- Mapa embebido con OpenStreetMap
- Deploy sugerido: Vercel + Supabase

## Requisitos

- Node.js 20+
- npm
- PostgreSQL local o base Supabase
- Opcional: Docker para levantar PostgreSQL local

## Instalacion

```bash
npm install
cp .env.example .env
```

Configura `DATABASE_URL` y `APP_SECRET` en `.env`.

Si tienes Docker, puedes levantar PostgreSQL local con:

```bash
docker compose up -d
```

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Abre `http://localhost:3000`.

En macOS, si Next falla cargando SWC por firma del binario, usa:

```bash
npm run dev:wasm
npm run build:wasm
```

## Variables de entorno

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chiapas_en_tus_manos?schema=public"
APP_SECRET="cambia-este-secreto-largo-en-produccion"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEMO_MODE="false"
ADMIN_NOTIFICATION_EMAIL="admin@chiapasentusmanos.mx"
ADMIN_NOTIFICATION_PHONE="+529611234567"
EMAIL_FROM="Chiapas En Tus Manos <notificaciones@chiapasentusmanos.mx>"
RESEND_API_KEY=""
EMAIL_WEBHOOK_URL=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_PHONE=""
SMS_WEBHOOK_URL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/oauth/callback/google"
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
APPLE_REDIRECT_URI="http://localhost:3000/api/auth/oauth/callback/apple"
```

Para navegar el MVP sin PostgreSQL local, usa temporalmente `DEMO_MODE="true"`. El modo demo muestra home, catalogo, detalle, WhatsApp y solicitudes simuladas con datos de prueba. Para validar registro, proveedor y administracion reales, conecta PostgreSQL/Supabase y vuelve a `DEMO_MODE="false"`.

## Notificaciones de registro

Cuando se registra un cliente, proveedor, agencia o guia certificado, el sistema genera un codigo numerico de confirmacion, guarda el registro como `PENDING` y notifica al administrador por correo y SMS si las variables estan configuradas.

- Correo: usa `RESEND_API_KEY` o, alternativamente, `EMAIL_WEBHOOK_URL`.
- SMS: usa Twilio con `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM_PHONE`, o alternativamente `SMS_WEBHOOK_URL`.
- Destinatarios internos: `ADMIN_NOTIFICATION_EMAIL` y `ADMIN_NOTIFICATION_PHONE`.

Si no hay proveedor de correo/SMS configurado, las notificaciones se registran en consola para pruebas locales.

## Acceso Google y Apple/iOS

La pantalla de login incluye acceso con Google y Apple/iOS para clientes turistas. Configura las variables OAuth de Google o Apple para habilitar la redireccion real. Los clientes creados por OAuth nacen como `PENDING`, se notifican al administrador con codigo numerico y solo pueden entrar al catalogo cuando el administrador los acepta.

Credenciales demo disponibles con cualquier contrasena:

- Admin: `admin@demo.mx`
- Proveedor: `proveedor@demo.mx`
- Agencia: `agencia@demo.mx`
- Guia certificado: `guia@demo.mx`
- Marca Chiapas: `marca@demo.mx`

## Datos de prueba

El seed crea categorias, usuarios demo y servicios iniciales.

- Administrador: `admin@alianzachiapas.mx` / `Demo1234!`
- Proveedor: `proveedor@alianzachiapas.mx` / `Demo1234!`
- Agencia: `agencia@alianzachiapas.mx` / `Demo1234!`
- Guia certificado: `guia@alianzachiapas.mx` / `Demo1234!`
- Marca Chiapas: `marca@alianzachiapas.mx` / `Demo1234!`

## Flujo de aceptacion

1. Entra a `/registro` y crea un cliente, proveedor, agencia, guia certificado o Marca Chiapas. Tambien puedes iniciar con Google o Apple/iOS para crear cliente turista.
2. El administrador recibe correo y SMS con codigo numerico de confirmacion.
3. Entra como administrador en `/admin`.
4. Acepta o rechaza el registro pendiente. Al aceptar, el sistema envia correo de bienvenida.
5. El proveedor aceptado puede entrar a `/proveedor` y crear servicios.
6. El administrador aprueba el servicio pendiente.
7. El servicio aparece en `/catalogo`.
8. En la tarjeta o pagina individual, usa `Reservar por WhatsApp`.
9. Si entras como agencia, ve a `/agencia` para elaborar cotizaciones con IVA incluido, descargarlas y enviarlas por WhatsApp o correo.

## Base de datos

El esquema principal esta en `prisma/schema.prisma` e incluye:

- `User`
- `Provider`
- `Agency`
- `Guide`
- `BrandChiapasProfile`
- `BrandProduct`
- `BrandProductImage`
- `Service`
- `Category`
- `ReservationRequest`
- `Image`

Tambien se incluyen `prisma/init.sql` para crear tablas manualmente y `prisma/seed.sql` con categorias base. Para contrasenas demo funcionales usa `npm run db:seed`.

## Deploy en Vercel + Supabase

Consulta tambien [DEPLOYMENT.md](./DEPLOYMENT.md) para el paso a paso completo.
Tambien puedes validar produccion con `/api/health` despues del deploy.

1. Crea un proyecto en Supabase y copia el connection string PostgreSQL.
2. En Vercel, agrega `DATABASE_URL`, `APP_SECRET` y `NEXT_PUBLIC_APP_URL`.
3. Ejecuta migraciones desde local apuntando a Supabase:

```bash
npm run prisma:deploy
npm run db:seed
```

4. Despliega el repositorio en Vercel.

## Notas del MVP

- Las fotos se pueden subir como archivos JPG, PNG o WebP, y tambien registrar como URLs, una por linea.
- Los servicios muestran formas de pago: transferencia y tarjeta Visa / Mastercard.
- El catalogo permite filtrar servicios por forma de pago: transferencia o tarjeta Visa / Mastercard.
- Las solicitudes de reserva registran fecha deseada, numero de personas, forma de pago elegida y estado de seguimiento.
- Cada solicitud de reserva genera un folio tipo `CETM-123456` y notifica por correo al proveedor cuando hay destinatario configurado.
- Cuando el proveedor o administrador cambia el estado de una solicitud, se notifica por correo al cliente y se registra la ultima actualizacion.
- Clientes turistas y agencias tienen una vista `Mis reservas` para consultar el estado de sus solicitudes.
- Los servicios de proveedores nacen en estado `PENDING`.
- El administrador puede aprobar, rechazar, editar campos basicos y eliminar servicios.
- El administrador y el proveedor pueden dar seguimiento a solicitudes: nueva, contactada, confirmada o cancelada.
- La agencia puede registrarse, navegar el catalogo y el mensaje de WhatsApp se identifica como agencia.
- La agencia tiene panel propio en `/agencia` para elaborar cotizaciones practicas con subtotal, IVA incluido 16%, total, descarga, impresion/PDF, WhatsApp y correo.
- Los guias certificados tienen registro propio como `GUIDE`, con catalogo publico en `/guias`.
- El registro de guia exige tipo de guia `NOM-08` o `NOM-09`, alcance local o nacional, numero de certificacion, WhatsApp, idiomas, municipios o zonas de operacion, anos de experiencia, semblanza, certificacion en PDF e INE en PDF.
- El catalogo de guias permite filtrar por texto, tipo de guia y alcance local o nacional.
- El administrador puede aprobar o rechazar guias certificados desde `/admin`; solo los guias aprobados aparecen en `/guias`.
- Marca Chiapas tiene registro propio como `BRAND_CHIAPAS`, con panel en `/marca-chiapas/panel` y catalogo publico en `/marca-chiapas`.
- El registro Marca Chiapas exige RFC mexicano, numero de registro Marca Chiapas, nombre comercial, municipio, descripcion y WhatsApp.
- Los registrados Marca Chiapas pueden crear productos con categoria, municipio de origen, precio, descripcion, materiales/ingredientes, presentacion, existencias, envios, fotos por URL y formas de pago.
- El administrador puede aprobar/rechazar registros Marca Chiapas y productos; solo los productos aprobados aparecen en el catalogo publico.
- El registro de agencia exige RFC y Registro Nacional de Turismo (RNT).
- El registro de proveedor exige RFC y Registro Nacional de Turismo (RNT).
- El RFC debe capturarse en formato mexicano de 12 o 13 caracteres, por ejemplo `ABC010203AB1`.
- Proveedores y agencias deben subir en PDF: documento RFC, documento RNT, INE y comprobante de domicilio fiscal. Los cuatro archivos son obligatorios y se muestran al administrador.
- En el registro, todos los campos visibles son obligatorios para el tipo de usuario seleccionado.
- Para administrador, el registro solo solicita nombre de usuario, correo electronico y contrasena. La recuperacion de contrasena se inicia por correo electronico o telefono desde `/recuperar-contrasena`.
- El selector de idioma ES/EN solo aparece en acceso publico. Los paneles internos, datos enviados, solicitudes y mensajes operativos permanecen en español para administracion.
