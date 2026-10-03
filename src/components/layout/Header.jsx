
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Languages,
  CheckCheck,
  X,
  AlertCircle,
  Clock3,
  Users,
  Truck,
  Info,
  FileText,
  ArrowLeftRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  invoices as initialInvoices,
  customers as initialCustomers,
  transactions as initialTransactions,
} from "../../data/mockData";

const getStoredData = (key, fallback) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return fallback;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    return fallback;
  }
};

export default function Header({
  t,
  language,
  setLanguage,
  theme,
  setTheme,
  onMenuClick,
  dir,
}) {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  /*
   * =========================
   * Notifications
   * =========================
   */

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  const [invoices, setInvoices] = useState(() =>
    getStoredData("invoices", initialInvoices)
  );

  const [customers, setCustomers] = useState(() =>
    getStoredData("customers", initialCustomers)
  );

  const [suppliers, setSuppliers] = useState(() =>
    getStoredData("suppliers", [])
  );

  const [transactions, setTransactions] = useState(() =>
    getStoredData("transactions", initialTransactions)
  );

  const [readNotifications, setReadNotifications] =
    useState(() => {
      const saved =
        localStorage.getItem("readNotifications");

      if (!saved) return [];

      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    });

  const notificationRef = useRef(null);

  /*
   * =========================
   * Global Search
   * =========================
   */

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const searchRef = useRef(null);

  /*
   * Reload all data when another page changes it.
   */
  useEffect(() => {
    const updateData = () => {
      setInvoices(
        getStoredData("invoices", initialInvoices)
      );

      setCustomers(
        getStoredData("customers", initialCustomers)
      );

      setSuppliers(
        getStoredData("suppliers", [])
      );

      setTransactions(
        getStoredData(
          "transactions",
          initialTransactions
        )
      );
    };

    window.addEventListener(
      "invoicesUpdated",
      updateData
    );

    window.addEventListener(
      "customersUpdated",
      updateData
    );

    window.addEventListener(
      "suppliersUpdated",
      updateData
    );

    window.addEventListener(
      "transactionsUpdated",
      updateData
    );

    return () => {
      window.removeEventListener(
        "invoicesUpdated",
        updateData
      );

      window.removeEventListener(
        "customersUpdated",
        updateData
      );

      window.removeEventListener(
        "suppliersUpdated",
        updateData
      );

      window.removeEventListener(
        "transactionsUpdated",
        updateData
      );
    };
  }, []);

  /*
   * =========================
   * Close notifications
   * =========================
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * =========================
   * Close search
   * =========================
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * =========================
   * Search Results
   * =========================
   */

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    const results = [];

    /*
     * Customers
     */
    customers.forEach((customer) => {
      const matches =
        customer.name?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value);

      if (matches) {
        results.push({
          id: `customer-${customer.id}`,
          type: "customer",
          title: customer.name,
          description:
            customer.phone ||
            customer.email ||
            "Customer",
          icon: Users,
          iconClass:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
          path: "/customers",
        });
      }
    });

    /*
     * Invoices
     */
    invoices.forEach((invoice) => {
      const customer = customers.find(
        (customer) =>
          Number(customer.id) ===
          Number(invoice.customerId)
      );

      const matches =
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(value) ||
        customer?.name
          ?.toLowerCase()
          .includes(value) ||
        String(invoice.amount).includes(value);

      if (matches) {
        results.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          title:
            invoice.invoiceNumber ||
            `Invoice #${invoice.id}`,
          description:
            customer?.name ||
            "Invoice",
          icon: FileText,
          iconClass:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          path: "/invoices",
        });
      }
    });

    /*
     * Suppliers
     */
    suppliers.forEach((supplier) => {
      const matches =
        supplier.name?.toLowerCase().includes(value) ||
        supplier.phone?.toLowerCase().includes(value) ||
        supplier.email?.toLowerCase().includes(value);

      if (matches) {
        results.push({
          id: `supplier-${supplier.id}`,
          type: "supplier",
          title: supplier.name,
          description:
            supplier.phone ||
            supplier.email ||
            "Supplier",
          icon: Truck,
          iconClass:
            "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
          path: "/suppliers",
        });
      }
    });

    /*
     * Transactions
     */
    transactions.forEach((transaction) => {
      const matches =
        transaction.description
          ?.toLowerCase()
          .includes(value) ||
        transaction.category
          ?.toLowerCase()
          .includes(value) ||
        transaction.type
          ?.toLowerCase()
          .includes(value) ||
        String(transaction.amount).includes(value);

      if (matches) {
        results.push({
          id: `transaction-${transaction.id}`,
          type: "transaction",
          title: transaction.description,
          description:
            transaction.category ||
            "Transaction",
          icon: ArrowLeftRight,
          iconClass:
            "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          path: "/transactions",
        });
      }
    });

    return results.slice(0, 10);
  }, [
    search,
    customers,
    invoices,
    suppliers,
    transactions,
  ]);

  const handleSearchSelect = (result) => {
    setSearch("");
    setIsSearchOpen(false);
    navigate(result.path);
  };

  /*
   * =========================
   * Notifications
   * =========================
   */

  const notifications = useMemo(() => {
    const result = [];

    const overdueInvoices = invoices.filter(
      (invoice) => invoice.status === "overdue"
    );

    const pendingInvoices = invoices.filter(
      (invoice) => invoice.status === "pending"
    );

    overdueInvoices.forEach((invoice) => {
      result.push({
        id: `overdue-invoice-${invoice.id}`,
        type: "overdue",
        title: "Overdue Invoice",
        message: `${
          invoice.invoiceNumber ||
          `Invoice #${invoice.id}`
        } is overdue.`,
        amount: Number(invoice.amount || 0),
        date: invoice.date,
        icon: AlertCircle,
        iconClass:
          "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      });
    });

    pendingInvoices.forEach((invoice) => {
      result.push({
        id: `pending-invoice-${invoice.id}`,
        type: "pending",
        title: "Pending Invoice",
        message: `${
          invoice.invoiceNumber ||
          `Invoice #${invoice.id}`
        } is waiting for payment.`,
        amount: Number(invoice.amount || 0),
        date: invoice.date,
        icon: Clock3,
        iconClass:
          "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      });
    });

    customers
      .filter(
        (customer) =>
          Number(customer.balance || 0) > 0
      )
      .slice(0, 3)
      .forEach((customer) => {
        result.push({
          id: `customer-balance-${customer.id}`,
          type: "customer",
          title: "Customer Balance",
          message: `${customer.name} has an outstanding balance.`,
          amount: Number(customer.balance || 0),
          date: new Date().toISOString(),
          icon: Users,
          iconClass:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        });
      });

    suppliers
      .filter(
        (supplier) =>
          Number(supplier.balance || 0) > 0
      )
      .slice(0, 3)
      .forEach((supplier) => {
        result.push({
          id: `supplier-balance-${supplier.id}`,
          type: "supplier",
          title: "Supplier Payment",
          message: `${supplier.name} has an outstanding payment.`,
          amount: Number(supplier.balance || 0),
          date: new Date().toISOString(),
          icon: Truck,
          iconClass:
            "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        });
      });

    return result.slice(0, 10);
  }, [invoices, customers, suppliers]);

  const unreadNotifications = notifications.filter(
    (notification) =>
      !readNotifications.includes(notification.id)
  );

  const unreadCount = unreadNotifications.length;

  const markAsRead = (id) => {
    setReadNotifications((prev) => {
      if (prev.includes(id)) {
        return prev;
      }

      const updated = [...prev, id];

      localStorage.setItem(
        "readNotifications",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(
      (notification) => notification.id
    );

    setReadNotifications(allIds);

    localStorage.setItem(
      "readNotifications",
      JSON.stringify(allIds)
    );
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      language === "ar" ? "ar-EG" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu size={22} />
        </button>

        {/* ================= SEARCH ================= */}
        <div
          ref={searchRef}
          className="relative hidden w-64 md:block"
        >
          <Search
            size={18}
            className={`absolute top-1/2 z-10 -translate-y-1/2 text-slate-400 ${
              dir === "rtl"
                ? "right-3"
                : "left-3"
            }`}
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setIsSearchOpen(
                event.target.value.trim().length > 0
              );
            }}
            onFocus={() => {
              if (search.trim()) {
                setIsSearchOpen(true);
              }
            }}
            placeholder={t.search}
            className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white ${
              dir === "rtl"
                ? "pr-10 pl-3"
                : "pl-10 pr-3"
            }`}
          />

          {isSearchOpen && search.trim() && (
            <div
              className={`absolute top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 ${
                dir === "rtl"
                  ? "right-0"
                  : "left-0"
              }`}
            >
              {searchResults.length > 0 ? (
                <div className="max-h-[420px] overflow-y-auto py-2">
                  {searchResults.map((result) => {
                    const Icon = result.icon;

                    return (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() =>
                          handleSearchSelect(result)
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${result.iconClass}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                            {result.title}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {result.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Search
                    size={28}
                    className="mx-auto text-slate-300 dark:text-slate-600"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another name, invoice number or amount.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <h2 className="truncate text-sm font-bold text-slate-800 sm:text-base dark:text-white md:hidden">
          {t.appName}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={() =>
            setLanguage(
              language === "ar" ? "en" : "ar"
            )
          }
          title={t.language}
          className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Languages size={19} />
          <span>
            {language === "ar" ? "EN" : "عربي"}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setTheme(isDark ? "light" : "dark")
          }
          title={
            isDark ? t.lightMode : t.darkMode
          }
          aria-label={
            isDark ? t.lightMode : t.darkMode
          }
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {isDark ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* ================= NOTIFICATIONS ================= */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setIsNotificationsOpen(
                (prev) => !prev
              )
            }
            aria-label={t.notifications}
            aria-expanded={isNotificationsOpen}
            className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              className={`absolute top-14 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 ${
                dir === "rtl"
                  ? "left-0"
                  : "right-0"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1
                            ? "s"
                            : ""
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                  >
                    <CheckCheck size={15} />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(
                    (notification) => {
                      const Icon =
                        notification.icon;

                      const isRead =
                        readNotifications.includes(
                          notification.id
                        );

                      return (
                        <div
                          key={notification.id}
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          className={`group relative flex cursor-pointer gap-3 border-b border-slate-100 p-4 transition dark:border-slate-800 ${
                            isRead
                              ? "bg-white dark:bg-slate-950"
                              : "bg-emerald-50/50 dark:bg-emerald-500/[0.03]"
                          } hover:bg-slate-50 dark:hover:bg-slate-900`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.iconClass}`}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0 flex-1 pr-5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                {notification.title}
                              </p>

                              {!isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {notification.message}
                            </p>

                            {notification.amount > 0 && (
                              <p
                                dir="ltr"
                                className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300"
                              >
                                {formatMoney(
                                  notification.amount
                                )}
                              </p>
                            )}

                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatDate(
                                notification.date
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              markAsRead(
                                notification.id
                              );
                            }}
                            className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Mark as read"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCheck size={26} />
                    </div>

                    <h4 className="mt-4 font-bold text-slate-800 dark:text-white">
                      No notifications
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Everything looks good for now.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Info size={14} />

                  <span>
                    Notifications update automatically.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:flex dark:bg-emerald-500/20 dark:text-emerald-400">
          MG
        </div>
      </div>
    </header>
  );
}

