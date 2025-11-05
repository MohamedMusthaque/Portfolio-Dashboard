"use client";

import { useState, useEffect } from "react";
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
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch available quantity when investment changes
  useEffect(() => {
    const fetchAvailableQuantity = async () => {
      if (!investment) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/investments/${investment.id}/quantity`);
        if (res.ok) {
          const data = await res.json();
          setAvailableQuantity(data.availableQuantity);
        }
      } catch (err) {
        console.error("Failed to fetch available quantity", err);
      }
      setLoading(false);
    };

    fetchAvailableQuantity();
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return;

    setError("");

    // Frontend validation for SELL transactions
    if (type === "SELL") {
      const sellQuantity = parseInt(quantity);
      if (sellQuantity > availableQuantity) {
        setError(`Cannot sell ${sellQuantity} units. Only ${availableQuantity} units available.`);
        return;
      }
    }

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
        <h2 className="text-xl font-semibold mb-4 text-black">
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
                className="w-full px-3 py-2 border rounded-lg text-black"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Quantity
                {type === "SELL" && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Available: {loading ? "Loading..." : availableQuantity})
                  </span>
                )}
              </label>
              <input 
                type="number" 
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={type === "SELL" ? availableQuantity : undefined}
                step="1"
                required
                className="w-full px-3 py-2 border rounded-lg text-black" 
              />
              {type === "SELL" && availableQuantity === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  No units available to sell. You need to buy some first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Price per unit (USD)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g., 150.25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
                className="w-full px-3 py-2 border rounded-lg text-black" 
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
              disabled={type === "SELL" && availableQuantity === 0}
              className={`px-4 py-2 rounded-lg ${
                type === "SELL" && availableQuantity === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
