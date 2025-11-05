"use client";

import { useState, useEffect } from "react";
import { Investment } from "./InvestmentList"; // We will create this type soon

// Props:
// - investment: The investment object to edit (can be null)
// - onClose: Function to call when closing the modal
// - onUpdated: Function to call after a successful update (to refresh data)
interface EditModalProps {
  investment: Investment | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditInvestmentModal({ investment, onClose, onUpdated }: EditModalProps) {
  // Local state for the form fields
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [type, setType] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [error, setError] = useState("");

  // When the 'investment' prop changes, update the local form state
  useEffect(() => {
    if (investment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(investment.name);
      setTicker(investment.ticker);
      setType(investment.type);
      setPurchasePrice(investment.purchasePrice.toString());
      setCurrentValue(investment.currentValue.toString());
    }
  }, [investment]); // This effect runs whenever 'investment' changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return; // Should not happen

    try {
      const res = await fetch(`/api/investments/${investment.id}`, {
        method: "PUT",
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
        onUpdated(); // Tell parent to refresh
        onClose(); // Close the modal
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update investment");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  // If no investment is selected, don't render anything
  if (!investment) return null;

  return (
    // Modal Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal Content */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Investment</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="Stock">Stock</option>
              <option value="Bond">Bond</option>
              <option value="Mutual Fund">Mutual Fund</option>
            </select>
            <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="px-3 py-2 border rounded-lg" />
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
