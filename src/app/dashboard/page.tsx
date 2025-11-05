"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddInvestmentForm from "./components/AddInvestmentForm";
import InvestmentList, { Investment } from "./components/InvestmentList";
import TransactionHistory from "./components/TransactionHistory";
import EditInvestmentModal from "./components/EditInvestmentModal";
import AddTransactionModal from "./components/AddTransactionModal";

export default function Dashboard() {
  const router = useRouter();

  // This is the auth guard.
  // It checks for an authenticated session.
  // If not found, it calls 'onUnauthenticated' to redirect to login.
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // State to manage the Edit Modal
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  // This simple state value is a "key".
  // We will pass it as a prop 'refreshTrigger' to the list components.
  // When we want to force them to refetch data, we just increment this key.
  const [refreshKey, setRefreshKey] = useState(0);

  const [addingTransactionTo, setAddingTransactionTo] = useState<Investment | null>(null);

  // Helper to trigger a refresh for all data
  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Incrementing the key
  };

  const handleEditClick = (investment: Investment) => {
    setEditingInvestment(investment);
  };

  const handleModalClose = () => {
    setEditingInvestment(null);
  };

  const handleModalUpdate = () => {
    triggerRefresh(); // Refresh data after update
    handleModalClose(); // Close modal
  };

  // New Handlers for the transaction modal
  const handleAddTransactionClick = (investment: Investment) => {
    setAddingTransactionTo(investment);
  };
  const handleTransactionModalClose = () => {
    setAddingTransactionTo(null);
  };
  const handleTransactionAdded = () => {
    triggerRefresh(); // Refresh all data
    handleTransactionModalClose(); // Close the modal
  };

  // Show loading screen while session is being verified
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If session is valid, render the dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
          <div>
            <span className="text-gray-700 mr-4">Welcome, {session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })} // Sign out and redirect to home
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* 1. Add Investment Form */}
        <AddInvestmentForm onInvestmentAdded={triggerRefresh} />

        {/* 2. Portfolio Overview / Investment List */}
        <InvestmentList
          refreshTrigger={refreshKey}
          onEdit={handleEditClick}
          onDataRefreshed={triggerRefresh}
          onAddTransaction={handleAddTransactionClick}
        />

        {/* 3. Transaction History */}
        <TransactionHistory refreshTrigger={refreshKey} />
      </main>

      {/* 4. Edit Investment Modal (only appears when 'editingInvestment' is set) */}
      <EditInvestmentModal
        key={editingInvestment?.id || 'no-investment'}
        investment={editingInvestment}
        onClose={handleModalClose}
        onUpdated={handleModalUpdate}
      />

      {/* 5. Add Investment Modal */}
      <AddTransactionModal
        key={addingTransactionTo?.id || 'no-transaction'}
        investment={addingTransactionTo}
        onClose={handleTransactionModalClose}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
