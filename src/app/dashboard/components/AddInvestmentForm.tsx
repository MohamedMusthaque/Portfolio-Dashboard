"use client";

import { useState } from "react";

// This component takes a function prop 'onInvestmentAdded'
// which it will call after successfully adding an investment.
// This tells the parent (Dashboard) to refresh its data.
export default function AddInvestmentForm({ onInvestmentAdded }: { onInvestmentAdded: () => void }) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [type, setType] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ticker,
          type,
          purchasePrice: parseFloat(purchasePrice),
          currentValue: parseFloat(currentValue),
        }),
      });

      if (res.ok) {
        // Clear the form
        setName("");
        setTicker("");
        setType("");
        setPurchasePrice("");
        setCurrentValue("");
        // Show success toast
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // Call the parent function to trigger a refresh
        onInvestmentAdded(); 
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add investment.");
      }
    } catch (error) {
        console.error(error);
        setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Add New Investment</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          Investment added successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Name (e.g., Apple Inc.)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-3 py-2 border rounded-lg text-black"
        />
        <input
          type="text"
          placeholder="Ticker (e.g., AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          required
          className="px-3 py-2 border rounded-lg text-black"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} required className={`px-3 py-2 border border-black rounded-lg ${type === "" ? "text-gray-400" : "text-black"}`}>
          <option value="" disabled>Select Investment Type</option>
          <option value="Stock" className="text-black">Stock</option>
          <option value="Bond" className="text-black">Bond</option>
          <option value="Mutual Fund" className="text-black">Mutual Fund</option>
        </select>
        <input
          type="number"
          placeholder="Purchase Price (USD)"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
          className="px-3 py-2 border rounded-lg text-black"
        />
        <input
          type="number"
          placeholder="Current Value (USD)"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          required
          className="px-3 py-2 border rounded-lg text-black"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Add Investment
        </button>
      </form>
    </div>
  );
}
