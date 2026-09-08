"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { type Language } from "@/lib/languages";

const LANGUAGE_KEY = "bizora-language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (stored && (stored === "en" || stored === "hi")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">
        {language === "en" ? "Switch to Hindi" : "अंग्रेज़ी में बदलें"}
      </span>
    </Button>
  );
}
