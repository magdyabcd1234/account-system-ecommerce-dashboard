
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  t,
  language,
  setLanguage,
  theme,
  setTheme,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white"
    >
      <Sidebar
        t={t}
        dir={dir}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          dir === "rtl" ? "lg:mr-64" : "lg:ml-64"
        }`}
      >
        <Header
          t={t}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          dir={dir}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}