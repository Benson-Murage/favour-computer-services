import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

export const THEME_STORAGE_KEY = "fcs-theme";

// Inline script that runs BEFORE hydration to prevent flash of wrong theme.
// Dark by default.
export const themeInitScript = `
(function(){try{
  var k='${THEME_STORAGE_KEY}';
  var t=localStorage.getItem(k);
  if(t!=='light'&&t!=='dark'){t='dark';}
  var r=document.documentElement;
  r.classList.remove('light','dark');
  r.classList.add(t);
  r.style.colorScheme=t;
}catch(e){document.documentElement.classList.add('dark');}})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      setThemeState(stored === "light" ? "light" : "dark");
    } catch { /* empty */ }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_STORAGE_KEY, t); } catch { /* empty */ }
    const r = document.documentElement;
    r.classList.remove("light", "dark");
    r.classList.add(t);
    r.style.colorScheme = t;
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  return <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) return { theme: "dark" as Theme, setTheme: () => {}, toggle: () => {} };
  return c;
}