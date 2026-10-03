
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";

import { translations } from "./locales/translations";
import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function AccountingApp() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("accounting-language") || "ar"
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("accounting-theme") || "light"
  );

  const t = translations[language] || translations.ar;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    localStorage.setItem("accounting-language", language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("accounting-theme", theme);
  }, [theme]);

  return (
    <>
      <Toaster
        position={language === "ar" ? "top-left" : "top-right"}
        richColors
        closeButton
      />

      <Routes>
        <Route
          element={
            <DashboardLayout
              t={t}
              language={language}
              setLanguage={setLanguage}
              theme={theme}
              setTheme={setTheme}
            />
          }
        >
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard t={t} language={language} />}
          />

          <Route
            path="/invoices"
            element={<Invoices t={t} language={language} />}
          />

          <Route
            path="/transactions"
            element={<Transactions t={t} language={language} />}
          />

          <Route
            path="/customers"
            element={<Customers t={t} language={language} />}
          />

          <Route
            path="/suppliers"
            element={<Suppliers t={t} language={language} />}
          />

          <Route
            path="/reports"
            element={<Reports t={t} language={language} />}
          />

          <Route
            path="/settings"
            element={<Settings t={t} language={language} />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AccountingApp />
    </BrowserRouter>
  );
}