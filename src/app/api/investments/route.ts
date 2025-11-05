import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // Helper to get session on server
import { authOptions } from "../auth/[...nextauth]/route"; // Import your auth config

const prisma = new PrismaClient();

// GET: Fetch all investments for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all investments for the user across all their portfolios
    const investments = await prisma.investment.findMany({
      where: { 
        portfolio: { 
          user: {
            email: session.user.email
          }
        } 
      },
      include: {
        portfolio: {
          select: {
            id: true,
            name: true
          }
        },
        transactions: {
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" }, 
      { status: 500 }
    );
  }
}

// POST: Add a new investment 
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.ticker || !data.type || !data.purchasePrice || !data.currentValue) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Find or create a default portfolio for the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolios: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let portfolio;
    if (user.portfolios.length === 0) {
      // Create a default portfolio if none exists
      portfolio = await prisma.portfolio.create({
        data: {
          name: "My Portfolio",
          userId: user.id
        }
      });
    } else {
      portfolio = user.portfolios[0];
    }

    const newInvestment = await prisma.investment.create({
      data: {
        name: data.name,
        ticker: data.ticker.toUpperCase(),
        type: data.type,
        purchasePrice: parseFloat(data.purchasePrice),
        currentValue: parseFloat(data.currentValue),
        portfolioId: portfolio.id,
      },
      include: {
        portfolio: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(newInvestment, { status: 201 });
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json(
      { error: "Failed to create investment" }, 
      { status: 500 }
    );
  }
}
