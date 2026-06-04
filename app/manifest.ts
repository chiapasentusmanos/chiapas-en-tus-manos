import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chiapas En Tus Manos",
    short_name: "Chiapas",
    description: "Servicios turisticos, guias certificados y productos Marca Chiapas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    categories: ["travel", "shopping", "business"],
    lang: "es-MX",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "Catalogo",
        short_name: "Catalogo",
        description: "Ver servicios turisticos aprobados",
        url: "/catalogo"
      },
      {
        name: "Guias",
        short_name: "Guias",
        description: "Ver guias certificados",
        url: "/guias"
      },
      {
        name: "Marca Chiapas",
        short_name: "Marca",
        description: "Ver productos Marca Chiapas",
        url: "/marca-chiapas"
      }
    ]
  };
}
