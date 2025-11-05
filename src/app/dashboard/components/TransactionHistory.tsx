"use client";

import { useState, useEffect } from "react";

type Transaction = {
  id: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number | string;
  date: string;
  investment: {  // This is now a nested object
    name: string;
    ticker: string;
  };
};

interface HistoryProps {
  refreshTrigger: number;
}

export default function TransactionHistory({ refreshTrigger }: HistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
    setLoading(false);
  };

  // This effect runs when the component loads AND when 'refreshTrigger' changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, [refreshTrigger]);

  if (loading) return <p>Loading transaction history...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-black">No transactions found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <li key={tx.id} className="py-3 flex justify-between items-center">
              <div>
                <span className={`font-bold ${tx.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type}
                </span>
                <span className="ml-2 text-black">{tx.quantity} units @ ${Number(tx.price).toFixed(2)}</span>
                <p className="text-sm text-gray-500">
                  {tx.investment.name} ({tx.investment.ticker})
                </p>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(tx.date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
