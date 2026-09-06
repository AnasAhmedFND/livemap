"use client";

import { createContext, useContext, useEffect, useState } from "react";


// ==========================================
// 🎨 THEME CONTEXT
// ==========================================

const ThemeContext = createContext();


// ==========================================
// 🎨 THEME PROVIDER
// ==========================================

export default function ThemeProvider({ children }) {

  const [theme, setTheme] = useState("dark");


  // ==========================================
  // 🌙 APPLY THEME TO HTML
  // ==========================================

  useEffect(() => {

    const root = document.documentElement;

    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

  }, [theme]);


  // ==========================================
  // 🔄 CHANGE THEME
  // ==========================================

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };


  return (
    <ThemeContext.Provider
      value={{
        theme,
        changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


// ==========================================
// 🪝 USE THEME HOOK
// ==========================================

export function useTheme() {
  return useContext(ThemeContext);
}