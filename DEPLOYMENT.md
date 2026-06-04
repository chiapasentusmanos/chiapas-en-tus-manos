# Despliegue en Vercel + Supabase

Esta guia publica la web de **Chiapas En Tus Manos** con base de datos real.

## 1. Crear Supabase

1. Entra a Supabase y crea un proyecto nuevo.
2. Guarda la contrasena de la base de datos.
3. En el panel de Supabase abre **Connect**.
4. Copia el connection string del **Transaction pooler** para Vercel.
5. Reemplaza la contrasena en el string.

Formato recomendado para Vercel:

```env
DATABASE_URL="postgres://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

## 2. Variables de entorno en Vercel

Agrega estas variables en **Project Settings > Environment Variables**:

```env
DATABASE_URL=""
APP_SECRET=""
NEXT_PUBLIC_APP_URL=""
DEMO_MODE="false"
ADMIN_NOTIFICATION_EMAIL=""
ADMIN_NOTIFICATION_PHONE=""
EMAIL_FROM="Chiapas En Tus Manos <notificaciones@chiapasentusmanos.mx>"
RESEND_API_KEY=""
EMAIL_WEBHOOK_URL=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_PHONE=""
SMS_WEBHOOK_URL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
APPLE_REDIRECT_URI=""
```

Para `APP_SECRET` genera un valor seguro:

```bash
openssl rand -base64 48
```

## 3. Ejecutar migraciones y seed

Antes del primer deploy real, ejecuta migraciones contra Supabase desde local:

```bash
DATABASE_URL="TU_SUPABASE_DATABASE_URL" npm run prisma:deploy
DATABASE_URL="TU_SUPABASE_DATABASE_URL" npm run db:seed
```

En el proyecto Supabase `gqdtzxoqxwyxtsyybmbp` las migraciones ya fueron aplicadas correctamente desde este entorno. Si el seed por CLI no responde, carga al menos categorias y usuario administrador desde el SQL Editor con el bloque indicado durante la configuracion.

## 4. Desplegar en Vercel

### Opcion con dashboard

1. Sube este proyecto a GitHub.
2. En Vercel elige **Add New Project**.
3. Importa el repositorio.
4. Configura las variables del paso 2.
5. Deploy.

### Opcion con CLI

```bash
npm install -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add APP_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DEMO_MODE production
vercel deploy --prod
```

## 5. Verificacion posterior

1. Abre `/api/health` y confirma `"ok": true`.
2. Abre `/setup` y confirma conexion a base de datos.
3. Entra a `/registro` y crea proveedor, agencia, guia y Marca Chiapas de prueba.
4. Entra a `/admin` y aprueba registros.
5. Publica un servicio y un producto.
6. Confirma que aparecen en `/catalogo`, `/guias` y `/marca-chiapas`.
7. Entra como agencia y prueba `/agencia`: genera una cotizacion, descarga, imprime/PDF, WhatsApp y correo.
8. Prueba botones de WhatsApp.
9. Revisa `/privacidad` y `/terminos`.

## 6. Bloqueadores actuales para que Codex lo publique directamente

- No hay Vercel CLI instalado ni sesion iniciada.
- No hay Supabase CLI instalado ni sesion iniciada.
- No hay `VERCEL_TOKEN` ni `SUPABASE_ACCESS_TOKEN` disponibles en este entorno.
- El proyecto local aun no esta conectado a un repositorio Git remoto.

Cuando tengas Vercel y Supabase creados, comparte los valores de entorno o inicia sesion en las CLIs y se puede ejecutar el deploy.
