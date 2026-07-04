import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

export const THEME_STORAGE_KEY = "fcs-theme";

// Inline script that runs BEFORE hydration to prevent flash of wrong theme.
// Light by default; user's saved choice wins.
export const themeInitScript = `
(function(){try{
  var k='${THEME_STORAGE_KEY}';
  var t=localStorage.getItem(k);
  if(t!=='light'&&t!=='dark'){t='light';}
  var r=document.documentElement;
  r.classList.remove('light','dark');
  r.classList.add(t);
  r.style.colorScheme=t;
}catch(e){document.documentElement.classList.add('light');}})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      setThemeState(stored === "dark" ? "dark" : "light");
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
  if (!c) return { theme: "light" as Theme, setTheme: () => {}, toggle: () => {} };
  return c;
}