import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });

  useEffect(() => {
    if (isDark) {
      localStorage.setItem("darkMode", "true");
      document.body.classList.add("dark");
    } else {
      localStorage.setItem("darkMode", "false");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  return {
    isDark,
    setIsDark,
  };
}
