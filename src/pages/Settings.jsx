
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Globe2,
  Palette,
  Bell,
  ReceiptText,
  Save,
  RotateCcw,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultSettings = {
  companyName: "My Accounting System",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  currency: "EGP",
  language: "en",
  theme: "system",
  emailNotifications: true,
  invoiceNotifications: true,
  overdueNotifications: true,
  invoicePrefix: "INV",
};

export default function Settings({ t }) {
  const [settings, setSettings] = useState(() => {
    const savedSettings =
      localStorage.getItem("accountingSettings");

    if (!savedSettings) {
      return defaultSettings;
    }

    try {
      return {
        ...defaultSettings,
        ...JSON.parse(savedSettings),
      };
    } catch {
      return defaultSettings;
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    root.classList.toggle("dark", prefersDark);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);

    localStorage.setItem(
      "accountingSettings",
      JSON.stringify(settings)
    );

    window.dispatchEvent(
      new Event("settingsUpdated")
    );

    setTimeout(() => {
      setIsSaving(false);
      toast.success("تم حفظ الإعدادات بنجاح");
    }, 400);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "هل أنت متأكد من استعادة الإعدادات الافتراضية؟"
    );

    if (!confirmed) return;

    setSettings({
      ...defaultSettings,
    });

    localStorage.setItem(
      "accountingSettings",
      JSON.stringify(defaultSettings)
    );

    applyTheme(defaultSettings.theme);

    window.dispatchEvent(
      new Event("settingsUpdated")
    );

    toast.success("تمت استعادة الإعدادات الافتراضية");
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
      />

      <PageHeader
        title={t.settings}
        description="Configure your accounting system preferences."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw size={17} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Company Information */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Company Information
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Basic information about your business.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Company Name
              </label>

              <input
                type="text"
                value={settings.companyName}
                onChange={(event) =>
                  handleChange(
                    "companyName",
                    event.target.value
                  )
                }
                placeholder="Company name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={settings.companyEmail}
                onChange={(event) =>
                  handleChange(
                    "companyEmail",
                    event.target.value
                  )
                }
                placeholder="company@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Phone
              </label>

              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(event) =>
                  handleChange(
                    "companyPhone",
                    event.target.value
                  )
                }
                placeholder="01xxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Address
              </label>

              <textarea
                rows="3"
                value={settings.companyAddress}
                onChange={(event) =>
                  handleChange(
                    "companyAddress",
                    event.target.value
                  )
                }
                placeholder="Company address"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Regional Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Globe2 size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Regional Settings
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Currency and language preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Currency
              </label>

              <select
                value={settings.currency}
                onChange={(event) =>
                  handleChange(
                    "currency",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="EGP">
                  Egyptian Pound (EGP)
                </option>

                <option value="USD">
                  US Dollar (USD)
                </option>

                <option value="EUR">
                  Euro (EUR)
                </option>

                <option value="SAR">
                  Saudi Riyal (SAR)
                </option>

                <option value="AED">
                  UAE Dirham (AED)
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Language
              </label>

              <select
                value={settings.language}
                onChange={(event) =>
                  handleChange(
                    "language",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <Palette size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Appearance
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Customize the application appearance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Theme
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "light",
                  label: "Light",
                },
                {
                  value: "dark",
                  label: "Dark",
                },
                {
                  value: "system",
                  label: "System",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleChange(
                      "theme",
                      option.value
                    )
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    settings.theme === option.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Control system notification preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ToggleSetting
              title="Email Notifications"
              description="Receive important updates by email."
              checked={settings.emailNotifications}
              onChange={() =>
                handleToggle("emailNotifications")
              }
            />

            <ToggleSetting
              title="Invoice Notifications"
              description="Get notified about invoice activity."
              checked={settings.invoiceNotifications}
              onChange={() =>
                handleToggle("invoiceNotifications")
              }
            />

            <ToggleSetting
              title="Overdue Notifications"
              description="Get notified when invoices become overdue."
              checked={settings.overdueNotifications}
              onChange={() =>
                handleToggle("overdueNotifications")
              }
            />
          </div>
        </section>

        {/* Invoice Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <ReceiptText size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Invoice Settings
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Configure invoice numbering.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="max-w-md">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Invoice Prefix
              </label>

              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(event) =>
                  handleChange(
                    "invoicePrefix",
                    event.target.value
                  )
                }
                placeholder="INV"
                maxLength="10"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm uppercase outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Example: {settings.invoicePrefix || "INV"}
                -1001
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Save */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-emerald-600"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

