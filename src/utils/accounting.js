
import { customers as initialCustomers, transactions as initialTransactions } from "../data/mockData";

export const syncInvoiceAccounting = (invoiceList) => {
  // =========================
  // 1. Transactions
  // =========================

  const savedTransactions = localStorage.getItem("transactions");

  const currentTransactions = savedTransactions
    ? JSON.parse(savedTransactions)
    : initialTransactions;

  // نشيل أي Transactions اتعملت تلقائيًا من الفواتير قبل كده
  const manualTransactions = currentTransactions.filter(
    (transaction) => transaction.sourceType !== "invoice"
  );

  // الفواتير المدفوعة فقط تعتبر إيراد
  const invoiceTransactions = invoiceList
    .filter((invoice) => invoice.status === "paid")
    .map((invoice) => ({
      id: `invoice-${invoice.id}`,
      date: invoice.date,
      description: `فاتورة بيع ${invoice.invoiceNumber}`,
      category: "sales",
      type: "income",
      amount: Number(invoice.amount) || 0,

      // مهم جدًا عشان نعرف إن العملية جاية من فاتورة
      sourceType: "invoice",
      sourceId: invoice.id,
    }));

  const updatedTransactions = [
    ...manualTransactions,
    ...invoiceTransactions,
  ];

  localStorage.setItem(
    "transactions",
    JSON.stringify(updatedTransactions)
  );

  // =========================
  // 2. Customer Balances
  // =========================

  const savedCustomers = localStorage.getItem("customers");

  const currentCustomers = savedCustomers
    ? JSON.parse(savedCustomers)
    : initialCustomers;

  const updatedCustomers = currentCustomers.map((customer) => {
    const customerInvoices = invoiceList.filter(
      (invoice) => Number(invoice.customerId) === Number(customer.id)
    );

    // المستحق على العميل =
    // الفواتير Pending + Overdue
    const balance = customerInvoices
      .filter(
        (invoice) =>
          invoice.status === "pending" ||
          invoice.status === "overdue"
      )
      .reduce(
        (total, invoice) => total + (Number(invoice.amount) || 0),
        0
      );

    return {
      ...customer,
      balance,
    };
  });

  localStorage.setItem(
    "customers",
    JSON.stringify(updatedCustomers)
  );

  // نخلي باقي أجزاء التطبيق تعرف إن البيانات اتغيرت
  window.dispatchEvent(new Event("transactionsUpdated"));
  window.dispatchEvent(new Event("customersUpdated"));
};

