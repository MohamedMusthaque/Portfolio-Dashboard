"use client";

import { useState, useEffect, useCallback } from "react";

export type Investment = {
    id: string;
    name: string;
    ticker: string;
    type: string;
    purchasePrice: number | string;
    currentValue: number | string;
};

// Props:
// - refreshTrigger: A number that, when it changes, triggers a data refetch.
// - onEdit: Function to call when user clicks 'Edit', passing the investment.
// - onDataRefreshed: Function to call after a successful delete (to refresh *other* components)
// - onAddTransaction: Function to make the Transaction
interface ListProps {
    refreshTrigger: number;
    onEdit: (investment: Investment) => void;
    onDataRefreshed: () => void;
    onAddTransaction: (investment: Investment) => void;
}

export default function InvestmentList({ refreshTrigger, onEdit, onDataRefreshed, onAddTransaction }: ListProps) {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [quantitiesLoading, setQuantitiesLoading] = useState(false);

    // Function to fetch available quantities for all investments
    const fetchQuantities = async (investmentList: Investment[]) => {
        setQuantitiesLoading(true);
        const quantityPromises = investmentList.map(async (inv) => {
            try {
                const res = await fetch(`/api/investments/${inv.id}/quantity`);
                if (res.ok) {
                    const data = await res.json();
                    return { id: inv.id, quantity: data.availableQuantity };
                }
            } catch (err) {
                console.error(`Failed to fetch quantity for ${inv.id}`, err);
            }
            return { id: inv.id, quantity: 0 };
        });

        const results = await Promise.all(quantityPromises);
        const quantityMap: Record<string, number> = {};
        results.forEach(result => {
            quantityMap[result.id] = result.quantity;
        });
        setQuantities(quantityMap);
        setQuantitiesLoading(false);
    };

    // Function to fetch data
    const fetchInvestments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/investments");
            if (res.ok) {
                const data = await res.json();
                setInvestments(data);
                // Fetch quantities after getting investments
                await fetchQuantities(data);
            }
        } catch (err) {
            console.error("Failed to fetch investments", err);
        }
        setLoading(false);
    }, []);

    // This effect runs when the component loads AND when 'refreshTrigger' changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchInvestments();
    }, [refreshTrigger, fetchInvestments]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this investment? This will also delete all its transactions.")) {
            try {
                const res = await fetch(`/api/investments/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    // Refresh the list AND tell the parent to refresh transactions
                    await fetchInvestments();
                    onDataRefreshed();
                } else {
                    alert("Failed to delete investment.");
                }
            } catch (err) {
                console.error(err);
                alert("An error occurred while deleting.");
            }
        }
    };

    if (loading) return <p>Loading investments...</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Portfolio Overview</h2>
            {investments.length === 0 ? (
                <p className="text-black">You have no investments. Add one above to get started!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investments.map((inv) => {
                        const performance = Number(inv.currentValue) - Number(inv.purchasePrice);
                        const isPositive = performance >= 0;
                        return (
                            <div key={inv.id} className="border p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold text-black">{inv.name} ({inv.ticker})</h3>
                                <p className="text-sm text-gray-500">{inv.type}</p>
                                <div className="space-y-1 mt-2">
                                    <p className="text-black">Current Value: ${Number(inv.currentValue).toFixed(2)}</p>
                                    <p className="text-black">Purchase Price: ${Number(inv.purchasePrice).toFixed(2)}</p>
                                    <p className={isPositive ? 'text-green-600' : 'text-red-600'}>
                                        Performance: {isPositive ? '+' : ''}${Number(performance).toFixed(2)}
                                    </p>
                                    <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                        <p className="text-blue-700 font-medium text-sm">
                                            Available Quantity: {
                                                quantitiesLoading
                                                    ? 'Loading...'
                                                    : (quantities[inv.id] !== undefined ? quantities[inv.id] : '0')
                                            } units
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 space-x-2">
                                    <button
                                        onClick={() => onAddTransaction(inv)}
                                        className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Add Tx
                                    </button>
                                    <button
                                        onClick={() => onEdit(inv)}
                                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(inv.id)}
                                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
