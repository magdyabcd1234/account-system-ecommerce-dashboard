import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Wallet,
  TrendingUp,
  ReceiptText,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialTransactions = [
  {
    id: 1,
    reference: "TRX-1001",
    description: "Client Payment",
    type: "income",
    category: "Sales",
    date: "2026-10-01",
    amount: 18500,
    status: "paid",
  },
  {
    id: 2,
    reference: "TRX-1002",
    description: "Office Supplies",
    type: "expense",
    category: "Operations",
    date: "2026-10-01",
    amount: 2450,
    status: "paid",
  },
  {
    id: 3,
    reference: "TRX-1003",
    description: "Consulting Services",
    type: "income",
    category: "Services",
    date: "2026-09-28",
    amount: 12500,
    status: "paid",
  },
];

const emptyTransaction = {
  description: "",
  category: "",
  type: "income",
  date: "",
  amount: "",
  status: "pending",
};

export default function Transactions({ t }) {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions =
      localStorage.getItem("transactions");

    return savedTransactions
      ? JSON.parse(savedTransactions)
      : initialTransactions;
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] =
    useState(null);

  const [newTransaction, setNewTransaction] =
    useState(emptyTransaction);

  // حفظ المعاملات
  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );

    window.dispatchEvent(
      new Event("transactionsUpdated")
    );
  }, [transactions]);

  // فتح نافذة إضافة
  const handleAddTransaction = () => {
    setEditingTransactionId(null);
    setNewTransaction(emptyTransaction);
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل
  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);

    setNewTransaction({
      description: transaction.description || "",
      category: transaction.category || "",
      type: transaction.type || "income",
      date: transaction.date || "",
      amount: String(transaction.amount ?? ""),
      status: transaction.status || "pending",
    });

    setIsModalOpen(true);
  };

  // حفظ / تعديل
  const handleSaveTransaction = () => {
    if (
      !newTransaction.description.trim() ||
      !newTransaction.date ||
      newTransaction.amount === "" ||
      Number(newTransaction.amount) <= 0
    ) {
      toast.error(
        "من فضلك أدخل بيانات المعاملة بشكل صحيح"
      );
      return;
    }

    if (editingTransactionId !== null) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === editingTransactionId
            ? {
                ...transaction,
                description:
                  newTransaction.description.trim(),
                category:
                  newTransaction.category.trim(),
                type: newTransaction.type,
                date: newTransaction.date,
                amount: Number(newTransaction.amount),
                status: newTransaction.status,
              }
            : transaction
        )
      );

      toast.success("تم تعديل المعاملة بنجاح");
    } else {
      const newTransactionData = {
        id: Date.now(),
        reference: `TRX-${1000 + transactions.length + 1}`,
        description:
          newTransaction.description.trim(),
        category:
          newTransaction.category.trim() || "General",
        type: newTransaction.type,
        date: newTransaction.date,
        amount: Number(newTransaction.amount),
        status: newTransaction.status,
      };

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransactionData,
      ]);

      toast.success("تمت إضافة المعاملة بنجاح");
    }

    setNewTransaction(emptyTransaction);
    setEditingTransactionId(null);
    setIsModalOpen(false);
  };

  // حذف
  const handleDeleteTransaction = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter(
        (transaction) => transaction.id !== id
      )
    );

    toast.success("تم حذف المعاملة بنجاح");
  };

  // البحث + الفلترة
  const filteredTransactions = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return transactions
      .filter((transaction) => {
        const matchesSearch =
          transaction.description
            ?.toLowerCase()
            .includes(searchValue) ||
          transaction.reference
            ?.toLowerCase()
            .includes(searchValue) ||
          transaction.category
            ?.toLowerCase()
            .includes(searchValue);

        const matchesFilter =
          filter === "all" ||
          transaction.type === filter;

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );
  }, [transactions, search, filter]);

  // إجمالي الإيرادات
  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income" &&
        transaction.status === "paid"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  // إجمالي المصروفات
  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.status === "paid"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  // صافي الحركة
  const netMovement = totalIncome - totalExpenses;

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));
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
        title={t.transactions}
        description="Track income, expenses and financial movements."
        action={
          <button
            type="button"
            onClick={handleAddTransaction}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        }
      />

      {/* Summary */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Income */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Income
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatMoney(totalIncome)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ArrowDownLeft size={22} />
            </div>
          </div>
        </article>

        {/* Expenses */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Expenses
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatMoney(totalExpenses)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <ArrowUpRight size={22} />
            </div>
          </div>
        </article>

        {/* Net */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Net Movement
              </p>

              <h2
                className={`mt-2 text-2xl font-extrabold ${
                  netMovement >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatMoney(netMovement)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <TrendingUp size={22} />
            </div>
          </div>
        </article>
      </section>

      {/* Transactions */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ReceiptText size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Financial Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  All income and expense movements
                </p>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 sm:w-64 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="all">
                  All Transactions
                </option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  Transaction
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Reference
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Category
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Type
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Date
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Amount
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
                  >
                    {/* Transaction */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            transaction.type === "income"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                          }`}
                        >
                          {transaction.type ===
                          "income" ? (
                            <ArrowDownLeft size={18} />
                          ) : (
                            <ArrowUpRight size={18} />
                          )}
                        </div>

                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {transaction.description}
                        </span>
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                      {transaction.reference}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {transaction.category || "-"}
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          transaction.type === "income"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                        }`}
                      >
                        {transaction.type ===
                        "income"
                          ? "Income"
                          : "Expense"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(transaction.date)}
                    </td>

                    {/* Amount */}
                    <td
                      dir="ltr"
                      className={`whitespace-nowrap px-5 py-4 font-bold ${
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      {formatMoney(transaction.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          transaction.status ===
                          "paid"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : transaction.status ===
                                "overdue"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditTransaction(
                              transaction
                            )
                          }
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTransaction(
                              transaction.id
                            )
                          }
                          className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {filteredTransactions.length} of{" "}
              {transactions.length} transactions
            </span>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Wallet size={16} />
              <span>Financial Overview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isModalOpen
            ? "bg-black/50 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
      >
        <div
          className={`w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 dark:bg-slate-950 ${
            isModalOpen
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTransactionId !== null
                  ? "Edit Transaction"
                  : "Add Transaction"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingTransactionId !== null
                  ? "Update transaction information."
                  : "Add a new financial transaction."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransactionId(null);
                setNewTransaction(
                  emptyTransaction
                );
              }}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Description
            </label>

            <input
              type="text"
              value={newTransaction.description}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  description:
                    event.target.value,
                })
              }
              placeholder="Transaction description"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Category
            </label>

            <input
              type="text"
              value={newTransaction.category}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  category:
                    event.target.value,
                })
              }
              placeholder="Sales, Operations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Type */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Type
            </label>

            <select
              value={newTransaction.type}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  type: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="income">
                Income
              </option>

              <option value="expense">
                Expense
              </option>
            </select>
          </div>

          {/* Date */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Date
            </label>

            <input
              type="date"
              value={newTransaction.date}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  date: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Amount */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Amount
            </label>

            <input
              type="number"
              min="1"
              value={newTransaction.amount}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  amount: event.target.value,
                })
              }
              placeholder="Enter amount"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Status */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Status
            </label>

            <select
              value={newTransaction.status}
              onChange={(event) =>
                setNewTransaction({
                  ...newTransaction,
                  status: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="overdue">
                Overdue
              </option>
            </select>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransactionId(null);
                setNewTransaction(
                  emptyTransaction
                );
              }}
              className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveTransaction}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              {editingTransactionId !== null
                ? "Save Changes"
                : "Add Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}