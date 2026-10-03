
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
  Truck,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialSuppliers = [
  {
    id: 1,
    name: "شركة النور للتوريدات",
    phone: "01011112222",
    email: "info@alnour.com",
    balance: 12500,
  },
  {
    id: 2,
    name: "مؤسسة الأمل التجارية",
    phone: "01122223333",
    email: "info@alamal.com",
    balance: 8200,
  },
  {
    id: 3,
    name: "شركة المستقبل للتجارة",
    phone: "01233334444",
    email: "info@future.com",
    balance: 15600,
  },
  {
    id: 4,
    name: "مورد الخليج",
    phone: "01044445555",
    email: "sales@gulf.com",
    balance: 6300,
  },
  {
    id: 5,
    name: "شركة الإمداد",
    phone: "01155556666",
    email: "info@emdad.com",
    balance: 9400,
  },
];

const emptySupplier = {
  name: "",
  phone: "",
  email: "",
  balance: "",
};

export default function Suppliers({ t }) {
  const [supplierList, setSupplierList] = useState(() => {
    const savedSuppliers = localStorage.getItem("suppliers");

    return savedSuppliers
      ? JSON.parse(savedSuppliers)
      : initialSuppliers;
  });

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] =
    useState(null);

  const [newSupplier, setNewSupplier] =
    useState(emptySupplier);

  useEffect(() => {
    localStorage.setItem(
      "suppliers",
      JSON.stringify(supplierList)
    );

    window.dispatchEvent(new Event("suppliersUpdated"));
  }, [supplierList]);

  const handleAddSupplier = () => {
    setEditingSupplierId(null);
    setNewSupplier({ ...emptySupplier });
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplierId(supplier.id);

    setNewSupplier({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      balance: String(supplier.balance ?? ""),
    });

    setIsModalOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!newSupplier.name.trim()) {
      toast.error("من فضلك أدخل اسم المورد");
      return;
    }

    if (!newSupplier.phone.trim()) {
      toast.error("من فضلك أدخل رقم الهاتف");
      return;
    }

    if (!newSupplier.email.trim()) {
      toast.error("من فضلك أدخل البريد الإلكتروني");
      return;
    }

    if (
      newSupplier.balance !== "" &&
      Number(newSupplier.balance) < 0
    ) {
      toast.error("الرصيد لا يمكن أن يكون سالبًا");
      return;
    }

    if (editingSupplierId !== null) {
      setSupplierList((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier.id === editingSupplierId
            ? {
                ...supplier,
                name: newSupplier.name.trim(),
                phone: newSupplier.phone.trim(),
                email: newSupplier.email.trim(),
                balance: Number(
                  newSupplier.balance || 0
                ),
              }
            : supplier
        )
      );

      toast.success("تم تعديل بيانات المورد بنجاح");
    } else {
      const newSupplierData = {
        id:
          Math.max(
            0,
            ...supplierList.map(
              (supplier) => Number(supplier.id) || 0
            )
          ) + 1,

        name: newSupplier.name.trim(),

        phone: newSupplier.phone.trim(),

        email: newSupplier.email.trim(),

        balance: Number(newSupplier.balance || 0),
      };

      setSupplierList((prevSuppliers) => [
        ...prevSuppliers,
        newSupplierData,
      ]);

      toast.success("تمت إضافة المورد بنجاح");
    }

    closeModal();
  };

  const handleDeleteSupplier = (id) => {
    const supplier = supplierList.find(
      (supplier) => supplier.id === id
    );

    if (!supplier) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المورد "${supplier.name}"؟`
    );

    if (!confirmed) return;

    setSupplierList((prevSuppliers) =>
      prevSuppliers.filter(
        (supplier) => supplier.id !== id
      )
    );

    toast.success("تم حذف المورد بنجاح");
  };

  const filteredSuppliers = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    if (!searchValue) {
      return supplierList;
    }

    return supplierList.filter((supplier) => {
      return (
        supplier.name
          ?.toLowerCase()
          .includes(searchValue) ||
        supplier.phone
          ?.toLowerCase()
          .includes(searchValue) ||
        supplier.email
          ?.toLowerCase()
          .includes(searchValue) ||
        String(supplier.id).includes(searchValue)
      );
    });
  }, [supplierList, search]);

  const totalSuppliers = supplierList.length;

  const suppliersWithBalance = supplierList.filter(
    (supplier) => Number(supplier.balance || 0) > 0
  ).length;

  const totalBalance = supplierList.reduce(
    (total, supplier) =>
      total + Number(supplier.balance || 0),
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
    setEditingSupplierId(null);
    setNewSupplier({ ...emptySupplier });
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
        title={t.suppliers}
        description="Manage suppliers and outstanding payments."
        action={
          <button
            type="button"
            onClick={handleAddSupplier}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <UserPlus size={18} />
            Add Supplier
          </button>
        }
      />

      {/* Summary */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Suppliers
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalSuppliers}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Truck size={22} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Suppliers With Balance
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {suppliersWithBalance}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Users size={22} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Outstanding
              </p>

              <h2
                dir="ltr"
                className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white"
              >
                {formatMoney(totalBalance)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <CircleDollarSign size={22} />
            </div>
          </div>
        </article>
      </section>

      {/* Suppliers Table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Truck size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Suppliers
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Manage all supplier accounts
                </p>
              </div>
            </div>

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
                placeholder="Search suppliers..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 sm:w-72 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  Supplier
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Phone
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Email
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Outstanding
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {supplier.name?.charAt(0) || "؟"}
                        </div>

                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {supplier.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Supplier #{supplier.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td
                      dir="ltr"
                      className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    >
                      {supplier.phone}
                    </td>

                    <td
                      dir="ltr"
                      className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    >
                      {supplier.email}
                    </td>

                    <td
                      dir="ltr"
                      className="whitespace-nowrap px-5 py-4 font-bold text-red-600 dark:text-red-400"
                    >
                      {formatMoney(
                        Number(supplier.balance || 0)
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditSupplier(supplier)
                          }
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSupplier(
                              supplier.id
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
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {filteredSuppliers.length} of{" "}
              {supplierList.length} suppliers
            </span>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Wallet size={16} />
              <span>Supplier Accounts</span>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingSupplierId !== null
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingSupplierId !== null
                  ? "Update supplier information."
                  : "Add a new supplier."}
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

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Name
              </label>

              <input
                type="text"
                value={newSupplier.name}
                onChange={(event) =>
                  setNewSupplier({
                    ...newSupplier,
                    name: event.target.value,
                  })
                }
                placeholder="Supplier name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Phone
              </label>

              <input
                type="tel"
                value={newSupplier.phone}
                onChange={(event) =>
                  setNewSupplier({
                    ...newSupplier,
                    phone: event.target.value,
                  })
                }
                placeholder="01xxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={newSupplier.email}
                onChange={(event) =>
                  setNewSupplier({
                    ...newSupplier,
                    email: event.target.value,
                  })
                }
                placeholder="supplier@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Outstanding Balance
              </label>

              <input
                type="number"
                min="0"
                value={newSupplier.balance}
                onChange={(event) =>
                  setNewSupplier({
                    ...newSupplier,
                    balance: event.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

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
              onClick={handleSaveSupplier}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              {editingSupplierId !== null
                ? "Save Changes"
                : "Add Supplier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

