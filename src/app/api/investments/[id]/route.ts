import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// --- Helper Function for Security ---
// This function checks if the logged-in user owns the investment
async function verifyOwnership(
    investmentId: string,
    userEmail: string
): Promise<boolean> {
    const investment = await prisma.investment.findFirst({
        where: {
            id: investmentId,
            portfolio: {
                user: {
                    email: userEmail,
                },
            },
        },
    });
    return !!investment; // Returns true if found, false if not
}

// --- PUT: Edit an existing investment ---
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id: investmentId } = await params; // Get ID from the URL

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Security Check ---
    const isOwner = await verifyOwnership(investmentId, session.user.email);
    if (!isOwner) {
        return NextResponse.json({ error: "Investment not found or unauthorized" }, { status: 404 });
    }

    try {
        // Get the data to update from the request body
        const { name, ticker, type, currentValue, purchasePrice } = await request.json();

        // --- Update Investment ---
        const updatedInvestment = await prisma.investment.update({
            where: {
                id: investmentId,
            },
            data: {
                name: name,
                ticker: ticker,
                type: type,
                currentValue: parseFloat(currentValue),
                purchasePrice: parseFloat(purchasePrice)
            },
        });

        return NextResponse.json(updatedInvestment);
    } catch (error) {
        console.error("Investment Update Error:", error);
        return NextResponse.json(
            { error: "Failed to update investment" },
            { status: 500 }
        );
    }
}

// --- DELETE: Remove an existing investment ---
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id: investmentId } = await params; // Get ID from the URL

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Security Check ---
    const isOwner = await verifyOwnership(investmentId, session.user.email);
    if (!isOwner) {
        return NextResponse.json({ error: "Investment not found or unauthorized" }, { status: 404 });
    }

    try {
        // --- Delete Investment ---
        // We must use a transaction to delete the investment AND all its
        // related transactions. Otherwise, the database will throw an error.
        await prisma.$transaction([
            // 1. Delete all transactions linked to this investment
            prisma.transaction.deleteMany({
                where: {
                    investmentId: investmentId,
                },
            }),
            // 2. Delete the investment itself
            prisma.investment.delete({
                where: {
                    id: investmentId,
                },
            }),
        ]);

        // 204 No Content is a standard successful response for DELETE
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Investment Delete Error:", error);
        return NextResponse.json(
            { error: "Failed to delete investment" },
            { status: 500 }
        );
    }
}