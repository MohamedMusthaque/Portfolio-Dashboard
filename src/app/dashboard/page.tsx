"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

// Define a type for your investment data
type Investment = {
  id: string;
  name: string;
  ticker: string;
  currentValue: number;
  purchasePrice: number;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Fetch investments when the component loads
  useEffect(() => {
    async function fetchInvestments() {
      const res = await fetch("/api/investments"); // Call your API route
      if (res.ok) {
        const data = await res.json();
        setInvestments(data);
      }
    }

    if (status === "authenticated") {
      fetchInvestments();
    }
  }, [status]); // Re-run when auth status changes

  // Handle loading state
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Handle unauthenticated state
  if (status === "unauthenticated") {
    return (
      <div>
        <p>Access Denied. Please log in.</p>
        <button onClick={() => signIn()} className="bg-blue-500 text-white p-2 rounded">
          Log In
        </button>
      </div>
    );
  }

  // The main dashboard UI
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {session?.user?.email}</h1>
      
      <h2 className="text-2xl font-semibold mb-2">Your Portfolio </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((investment) => {
          const performance = investment.currentValue - investment.purchasePrice;
          const isPositive = performance >= 0;

          return (
            <div key={investment.id} className="border p-4 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-bold">{investment.name} ({investment.ticker})</h3>
              <p>Current Value: ${investment.currentValue}</p>
              <p>Purchase Price: ${investment.purchasePrice}</p>
              <p className={isPositive ? 'text-green-600' : 'text-red-600'}>
                Performance: {isPositive ? '+' : ''}${performance.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}