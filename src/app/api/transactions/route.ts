import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Import your auth config

const prisma = new PrismaClient();

// --- GET: List all transactions for the logged-in user ---
export async function GET(request: Request) {
  console.log("request ",request);

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user in the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find transactions where the investment's portfolio belongs to the user
  const transactions = await prisma.transaction.findMany({
    where: {
      investment: {
        portfolio: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      date: 'desc', // Show newest first
    }
  });

  return NextResponse.json(transactions);
}

// --- POST: Create a new transaction ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { type, quantity, price, investmentId } = await request.json();

    // --- Security Check ---
    // Verify that the investment being added to *belongs to the logged-in user*
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        portfolio: {
          userId: user.id, // This is the key security check
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found or you do not own it" },
        { status: 404 }
      );
    }

    // --- Create Transaction ---
    const newTransaction = await prisma.transaction.create({
      data: {
        type: type, // "BUY" or "SELL"
        quantity: parseInt(quantity),
        price: parseFloat(price),
        investmentId: investmentId,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Transaction Create Error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}