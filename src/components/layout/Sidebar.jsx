
import {
  LayoutDashboard,
  ReceiptText,
  ArrowLeftRight,
  Users,
  Truck,
  ChartNoAxesCombined,
  Settings,
  BookOpen,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { key: "invoices", path: "/invoices", icon: ReceiptText },
  { key: "transactions", path: "/transactions", icon: ArrowLeftRight },
  { key: "customers", path: "/customers", icon: Users },
  { key: "suppliers", path: "/suppliers", icon: Truck },
  { key: "reports", path: "/reports", icon: ChartNoAxesCombined },
  { key: "settings", path: "/settings", icon: Settings },
];

export default function Sidebar({
  t,
  isOpen,
  onClose,
  dir,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 z-50 flex w-64 flex-col
          border-slate-200 bg-white transition-transform duration-300
          dark:border-slate-800 dark:bg-slate-950
          ${dir === "rtl" ? "right-0 border-l" : "left-0 border-r"}
          ${
            isOpen
              ? "translate-x-0"
              : dir === "rtl"
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <BookOpen size={23} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t.appName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.overview}
          </p>

          {menuItems.map(({ key, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`
              }
            >
              <Icon size={20} />
              <span>{t[key]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {t.appName}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.appSubtitle}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}