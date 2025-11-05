"use client";

import { useState } from "react";
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
    // Local state for the form fields - initialize with current investment values
    const [ticker, setTicker] = useState(investment?.ticker || "");
    const [type, setType] = useState(investment?.type || "");
    const [purchasePrice, setPurchasePrice] = useState(investment?.purchasePrice.toString() || "");
    const [currentValue, setCurrentValue] = useState(investment?.currentValue.toString() || "");
    const [error, setError] = useState("");

    const handleCancel = () => {
        // Reset form to original values
        setTicker(investment?.ticker || "");
        setType(investment?.type || "");
        setPurchasePrice(investment?.purchasePrice.toString() || "");
        setCurrentValue(investment?.currentValue.toString() || "");
        setError("");
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!investment) return; // Should not happen

        try {
            const res = await fetch(`/api/investments/${investment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: investment.name,
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
                <h2 className="text-xl font-semibold mb-4 text-black">Edit Investment - {investment?.name}</h2>
                {error && <div className="text-red-600 mb-3">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="edit-name">
                                Investment Name
                            </label>
                            <input
                                type="text"
                                id="edit-name"
                                placeholder="Name (e.g., Apple Inc.)"
                                value={investment?.name || ""}
                                readOnly
                                className="w-full px-3 py-2 border rounded-lg text-black bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="edit-ticker">
                                Ticker Symbol
                            </label>
                            <input
                                type="text"
                                id="edit-ticker"
                                placeholder="Ticker (e.g., AAPL)"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="edit-type">
                                Investment Type
                            </label>
                            <select
                                id="edit-type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className={`w-full px-3 py-2 border border-black rounded-lg ${type === "" ? "text-gray-400" : "text-black"}`}
                            >
                                <option value="" disabled>Investment Type</option>
                                <option value="Stock">Stock</option>
                                <option value="Bond">Bond</option>
                                <option value="Mutual Fund">Mutual Fund</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="edit-purchase-price">
                                Purchase Price (USD)
                            </label>
                            <input
                                type="number"
                                id="edit-purchase-price"
                                placeholder="Purchase Price (USD)"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border rounded-lg text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="edit-current-value">
                                Current Value (USD)
                            </label>
                            <input
                                type="number"
                                id="edit-current-value"
                                placeholder="Current Value (USD)"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border rounded-lg text-black"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            type="button"
                            onClick={handleCancel}
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
