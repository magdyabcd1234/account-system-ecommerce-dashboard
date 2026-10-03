
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
  Users,
  Truck,
  CircleDollarSign,
  Printer,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import PageHeader from "../components/common/PageHeader";

import {
  invoices as initialInvoices,
  expenses as initialExpenses,
  customers as initialCustomers,
} from "../data/mockData";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

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

export default function Reports({ t }) {
  const [invoiceList, setInvoiceList] = useState(() =>
    getStoredData("invoices", initialInvoices)
  );

  const [expenseList, setExpenseList] = useState(() =>
    getStoredData("expenses", initialExpenses)
  );

  const [customerList, setCustomerList] = useState(() =>
    getStoredData("customers", initialCustomers)
  );

  const [supplierList, setSupplierList] = useState(() =>
    getStoredData("suppliers", [])
  );

  const [reportPeriod, setReportPeriod] = useState("all");

  useEffect(() => {
    const updateData = () => {
      setInvoiceList(
        getStoredData("invoices", initialInvoices)
      );

      setExpenseList(
        getStoredData("expenses", initialExpenses)
      );

      setCustomerList(
        getStoredData("customers", initialCustomers)
      );

      setSupplierList(
        getStoredData("suppliers", [])
      );
    };

    window.addEventListener(
      "invoicesUpdated",
      updateData
    );

    window.addEventListener(
      "expensesUpdated",
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

    return () => {
      window.removeEventListener(
        "invoicesUpdated",
        updateData
      );

      window.removeEventListener(
        "expensesUpdated",
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
    };
  }, []);

  /*
   * Filter invoices and expenses
   * according to selected period.
   */
  const filteredInvoices = useMemo(() => {
    if (reportPeriod === "all") {
      return invoiceList;
    }

    const now = new Date();

    return invoiceList.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);

      if (reportPeriod === "month") {
        return (
          invoiceDate.getMonth() === now.getMonth() &&
          invoiceDate.getFullYear() ===
            now.getFullYear()
        );
      }

      if (reportPeriod === "year") {
        return (
          invoiceDate.getFullYear() ===
          now.getFullYear()
        );
      }

      return true;
    });
  }, [invoiceList, reportPeriod]);

  const filteredExpenses = useMemo(() => {
    if (reportPeriod === "all") {
      return expenseList;
    }

    const now = new Date();

    return expenseList.filter((expense) => {
      const expenseDate = new Date(expense.date);

      if (reportPeriod === "month") {
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() ===
            now.getFullYear()
        );
      }

      if (reportPeriod === "year") {
        return (
          expenseDate.getFullYear() ===
          now.getFullYear()
        );
      }

      return true;
    });
  }, [expenseList, reportPeriod]);

  /*
   * Main financial calculations
   */
  const totalRevenue = filteredInvoices
    .filter((invoice) => invoice.status === "paid")
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const totalExpenses = filteredExpenses
    .filter((expense) => expense.status === "paid")
    .reduce(
      (total, expense) =>
        total + Math.abs(Number(expense.amount || 0)),
      0
    );

  const netProfit = totalRevenue - totalExpenses;

  const totalInvoices = filteredInvoices.length;

  const paidInvoices = filteredInvoices.filter(
    (invoice) => invoice.status === "paid"
  ).length;

  const pendingInvoices = filteredInvoices.filter(
    (invoice) => invoice.status === "pending"
  ).length;

  const overdueInvoices = filteredInvoices.filter(
    (invoice) => invoice.status === "overdue"
  ).length;

  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.status === "pending")
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const overdueAmount = filteredInvoices
    .filter((invoice) => invoice.status === "overdue")
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const totalOutstanding =
    pendingAmount + overdueAmount;

  const totalCustomerBalance = customerList.reduce(
    (total, customer) =>
      total + Number(customer.balance || 0),
    0
  );

  const totalSupplierBalance = supplierList.reduce(
    (total, supplier) =>
      total + Number(supplier.balance || 0),
    0
  );

  /*
   * Monthly chart
   */
  const chartData = useMemo(() => {
    const months = {};

    filteredInvoices.forEach((invoice) => {
      if (invoice.status !== "paid") return;

      const date = new Date(invoice.date);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = {
          key,
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          revenue: 0,
          expenses: 0,
        };
      }

      months[key].revenue += Number(
        invoice.amount || 0
      );
    });

    filteredExpenses.forEach((expense) => {
      if (expense.status !== "paid") return;

      const date = new Date(expense.date);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = {
          key,
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          revenue: 0,
          expenses: 0,
        };
      }

      months[key].expenses += Math.abs(
        Number(expense.amount || 0)
      );
    });

    return Object.values(months).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
  }, [filteredInvoices, filteredExpenses]);

  /*
   * Invoice status chart
   */
  const invoiceStatusData = [
    {
      name: "Paid",
      value: paidInvoices,
    },
    {
      name: "Pending",
      value: pendingInvoices,
    },
    {
      name: "Overdue",
      value: overdueInvoices,
    },
  ].filter((item) => item.value > 0);

  const invoiceStatusColors = [
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .print-hidden {
              display: none !important;
            }

            .reports-page {
              padding: 0 !important;
            }

            .report-card {
              break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="print-hidden">
        <PageHeader
          title={t.reports}
          description="Review financial reports and business performance."
          action={
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Printer size={18} />
              Print Report
            </button>
          }
        />
      </div>

      {/* Report Controls */}
      <section className="print-hidden mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Report Period
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose the period for your financial report.
              </p>
            </div>
          </div>

          <select
            value={reportPeriod}
            onChange={(event) =>
              setReportPeriod(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </section>

      {/* Report Header for Print */}
      <div className="mt-6 hidden print:block">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">
            Financial Report
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Period:{" "}
            {reportPeriod === "all"
              ? "All Time"
              : reportPeriod === "month"
              ? "This Month"
              : "This Year"}
          </p>
        </div>
      </div>

      {/* Main Statistics */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Revenue
              </p>

              <h2
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400"
              >
                {formatMoney(totalRevenue)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp size={22} />
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Expenses
              </p>

              <h2
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400"
              >
                {formatMoney(totalExpenses)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <TrendingDown size={22} />
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Net Profit
              </p>

              <h2
                dir="ltr"
                className={`mt-2 text-2xl font-extrabold ${
                  netProfit >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatMoney(netProfit)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Wallet size={22} />
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Outstanding
              </p>

              <h2
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400"
              >
                {formatMoney(totalOutstanding)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <CircleDollarSign size={22} />
            </div>
          </div>
        </article>
      </section>

      {/* Invoice Overview */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ReceiptText size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Invoices
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(totalInvoices)}
              </p>
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paid Invoices
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(paidInvoices)}
              </p>
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Clock3 size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pending Invoices
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(pendingInvoices)}
              </p>

              <p
                dir="ltr"
                className="mt-1 text-xs text-amber-600 dark:text-amber-400"
              >
                {formatMoney(pendingAmount)}
              </p>
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overdue Invoices
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(overdueInvoices)}
              </p>

              <p
                dir="ltr"
                className="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                {formatMoney(overdueAmount)}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Charts */}
      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Revenue & Expenses
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Monthly financial performance
            </p>
          </div>

          <div className="h-[320px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="reportRevenueFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#059669"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="95%"
                        stopColor="#059669"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="reportExpenseFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${value / 1000}k`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatMoney(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#reportRevenueFill)"
                    connectNulls
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#reportExpenseFill)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No financial data available.
              </div>
            )}
          </div>
        </div>

        <div className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Invoice Status
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Distribution of invoice statuses
            </p>
          </div>

          <div className="h-[320px]">
            {invoiceStatusData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {invoiceStatusData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            invoiceStatusColors[index]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No invoice data available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Accounts Summary */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customer Balances
              </p>

              <p
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400"
              >
                {formatMoney(totalCustomerBalance)}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Across {customerList.length} customers
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={22} />
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supplier Outstanding
              </p>

              <p
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400"
              >
                {formatMoney(totalSupplierBalance)}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Across {supplierList.length} suppliers
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <Truck size={22} />
            </div>
          </div>
        </article>

        <article className="report-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Financial Position
              </p>

              <p
                dir="ltr"
                className={`mt-2 text-2xl font-extrabold ${
                  netProfit >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatMoney(netProfit)}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Revenue minus paid expenses
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FileText size={22} />
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

