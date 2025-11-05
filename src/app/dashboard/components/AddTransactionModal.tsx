"use client";

import { useState } from "react";
import { Investment } from "./InvestmentList"; // Import the type

interface AddTransactionProps {
  investment: Investment | null; // The investment we're adding to
  onClose: () => void;
  onTransactionAdded: () => void; // To refresh all data
}

export default function AddTransactionModal({ 
  investment, 
  onClose, 
  onTransactionAdded 
}: AddTransactionProps) {
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return;

    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          investmentId: investment.id,
        }),
      });

      if (res.ok) {
        onTransactionAdded(); // Tell parent to refresh
        onClose(); // Close the modal
        // Clear form for next time
        setQuantity("");
        setPrice("");
        setType("BUY");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add transaction.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  // Don't render anything if no investment is selected
  if (!investment) return null;

  return (
    // Modal Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal Content */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Add Transaction for <span className="font-bold">{investment.name}</span>
        </h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as "BUY" | "SELL")} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Price per unit</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g., 150.25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg" 
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
