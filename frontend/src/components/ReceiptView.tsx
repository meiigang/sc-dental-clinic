'use client';

import { useEffect, useState } from "react";

type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

type DetailedInvoice = {
  id: string;
  invoice_date: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  mode_of_payment: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  items: InvoiceItem[];
  appointment: {
    patient: {
      firstName: string;
      lastName: string;
    };
    dentist: {
      firstName: string;
      lastName: string;
    };
  };
};

type ReceiptViewProps = {
  invoiceId: string;
};

export default function ReceiptView({ invoiceId }: ReceiptViewProps) {
  const [invoice, setInvoice] = useState<DetailedInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch receipt details.');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  if (isLoading) return <div className="p-4 text-center">Loading receipt...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!invoice) return <div className="p-4 text-center">No details found.</div>;

  const patientName = `${invoice.appointment.patient.firstName} ${invoice.appointment.patient.lastName}`;
  const dentistName = `Dr. ${invoice.appointment.dentist.firstName} ${invoice.appointment.dentist.lastName}`;

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-dark">SC Dental Clinic</h2>
        <p className="text-sm text-gray-500">Official Receipt</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><span className="font-semibold">Patient:</span> {patientName}</p>
          <p><span className="font-semibold">Billed By:</span> {dentistName}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Invoice ID:</span> {invoice.id}</p>
          <p><span className="font-semibold">Date:</span> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
              <th className="px-4 py-2 text-center font-semibold">Qty</th>
              <th className="px-4 py-2 text-right font-semibold">Unit Price</th>
              <th className="px-4 py-2 text-right font-semibold">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right">₱{Number(item.unit_price).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">₱{(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal:</span><span>₱{Number(invoice.subtotal).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax (10%):</span><span>₱{Number(invoice.tax_amount).toFixed(2)}</span></div>
          <div className="flex justify-between text-red-600"><span>Discount:</span><span>- ₱{Number(invoice.discount_amount).toFixed(2)}</span></div>
          <hr/>
          <div className="flex justify-between font-bold text-base"><span>Total Paid:</span><span>₱{Number(invoice.total_amount).toFixed(2)}</span></div>
          <div className="flex justify-between pt-2"><span>Payment Method:</span><span>{invoice.mode_of_payment}</span></div>
        </div>
      </div>
    </div>
  );
}