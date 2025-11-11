import React, { useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Item = {
    id: string;
    description: string;
    qty: number;
    price: number;
};

export default function SalesBilling() {
    const [customer, setCustomer] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [items, setItems] = useState<Item[]>([{ id: cryptoRandomId(), description: "", qty: 1, price: 0 }]);
    const [taxPercent, setTaxPercent] = useState<number>(10);
    const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
    const [discountValue, setDiscountValue] = useState<number>(0);

    // Mode of Payment states
    const [modeOfPayment, setModeOfPayment] = useState<"cash" | "debitcard" | "creditcard" | "other">("cash");
    const [paymentDetails, setPaymentDetails] = useState<string>("");
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const receiptRef = useRef<HTMLDivElement>(null);

    function cryptoRandomId() {
        return Math.random().toString(36).slice(2, 9);
    }

    function updateItem(id: string, patch: Partial<Item>) {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    }

    function addItem() {
        setItems((prev) => [...prev, { id: cryptoRandomId(), description: "", qty: 1, price: 0 }]);
    }

    function removeItem(id: string) {
        setItems((prev) => prev.filter((it) => it.id !== id));
    }

    const subtotal = useMemo(
        () => items.reduce((s, it) => s + Math.max(0, it.qty) * Math.max(0, it.price), 0),
        [items]
    );

    const taxAmount = useMemo(() => (subtotal * Math.max(0, taxPercent)) / 100, [subtotal, taxPercent]);

    const discountAmount = useMemo(() => {
        if (discountType === "amount") return Math.min(Math.max(0, discountValue), subtotal + taxAmount);
        return ((subtotal + taxAmount) * Math.max(0, discountValue)) / 100;
    }, [discountType, discountValue, subtotal, taxAmount]);

    const total = useMemo(() => Math.max(0, subtotal + taxAmount - discountAmount), [subtotal, taxAmount, discountAmount]);

    function downloadJSON() {
        const payload = { customer, date, items, subtotal, taxPercent, taxAmount, discountType, discountValue, discountAmount, total, modeOfPayment, bankName, accountName, accountNumber};
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadCSV() {
        const lines = [
            ["customer", customer],
            ["date", date],
            ["modeOfPayment", modeOfPayment],
            ["bankName", bankName],
            ["accountName", accountName],
            ["accountNumber", accountNumber],
            [],
            ["description", "qty", "price", "lineTotal"],
            ...items.map((it) => [it.description, String(it.qty), String(it.price), String((it.qty * it.price).toFixed(2))]),
            [],
            ["subtotal", subtotal.toFixed(2)],
            ["taxPercent", `${taxPercent}%`],
            ["taxAmount", taxAmount.toFixed(2)],
            ["discount", discountType === "amount" ? discountValue.toFixed(2) : `${discountValue}%`],
            ["discountAmount", discountAmount.toFixed(2)],
            ["total", total.toFixed(2)],
        ];
        const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // --- React to Print ---
    const handlePrint = useReactToPrint({
    contentRef: receiptRef, // <-- pass the ref directly
    documentTitle: `e-receipt-${date}`,
    onAfterPrint: () => alert("E-Receipt ready!"),
    });

    return (
        <div style={{ maxWidth: 900, margin: "24px auto", fontFamily: "Inter, Roboto, sans-serif" }}>
            <div ref={receiptRef} style={{ padding: 12, backgroundColor: "#fff" }}>
                {/* Customer & Date */}
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <input
                        placeholder="Customer name"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        style={{ flex: 1, padding: 8 }}
                    />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: 8 }} />
                </div>

                {/* Items Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: 8 }}>Description</th>
                            <th style={{ padding: 8, width: 100 }}>Qty</th>
                            <th style={{ padding: 8, width: 120 }}>Price</th>
                            <th style={{ padding: 8, width: 120 }}>Line Total</th>
                            <th style={{ padding: 8, width: 48 }} />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                                <td style={{ padding: 8 }}>
                                    <input
                                        value={it.description}
                                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                                        style={{ width: "100%", padding: 6 }}
                                        placeholder="Item description"
                                    />
                                </td>
                                <td style={{ padding: 8 }}>
                                    <input
                                        type="number"
                                        min={0}
                                        value={it.qty}
                                        onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) || 0 })}
                                        style={{ width: "100%", padding: 6 }}
                                    />
                                </td>
                                <td style={{ padding: 8 }}>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={it.price}
                                        onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                                        style={{ width: "100%", padding: 6 }}
                                    />
                                </td>
                                <td style={{ padding: 8 }}>{(it.qty * it.price).toFixed(2)}</td>
                                <td style={{ padding: 8 }}>
                                    <button onClick={() => removeItem(it.id)} style={{ padding: "6px 8px" }}>
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <button onClick={addItem} style={{ padding: "8px 12px" }}>+ Add item</button>
                </div>

                <div>
                    {/* Tax & Discount */}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <strong>Discount</strong>
                            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} style={{ padding: 6 }}>
                                <option value="amount">Amount</option>
                                <option value="percent">Percent</option>
                            </select>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                                style={{ width: 100, padding: 6 }}
                            />
                        </label>
                    </div>
                </div>

                {/* Totals */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <div style={{ minWidth: 220 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span>Subtotal</span>
                            <strong>{subtotal.toFixed(2)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span>Tax ({taxPercent}%)</span>
                            <span>{taxAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span>Discount</span>
                            <span>-{discountAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px dashed #ddd" }}>
                            <strong>Total</strong>
                            <strong>{total.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                {/* Mode of Payment */}
                <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>Mode of Payment</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="radio" checked={modeOfPayment === "cash"} onChange={() => { setModeOfPayment("cash"); setPaymentDetails(""); }} />
                            Cash
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="radio" checked={modeOfPayment === "debitcard"} onChange={() => { setModeOfPayment("debitcard"); setPaymentDetails(""); }} />
                            Debit Card
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="radio" checked={modeOfPayment === "creditcard"} onChange={() => { setModeOfPayment("creditcard"); setPaymentDetails(""); }} />
                            Credit Card
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="radio" checked={modeOfPayment === "other"} onChange={() => { setModeOfPayment("other"); setPaymentDetails(""); }} />
                            Other
                        </label>
                    </div>

                    {modeOfPayment !== "cash" && (
                        <div style={{ marginTop: 8 }}>
                            <h1 style={{ fontSize: 14, marginBottom: 4 }}>Bank</h1>
                            <input
                            placeholder={
                                modeOfPayment === "debitcard"
                                ? "Bank name (e.g., BPI)"
                                : modeOfPayment === "creditcard"
                                ? "Card type (e.g., Visa)"
                                : "Payment details"
                            }
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            style={{ width: "100%", padding: 8, marginBottom: 8 }}
                            />

                            <h1 style={{ fontSize: 14, marginBottom: 4 }}>Account Name</h1>
                            <input
                            placeholder="(Firstname, Lastname)"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            style={{ width: "100%", padding: 8, marginBottom: 8 }}
                            />

                            <h1 style={{ fontSize: 14, marginBottom: 4 }}>Account Number</h1>
                            <input
                            placeholder="(123456789XXX)"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            style={{ width: "100%", padding: 8 }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Export Buttons */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button onClick={downloadJSON} style={{ padding: "8px 12px" }}>Export JSON</button>
                <button onClick={downloadCSV} style={{ padding: "8px 12px" }}>Export CSV</button>
                <button onClick={handlePrint} style={{ padding: "8px 12px" }}>Export E-Receipt</button>
            </div>
        </div>
    );
}





