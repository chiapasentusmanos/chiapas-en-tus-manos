INSERT INTO "Category" ("id", "name", "slug") VALUES
  ('cat_hoteles', 'Hoteles', 'hoteles'),
  ('cat_tours', 'Tours', 'tours'),
  ('cat_restaurantes', 'Restaurantes', 'restaurantes'),
  ('cat_traslados', 'Traslados', 'traslados'),
  ('cat_experiencias', 'Experiencias', 'experiencias')
ON CONFLICT ("slug") DO NOTHING;

-- Para usuarios con contrasena funcional usa `npm run db:seed`.
-- Credenciales demo creadas por seed.ts:
-- admin@alianzachiapas.mx / Demo1234!
-- proveedor@alianzachiapas.mx / Demo1234!
-- agencia@alianzachiapas.mx / Demo1234!
