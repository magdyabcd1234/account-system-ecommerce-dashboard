
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Wallet,
  CircleDollarSign,
  UserCheck,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

import { customers as initialCustomers } from "../data/mockData";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  balance: "",
};

export default function Customers({ t }) {
  const [customerList, setCustomerList] = useState(() => {
    const savedCustomers = localStorage.getItem("customers");

    return savedCustomers
      ? JSON.parse(savedCustomers)
      : initialCustomers;
  });

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] =
    useState(null);

  const [newCustomer, setNewCustomer] =
    useState(emptyCustomer);

  // Save customers to localStorage
  useEffect(() => {
    localStorage.setItem(
      "customers",
      JSON.stringify(customerList)
    );

    window.dispatchEvent(new Event("customersUpdated"));
  }, [customerList]);

  // Add customer
  const handleAddCustomer = () => {
    setEditingCustomerId(null);
    setNewCustomer({ ...emptyCustomer });
    setIsModalOpen(true);
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);

    setNewCustomer({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      balance: String(customer.balance ?? ""),
    });

    setIsModalOpen(true);
  };

  // Save customer
  const handleSaveCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error("من فضلك أدخل اسم العميل");
      return;
    }

    if (!newCustomer.phone.trim()) {
      toast.error("من فضلك أدخل رقم الهاتف");
      return;
    }

    if (!newCustomer.email.trim()) {
      toast.error("من فضلك أدخل البريد الإلكتروني");
      return;
    }

    if (
      newCustomer.balance !== "" &&
      Number(newCustomer.balance) < 0
    ) {
      toast.error("الرصيد لا يمكن أن يكون سالبًا");
      return;
    }

    if (editingCustomerId !== null) {
      // Update existing customer
      setCustomerList((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === editingCustomerId
            ? {
                ...customer,
                name: newCustomer.name.trim(),
                phone: newCustomer.phone.trim(),
                email: newCustomer.email.trim(),
                balance: Number(
                  newCustomer.balance || 0
                ),
              }
            : customer
        )
      );

      toast.success("تم تعديل بيانات العميل بنجاح");
    } else {
      // Add new customer
      const newCustomerData = {
        id:
          Math.max(
            0,
            ...customerList.map(
              (customer) => Number(customer.id) || 0
            )
          ) + 1,

        name: newCustomer.name.trim(),

        phone: newCustomer.phone.trim(),

        email: newCustomer.email.trim(),

        balance: Number(newCustomer.balance || 0),
      };

      setCustomerList((prevCustomers) => [
        ...prevCustomers,
        newCustomerData,
      ]);

      toast.success("تمت إضافة العميل بنجاح");
    }

    closeModal();
  };

  // Delete customer
  const handleDeleteCustomer = (id) => {
    const customer = customerList.find(
      (customer) => customer.id === id
    );

    if (!customer) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل "${customer.name}"؟`
    );

    if (!confirmed) return;

    setCustomerList((prevCustomers) =>
      prevCustomers.filter(
        (customer) => customer.id !== id
      )
    );

    toast.success("تم حذف العميل بنجاح");
  };

  // Search
  const filteredCustomers = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    if (!searchValue) {
      return customerList;
    }

    return customerList.filter((customer) => {
      return (
        customer.name
          ?.toLowerCase()
          .includes(searchValue) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchValue) ||
        customer.email
          ?.toLowerCase()
          .includes(searchValue) ||
        String(customer.id).includes(searchValue)
      );
    });
  }, [customerList, search]);

  // Statistics
  const totalCustomers = customerList.length;

  const customersWithBalance = customerList.filter(
    (customer) => Number(customer.balance || 0) > 0
  ).length;

  const totalBalance = customerList.reduce(
    (total, customer) =>
      total + Number(customer.balance || 0),
    0
  );

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomerId(null);
    setNewCustomer({ ...emptyCustomer });
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
        title={t.customers}
        description="Manage customer information and account balances."
        action={
          <button
            type="button"
            onClick={handleAddCustomer}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <UserPlus size={18} />
            Add Customer
          </button>
        }
      />

      {/* Summary */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Customers */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Customers
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalCustomers}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={22} />
            </div>
          </div>
        </article>

        {/* Customers With Balance */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Customers With Balance
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {customersWithBalance}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <UserCheck size={22} />
            </div>
          </div>
        </article>

        {/* Total Balance */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Balance
              </p>

              <h2
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white"
              >
                {formatMoney(totalBalance)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CircleDollarSign size={22} />
            </div>
          </div>
        </article>
      </section>

      {/* Customers */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Users size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Customers
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Manage all customer accounts
                </p>
              </div>
            </div>

            {/* Search */}
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
                placeholder="Search customers..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 sm:w-72 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  Customer
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Phone
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Email
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Balance
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {customer.name
                            ?.charAt(0) || "؟"}
                        </div>

                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Customer #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td
                      dir="ltr"
                      className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    >
                      {customer.phone}
                    </td>

                    {/* Email */}
                    <td
                      dir="ltr"
                      className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    >
                      {customer.email}
                    </td>

                    {/* Balance */}
                    <td
                      dir="ltr"
                      className="whitespace-nowrap px-5 py-4 font-bold text-slate-800 dark:text-slate-100"
                    >
                      {formatMoney(
                        Number(customer.balance || 0)
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditCustomer(customer)
                          }
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCustomer(
                              customer.id
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
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No customers found.
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
              Showing {filteredCustomers.length} of{" "}
              {customerList.length} customers
            </span>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Wallet size={16} />
              <span>Customer Accounts</span>
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
                {editingCustomerId !== null
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingCustomerId !== null
                  ? "Update customer information."
                  : "Add a new customer."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Name
              </label>

              <input
                type="text"
                value={newCustomer.name}
                onChange={(event) =>
                  setNewCustomer({
                    ...newCustomer,
                    name: event.target.value,
                  })
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Phone
              </label>

              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(event) =>
                  setNewCustomer({
                    ...newCustomer,
                    phone: event.target.value,
                  })
                }
                placeholder="01xxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={newCustomer.email}
                onChange={(event) =>
                  setNewCustomer({
                    ...newCustomer,
                    email: event.target.value,
                  })
                }
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Balance */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Balance
              </label>

              <input
                type="number"
                min="0"
                value={newCustomer.balance}
                onChange={(event) =>
                  setNewCustomer({
                    ...newCustomer,
                    balance: event.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveCustomer}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              {editingCustomerId !== null
                ? "Save Changes"
                : "Add Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

