"use client";

import React, { useMemo, useState } from "react";

const initialAccounts = [
  "Khatiana Main Ads Account",
  "Khatiana Shonpapri",
  "Khatiana Am Sotto Achar",
  "Khatiana Jalmuri Mosla",
  "Khatiana Acher",
  "Fiha Shop Massage",
  "Mukhrochok Massage",
  "Mukhrochok Landing 1",
  "Mukhrochok Landing 2",
].map((name, idx) => ({
  id: idx + 1,
  name,
  amountSpent: "",
  costPerPurchase: "",
  totalPurchases: "",
  grandTotal: "",
}));

const num = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function Page() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [reportDate, setReportDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const updateAccount = (id, field, value) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc))
    );
  };

  const addAccount = () => {
    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Ads Account ${prev.length + 1}`,
        amountSpent: "",
        costPerPurchase: "",
        totalPurchases: "",
        grandTotal: "",
      },
    ]);
  };

  const deleteAccount = (id) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const accountRows = useMemo(() => {
    return accounts.map((acc) => {
      const amountSpent = num(acc.amountSpent);
      const purchases = num(acc.totalPurchases);
      const revenue = num(acc.grandTotal);
      const aov = purchases > 0 ? revenue / purchases : 0;
      const roas = amountSpent > 0 ? revenue / amountSpent : 0;
      const avgCost = purchases > 0 ? amountSpent / purchases : 0;

      return {
        ...acc,
        amountSpent,
        purchases,
        revenue,
        aov,
        roas,
        avgCost,
      };
    });
  }, [accounts]);

  const summary = useMemo(() => {
    const totalSpend = accountRows.reduce((sum, row) => sum + row.amountSpent, 0);
    const totalOrders = accountRows.reduce((sum, row) => sum + row.purchases, 0);
    const totalRevenue = accountRows.reduce((sum, row) => sum + row.revenue, 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const avgCost = totalOrders > 0 ? totalSpend / totalOrders : 0;

    return { totalSpend, totalOrders, totalRevenue, aov, roas, avgCost };
  }, [accountRows]);

  const exportCSV = () => {
    const headers = [
      "Date",
      "Ads Account",
      "Amount Spent",
      "Cost per Purchase",
      "Total Purchases",
      "Grand Total",
      "AOV",
      "ROAS",
      "Avg Cost",
    ];

    const rows = accountRows.map((row) => [
      reportDate,
      row.name,
      row.amountSpent,
      num(accounts.find((a) => a.id === row.id)?.costPerPurchase || 0),
      row.purchases,
      row.revenue,
      row.aov.toFixed(2),
      row.roas.toFixed(2),
      row.avgCost.toFixed(2),
    ]);

    rows.push([]);
    rows.push(["Summary"]);
    rows.push(["Total Spend", summary.totalSpend.toFixed(2)]);
    rows.push(["Total Orders", summary.totalOrders]);
    rows.push(["Total Revenue", summary.totalRevenue.toFixed(2)]);
    rows.push(["AOV", summary.aov.toFixed(2)]);
    rows.push(["ROAS", summary.roas.toFixed(2)]);
    rows.push(["Avg Cost", summary.avgCost.toFixed(2)]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ads-report-${reportDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f8fafc" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 20,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>Facebook Ads Summary Dashboard</h1>
          <p style={{ color: "#64748b" }}>
            9টা ads account বা আরও বেশি account এর data input দিয়ে instant summary দেখুন
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={inputStyle}
            />
            <button onClick={exportCSV} style={buttonStyle}>
              Export CSV
            </button>
            <button onClick={addAccount} style={buttonStyle}>
              Add Account
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <SummaryCard title="Total Spend" value={`৳${money(summary.totalSpend)}`} />
          <SummaryCard title="Total Orders" value={summary.totalOrders} />
          <SummaryCard title="Total Revenue" value={`৳${money(summary.totalRevenue)}`} />
          <SummaryCard title="AOV" value={`৳${money(summary.aov)}`} />
          <SummaryCard title="ROAS" value={summary.roas.toFixed(2)} />
          <SummaryCard title="Avg Cost" value={`৳${money(summary.avgCost)}`} />
        </div>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 20,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            overflowX: "auto",
            marginBottom: 20,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
            <thead>
              <tr>
                {[
                  "Ads Account",
                  "Amount Spent",
                  "Cost per Purchase",
                  "Total Purchases",
                  "Grand Total",
                  "AOV",
                  "ROAS",
                  "Avg Cost",
                  "Action",
                ].map((head) => (
                  <th
                    key={head}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => {
                const row = accountRows.find((r) => r.id === acc.id);
                return (
                  <tr key={acc.id}>
                    <td style={tdStyle}>
                      <input
                        value={acc.name}
                        onChange={(e) => updateAccount(acc.id, "name", e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={acc.amountSpent}
                        onChange={(e) =>
                          updateAccount(acc.id, "amountSpent", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={acc.costPerPurchase}
                        onChange={(e) =>
                          updateAccount(acc.id, "costPerPurchase", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={acc.totalPurchases}
                        onChange={(e) =>
                          updateAccount(acc.id, "totalPurchases", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={acc.grandTotal}
                        onChange={(e) =>
                          updateAccount(acc.id, "grandTotal", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>৳{money(row?.aov || 0)}</td>
                    <td style={tdStyle}>{row?.roas?.toFixed(2) || "0.00"}</td>
                    <td style={tdStyle}>৳{money(row?.avgCost || 0)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        style={{
                          ...buttonStyle,
                          background: "#ef4444",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 20,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Final Output</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <OutputRow label="✅ Total" value={`৳${money(summary.totalSpend)}`} />
            <OutputRow label="Total Orders" value={summary.totalOrders} />
            <OutputRow label="Total Revenue" value={`৳${money(summary.totalRevenue)}`} />
            <OutputRow label="AOV" value={`৳${money(summary.aov)}`} />
            <OutputRow label="ROAS" value={summary.roas.toFixed(2)} />
            <OutputRow label="Av Cost" value={`৳${money(summary.avgCost)}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 20,
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#64748b", fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function OutputRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#f8fafc",
        padding: 14,
        borderRadius: 14,
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  boxSizing: "border-box",
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top",
};

const buttonStyle = {
  background: "#0f172a",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};
