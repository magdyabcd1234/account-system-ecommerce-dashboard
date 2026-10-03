import { useState, useEffect } from "react";
import { Search } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { invoices, customers } from "../data/mockData";
import { syncInvoiceAccounting } from "../utils/accounting";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Invoices({ t }) {
  const [search, setSearch] = useState("");
  const [invoiceList, setInvoiceList] = useState(() => {
  const savedInvoices = localStorage.getItem("invoices");

  return savedInvoices ? JSON.parse(savedInvoices) : invoices;
});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
const [newInvoice, setNewInvoice] = useState({
  customerId: "",
  customerName: "",
  date: "",
  amount: "",
  status: "pending",
});


useEffect(() => {
  localStorage.setItem("invoices", JSON.stringify(invoiceList));

  // تحديث المحاسبة بناءً على الفواتير
  syncInvoiceAccounting(invoiceList);

  // إبلاغ باقي أجزاء التطبيق
  window.dispatchEvent(new Event("invoicesUpdated"));
}, [invoiceList]);




const handleEditInvoice = (invoice) => {
  setEditingInvoiceId(invoice.id);

  const customer = customers.find(
    (customer) => customer.id === invoice.customerId
  );

  setNewInvoice({
    customerId: invoice.customerId || "",
    customerName: invoice.customerName || customer?.name || "",
    date: invoice.date || "",
    amount: String(invoice.amount ?? ""),
    status: invoice.status || "pending",
  });

  setIsModalOpen(true);
};




const handleSaveInvoice = () => {
  if (
    !newInvoice.customerId ||
    !newInvoice.date ||
    newInvoice.amount === "" ||
    Number(newInvoice.amount) < 0
  ) {
    toast.error("من فضلك أدخل بيانات الفاتورة بشكل صحيح");
    return;
  }

  const selectedCustomer = customers.find(
    (customer) => Number(customer.id) === Number(newInvoice.customerId)
  );

  if (!selectedCustomer) {
    toast.error("العميل غير موجود");
    return;
  }

  if (editingInvoiceId !== null) {
    // =========================
    // تعديل فاتورة
    // =========================

    setInvoiceList((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === editingInvoiceId
          ? {
              ...invoice,
              customerId: Number(newInvoice.customerId),
              customerName: selectedCustomer.name,
              date: newInvoice.date,
              amount: Number(newInvoice.amount),
              status: newInvoice.status,
            }
          : invoice
      )
    );

    toast.success("تم تعديل الفاتورة بنجاح");
  } else {
    // =========================
    // إضافة فاتورة
    // =========================

    const newInvoiceData = {
      id: Date.now(),
      invoiceNumber: `INV-${1001 + invoiceList.length}`,

      customerId: Number(newInvoice.customerId),
      customerName: selectedCustomer.name,

      date: newInvoice.date,
      amount: Number(newInvoice.amount),
      status: newInvoice.status,
    };

    setInvoiceList((prevInvoices) => [
      ...prevInvoices,
      newInvoiceData,
    ]);

    toast.success("تمت إضافة الفاتورة بنجاح");
  }

  setNewInvoice({
    customerId: "",
    customerName: "",
    date: "",
    amount: "",
    status: "pending",
  });

  setEditingInvoiceId(null);
  setIsModalOpen(false);
};


const handleDeleteInvoice = (id) => {
  setInvoiceList((prevInvoices) =>
    prevInvoices.filter((invoice) => invoice.id !== id)
  );
  toast.success("تم حذف الفاتورة بنجاح");
};

  const filteredInvoices = invoiceList.filter((invoice) => {
  const customer = customers.find(
    (customer) => customer.id === invoice.customerId
  );



  const searchValue = search.toLowerCase();

  return (
    invoice.invoiceNumber.toLowerCase().includes(searchValue) ||
    customer?.name.toLowerCase().includes(searchValue)
  );
});



  return (
    <div>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  closeOnClick
  pauseOnHover
/>
      <PageHeader
  title={t.invoices}
  description="Manage invoices, payments and outstanding balances."
  action={
    <button
      type="button"
      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
      onClick={() => setIsModalOpen(true)}
    >
      إضافة فاتورة
    </button>
  }
/>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoices..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="w-[18%] px-4 py-3 text-start font-bold">Invoice</th>
                <th className="w-[18%] px-4 py-3 text-start font-bold">Customer</th>
                <th className="w-[18%] px-4 py-3 text-start font-bold">Date</th>
                <th className="w-[18%] px-4 py-3 text-start font-bold">Amount</th>
                <th className="w-[18%] px-4 py-3 text-start font-bold">Status</th>
                <th className="w-[18%] px-4 py-3 text-start font-bold">
  Actions
</th>
              </tr>
            </thead>

            <tbody>
{filteredInvoices.map((invoice) => {
    const customer = customers.find(
      (customer) => customer.id === invoice.customerId
    );

                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-4 text-start font-semibold text-slate-800 dark:text-white">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="px-4 py-4 text-start font-semibold text-slate-800 dark:text-white">
                      {invoice.customerName || customer?.name}
                    </td>

                    <td className="px-4 py-4 text-start font-semibold text-slate-800 dark:text-white">
                      {invoice.date}
                    </td>

                    <td className="px-4 py-4 text-start font-semibold text-slate-800 dark:text-white">
                      {invoice.amount} EGP
                    </td>

                    <td className="px-4 py-4 text-start font-semibold text-slate-800 dark:text-white">
                      {invoice.status}
                    </td>

<td className="px-4 py-4 text-start">
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => handleEditInvoice(invoice)}
      className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-200"
    >
      تعديل
    </button>

    <button
      type="button"
      onClick={() => handleDeleteInvoice(invoice.id)}
      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-200"
    >
      حذف
    </button>
  </div>
</td>           </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
<h2 className="text-xl font-bold text-slate-900 dark:text-white">
  {editingInvoiceId !== null ? "تعديل الفاتورة" : "إضافة فاتورة"}
</h2>

<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
  {editingInvoiceId !== null
    ? "عدّل بيانات الفاتورة واحفظ التغييرات."
    : "أضف بيانات الفاتورة الجديدة."}
</p>

      {/* Customer */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
          العميل
        </label>

              

<div className="relative">
  <input
    type="text"
    value={newInvoice.customerName}
    onChange={(event) => {
      const value = event.target.value;

      setNewInvoice({
        ...newInvoice,
        customerName: value,
        customerId: "",
      });
    }}
    placeholder="اكتب اسم العميل"
    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
  />

  {newInvoice.customerName.trim() && !newInvoice.customerId && (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {customers
        .filter((customer) =>
          customer.name
            .toLowerCase()
            .includes(newInvoice.customerName.toLowerCase())
        )
        .map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => {
              setNewInvoice({
                ...newInvoice,
                customerId: customer.id,
                customerName: customer.name,
              });
            }}
            className="block w-full px-4 py-3 text-start text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {customer.name}
          </button>
        ))}

      {customers.filter((customer) =>
        customer.name
          .toLowerCase()
          .includes(newInvoice.customerName.toLowerCase())
      ).length === 0 && (
        <p className="px-4 py-3 text-sm text-slate-500">
          لا يوجد عميل بهذا الاسم
        </p>
      )}
    </div>
  )}
</div>



      </div>

      {/* Date */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
          التاريخ
        </label>

        <input
          type="date"
          value={newInvoice.date}
          onChange={(event) =>
            setNewInvoice({
              ...newInvoice,
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
          min="0"
          value={newInvoice.amount}
          onChange={(event) =>
            setNewInvoice({
              ...newInvoice,
              amount: event.target.value,
            })
          }
          placeholder="أدخل قيمة الفاتورة"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

     {/* Status */}
<div className="mt-4">
  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
    Status
  </label>

  <select
    value={newInvoice.status}
    onChange={(event) =>
      setNewInvoice({
        ...newInvoice,
        status: event.target.value,
      })
    }
    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
  >
    <option value="pending">Pending</option>
    <option value="paid">Paid</option>
    <option value="overdue">Overdue</option>
  </select>
</div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
         onClick={() => {
  setIsModalOpen(false);
  setEditingInvoiceId(null);

  setNewInvoice({
    customerName: "",
    date: "",
    amount: "",
    status: "pending",
  });
}}
          className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-white"
        >
          إغلاق
        </button>

        <button
  type="button"
  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
  onClick={handleSaveInvoice}
>
  {editingInvoiceId !== null ? "حفظ التعديلات" : "إضافة الفاتورة"}
</button>
      </div>
    </div>
  </div>
    </div>
  );
}