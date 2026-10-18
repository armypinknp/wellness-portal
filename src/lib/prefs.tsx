import { createContext, useContext, useEffect, useState, type ReactNode, type ContextType } from "react";
import { track } from "./analytics";
import { es } from "./es";

export type Lang = "en" | "es";
export type Theme = "light" | "dark";

type Prefs = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  largeText: boolean;
  setLargeText: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
};

const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangS] = useState<Lang>("en");
  const [theme, setThemeS] = useState<Theme>("dark");
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const l = localStorage.getItem("wp-lang") as Lang | null;
    if (l) setLangS(l);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", theme === "dark");
    el.classList.toggle("text-lg-mode", largeText);
    el.classList.toggle("reduce-motion", reduceMotion);
    el.lang = lang;
  }, [theme, largeText, reduceMotion, lang]);

  const setLang = (l: Lang) => {
    setLangS(l);
    localStorage.setItem("wp-lang", l);
    track(l === "en" ? "language_english_selected" : "language_spanish_selected");
  };
  const setTheme = (t: Theme) => {
    setThemeS(t);
    localStorage.setItem("wp-theme", t);
    track("accessibility_control_used", { control: "theme" });
  };

  return (
    <Ctx.Provider
      value={{ lang, setLang, theme, setTheme, largeText, setLargeText, reduceMotion, setReduceMotion }}
    >
      {children}
    </Ctx.Provider>
  );
}

// Safe fallback (e.g. during hot reload when the provider remounts) instead of blanking the page.
const fallbackPrefs = {
  lang: "en", setLang: () => {}, theme: "dark", setTheme: () => {},
  largeText: false, setLargeText: () => {}, reduceMotion: false, setReduceMotion: () => {},
} as unknown as NonNullable<ContextType<typeof Ctx>>;

export function usePrefs() {
  return useContext(Ctx) ?? fallbackPrefs;
}

// Interface-only strings. Survivor-facing content stays English until approved translations exist.
const dict = {
  en: {
    quickExit: "Quick Exit",
    home: "Home",
    savedItems: "My Saved Items",
    artRoom: "Art Room",
    calmRoom: "Calm Room",
    recoveryRooms: "Recovery Rooms",
    library: "Healing Library",
    notBroken: "You Are Not Broken",
    opportunities: "Opportunities",
    partners: "Wellness Partners",
    gallery: "Art Gallery",
    privacy: "Privacy",
    back: "Back",
    explore: "Explore",
    menu: "Menu",
    settings: "Display & accessibility",
    light: "Light",
    dark: "Dark",
    largeText: "Larger text",
    reduceMotion: "Reduce motion",
    begin: "Begin",
    gotIt: "Got it",
    okay: "Okay",
    next: "Continue",
    skip: "Skip",
    translationPending: "",
    saveDevice: "Save to my device",
    emailMe: "Email to myself",
    deleteSaved: "Delete saved content",
    play: "Play",
    pause: "Pause",
    captions: "Captions",
  },
  es: {
    quickExit: "Salida rápida",
    home: "Inicio",
    savedItems: "Mis elementos guardados",
    artRoom: "Sala de Arte",
    calmRoom: "Sala de Calma",
    recoveryRooms: "Salas de Recuperación",
    library: "Biblioteca de Sanación",
    notBroken: "No Estás Rota",
    opportunities: "Oportunidades",
    partners: "Aliados de Bienestar",
    gallery: "Galería de Arte",
    privacy: "Privacidad",
    back: "Volver",
    explore: "Explorar",
    menu: "Menú",
    settings: "Pantalla y accesibilidad",
    light: "Claro",
    dark: "Oscuro",
    largeText: "Texto más grande",
    reduceMotion: "Reducir movimiento",
    begin: "Comenzar",
    gotIt: "Entendido",
    okay: "De acuerdo",
    next: "Continuar",
    skip: "Omitir",
    translationPending: "Traducción al español en borrador, pendiente de revisión. Algunos contenidos aún están en inglés.",
    saveDevice: "Guardar en mi dispositivo",
    emailMe: "Enviarme por correo",
    deleteSaved: "Borrar contenido guardado",
    play: "Reproducir",
    pause: "Pausa",
    captions: "Subtítulos",
  },
} as const;

export type UIKey = keyof (typeof dict)["en"];

export function useT() {
  const { lang } = usePrefs();
  return (k: UIKey) => dict[lang][k];
}

/** Translate a feature string (draft Spanish); falls back to English when no entry exists. */
export function useTx() {
  const { lang } = usePrefs();
  return (s: string) => (lang === "es" ? es[s] ?? s : s);
}
