"use client";

import { useEffect, useState } from "react";

export function LanguageSelector() {
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    const saved = window.localStorage.getItem("chiapas_en_tus_manos_language") || "es";
    setLanguage(saved);
    document.documentElement.dataset.lang = saved;
    document.documentElement.lang = saved;
  }, []);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem("chiapas_en_tus_manos_language", value);
    document.documentElement.dataset.lang = value;
    document.documentElement.lang = value;
  }

  return (
    <label className="language-selector">
      <span className="lang-es">Idioma</span>
      <span className="lang-en">Language</span>
      <select value={language} onChange={(event) => changeLanguage(event.target.value)} aria-label="Idioma">
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
