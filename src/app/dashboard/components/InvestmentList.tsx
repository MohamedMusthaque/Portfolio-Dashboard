"use client";

import { useState, useEffect } from "react";

export type Investment = {
  id: string;
  name: string;
  ticker: string;
  type: string;
  purchasePrice: number;
  currentValue: number;
};

// Props:
// - refreshTrigger: A number that, when it changes, triggers a data refetch.
// - onEdit: Function to call when user clicks 'Edit', passing the investment.
// - onDataRefreshed: Function to call after a successful delete (to refresh *other* components)
interface ListProps {
  refreshTrigger: number;
  onEdit: (investment: Investment) => void;
  onDataRefreshed: () => void;
}

export default function InvestmentList({ refreshTrigger, onEdit, onDataRefreshed }: ListProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/investments");
      if (res.ok) {
        const data = await res.json();
        setInvestments(data);
      }
    } catch (err) {
      console.error("Failed to fetch investments", err);
    }
    setLoading(false);
  };

  // This effect runs when the component loads AND when 'refreshTrigger' changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvestments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment? This will also delete all its transactions.")) {
      try {
        const res = await fetch(`/api/investments/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          // Refresh the list AND tell the parent to refresh transactions
          fetchInvestments();
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
            const performance = inv.currentValue - inv.purchasePrice;
            const isPositive = performance >= 0;
            return (
              <div key={inv.id} className="border p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold">{inv.name} ({inv.ticker})</h3>
                <p className="text-sm text-gray-500">{inv.type}</p>
                <p>Current Value: ${inv.currentValue.toFixed(2)}</p>
                <p>Purchase Price: ${inv.purchasePrice.toFixed(2)}</p>
                <p className={isPositive ? 'text-green-600' : 'text-red-600'}>
                  Performance: {isPositive ? '+' : ''}${performance.toFixed(2)}
                </p>
                <div className="mt-4 space-x-2">
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
