import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: investmentId } = await params;

        // Verify the investment belongs to the user
        const investment = await prisma.investment.findFirst({
            where: {
                id: investmentId,
                portfolio: {
                    user: {
                        email: session.user.email
                    }
                }
            }
        });

        if (!investment) {
            return NextResponse.json({ error: "Investment not found" }, { status: 404 });
        }

        // Get all transactions for this investment
        const transactions = await prisma.transaction.findMany({
            where: { investmentId: investmentId },
        });

        // Calculate available quantity
        let totalBought = 0;
        let totalSold = 0;

        transactions.forEach(tx => {
            if (tx.type === "BUY") {
                totalBought += tx.quantity;
            } else if (tx.type === "SELL") {
                totalSold += tx.quantity;
            }
        });

        const availableQuantity = totalBought - totalSold;

        return NextResponse.json({
            availableQuantity,
            totalBought,
            totalSold
        });
    } catch (error) {
        console.error("Error fetching quantity:", error);
        return NextResponse.json(
            { error: "Failed to fetch quantity" },
            { status: 500 }
        );
    }
}
