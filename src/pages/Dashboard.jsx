import { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Clock3,
  ReceiptText,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import PageHeader from "../components/common/PageHeader";

import {
  invoices as initialInvoices,
  expenses as initialExpenses,
} from "../data/mockData";





const demoTransactions = [
  {
    id: "TRX-1001",
    name: "Office Supplies",
    category: "Operations",
    date: "2026-10-01",
    amount: -2450,
    status: "paid",
  },
  {
    id: "TRX-1002",
    name: "Client Payment",
    category: "Sales",
    date: "2026-09-30",
    amount: 18500,
    status: "paid",
  },
  {
    id: "TRX-1003",
    name: "Software Subscription",
    category: "Technology",
    date: "2026-09-29",
    amount: -1200,
    status: "pending",
  },
  {
    id: "TRX-1004",
    name: "Consulting Services",
    category: "Services",
    date: "2026-09-28",
    amount: 12500,
    status: "paid",
  },
];

export default function Dashboard({ t, language }) {
const [invoiceList, setInvoiceList] = useState(() => {
  const savedInvoices = localStorage.getItem("invoices");

  return savedInvoices
    ? JSON.parse(savedInvoices)
    : initialInvoices;
});

const [expenseList, setExpenseList] = useState(() => {
  const savedExpenses = localStorage.getItem("expenses");

  return savedExpenses
    ? JSON.parse(savedExpenses)
    : initialExpenses;
});

useEffect(() => {
  const handleInvoicesUpdated = () => {
    const savedInvoices = localStorage.getItem("invoices");

    setInvoiceList(
      savedInvoices
        ? JSON.parse(savedInvoices)
        : initialInvoices
    );
  };

  window.addEventListener("invoicesUpdated", handleInvoicesUpdated);

  return () => {
    window.removeEventListener(
      "invoicesUpdated",
      handleInvoicesUpdated
    );
  };
}, []);


useEffect(() => {
  const handleStorageChange = () => {
    const savedInvoices = localStorage.getItem("invoices");
    const savedExpenses = localStorage.getItem("expenses");

    setInvoiceList(
      savedInvoices ? JSON.parse(savedInvoices) : initialInvoices
    );

    setExpenseList(
      savedExpenses ? JSON.parse(savedExpenses) : initialExpenses
    );
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);

const totalRevenue = invoiceList
  .filter((invoice) => invoice.status === "paid")
  .reduce((total, invoice) => total + invoice.amount, 0);

const totalPending = invoiceList
  .filter((invoice) => invoice.status === "pending")
  .reduce((total, invoice) => total + invoice.amount, 0);

const totalOverdue = invoiceList
  .filter((invoice) => invoice.status === "overdue")
  .reduce((total, invoice) => total + invoice.amount, 0);

  const totalOutstanding = totalPending + totalOverdue;

const totalInvoices = invoiceList.length;

const totalExpenses = expenseList
  .filter((expense) => expense.status === "paid")
  .reduce((total, expense) => total + expense.amount, 0);


const chartData = [...invoiceList, ...expenseList]
  .reduce((months, item) => {
    if (!item.date) return months;

    const date = new Date(`${item.date}T12:00:00`);

    if (Number.isNaN(date.getTime())) return months;

    // مفتاح فريد للشهر والسنة، مثل 2026-10
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    let currentMonth = months.find(
      (month) => month.monthKey === monthKey
    );

    if (!currentMonth) {
      currentMonth = {
        monthKey,
        month: date.toLocaleDateString(
          language === "ar" ? "ar-EG" : "en-US",
          { month: "short", year: "numeric" }
        ),
        revenue: 0,
        expenses: 0,
      };

      months.push(currentMonth);
    }

    const amount = Number(item.amount) || 0;

    // الإيرادات: الفواتير المدفوعة فقط
    if ("invoiceNumber" in item && item.status === "paid") {
      currentMonth.revenue += amount;
    }

    // المصروفات: المصروفات المدفوعة فقط
    if ("category" in item && item.status === "paid") {
      currentMonth.expenses += Math.abs(amount);
    }

    return months;
  }, [])
  .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const formatMoney = (value) =>
    new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date) =>
    new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));

  return (
    <div>
      <PageHeader
        title={t.welcome}
        description={t.dashboardDescription}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
{[
  {
    key: "totalRevenue",
    value: totalRevenue,
    change: `${invoiceList.filter((invoice) => invoice.status === "paid").length} paid`,
    positive: true,
    icon: ArrowDownLeft,
  },
{
  key: "totalExpenses",
  value: totalExpenses,
    change: `${invoiceList.filter((invoice) => invoice.status === "pending").length} pending`,
    positive: false,
    icon: ArrowUpRight,
  },
  {
    key: "netProfit",
    value: totalRevenue - totalExpenses,
    change: `${invoiceList.filter((invoice) => invoice.status === "overdue").length} overdue`,
    positive: true,
    icon: TrendingUp,
  },
  {
    key: "outstanding",
    value: totalOverdue,
    change: `${totalInvoices} invoices`,
    positive: null,
    icon: Clock3,
  },
].map((stat) => {
  const Icon = stat.icon;

  return (
    <article
      key={stat.key}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon size={22} />
        </div>

        <span
          className={`rounded-lg px-2 py-1 text-xs font-bold ${
            stat.positive === true
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : stat.positive === false
                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          {stat.change}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
        {t[stat.key]}
      </p>

      <h2 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {formatMoney(stat.value)}
      </h2>
    </article>
  );
})}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Wallet size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {t.recentTransactions}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Revenue and expenses overview
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94a3b8"
                  strokeOpacity={0.2}
                />

                <XAxis
  dataKey="month"
  tickLine={false}
  axisLine={false}
  tick={{ fontSize: 12, fill: "#94a3b8" }}
  minTickGap={20}
/>

<YAxis
  tickLine={false}
  axisLine={false}
  tick={{ fontSize: 12, fill: "#94a3b8" }}
  tickFormatter={(value) =>
    new Intl.NumberFormat(
      language === "ar" ? "ar-EG" : "en-US",
      {
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(value)
  }
  width={55}
  domain={[0, "auto"]}
/>

                <Tooltip
                  formatter={(value, name) => [
                    formatMoney(Number(value)),
                    name === "revenue" ? t.totalRevenue : t.totalExpenses,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />



                <Area
  type="monotone"
  dataKey="revenue"
  stroke="#059669"
  strokeWidth={2.5}
  fill="url(#revenueFill)"
  connectNulls
/>

<Area
  type="monotone"
  dataKey="expenses"
  name="expenses"
  stroke="#f59e0b"
  strokeWidth={2.5}
  fill="url(#expensesFill)"
  connectNulls
/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <ReceiptText size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {t.recentTransactions}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Latest activity
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {demoTransactions.slice(0, 4).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {transaction.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {transaction.id} · {formatDate(transaction.date)}
                  </p>
                </div>

                <span
                  dir="ltr"
                  className={`shrink-0 text-sm font-bold ${
                    transaction.amount >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {transaction.amount >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">
            {t.recentTransactions}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {demoTransactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  {t.description}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t.category}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t.date}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t.amount}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t.status}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {demoTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
                >
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                    {transaction.name}
                    <p className="mt-1 text-xs font-normal text-slate-400">
                      {transaction.id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {transaction.category}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                    {formatDate(transaction.date)}
                  </td>

                  <td
                    dir="ltr"
                    className={`whitespace-nowrap px-5 py-4 text-start font-bold ${
                      transaction.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatMoney(transaction.amount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        transaction.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}
                    >
                      {transaction.status === "paid" ? t.paid : t.pending}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}