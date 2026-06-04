# Publicacion en App Store y Play Store

La app actual es una web responsiva con PWA. Para publicarla en tiendas hay dos caminos:

## Camino recomendado para MVP

1. Desplegar la web en Vercel con Supabase.
2. Activar dominio propio y HTTPS.
3. Crear una app movil contenedora con Capacitor.
4. Usar la URL web como fuente principal.
5. Generar builds Android e iOS.
6. Subir a Google Play Console y App Store Connect.

## Cuentas necesarias

- Apple Developer Program: cuenta anual de Apple.
- Google Play Console: cuenta de desarrollador de Google.
- Cuenta Vercel.
- Proyecto Supabase PostgreSQL.
- Dominio propio recomendado.

## Assets necesarios para tiendas

- Icono 1024 x 1024 PNG.
- Capturas para telefono Android.
- Capturas para iPhone.
- Politica de privacidad publica: `/privacidad`.
- Terminos y condiciones: `/terminos`.
- Correo de soporte.
- Nombre final: Chiapas En Tus Manos.
- Descripcion corta y larga.

## Checklist tecnico previo

- Ejecutar migraciones en Supabase.
- Configurar variables de entorno en Vercel.
- Probar registro, aprobacion, catalogos y WhatsApp en produccion.
- Configurar OAuth real de Google y Apple.
- Revisar y completar datos legales finales en `/privacidad` y `/terminos`.
- Definir manejo real de pagos si se activara cobro con tarjeta.

## Comandos base cuando se agregue Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Chiapas En Tus Manos" mx.chiapasentusmanos.app
npx cap add ios
npx cap add android
npx cap sync
```

Despues se abre Android Studio para Play Store y Xcode para App Store.
