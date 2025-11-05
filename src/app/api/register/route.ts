import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

interface UserCreateData {
    name: string;
    email: string;
    password: string;
}

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // --- Validation ---
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email and password are required" },
                { status: 400 }
            );
        }

        // Validate name length
        if (name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name cannot be empty" },
                { status: 400 }
            );
        }

        if (name.length > 255) {
            return NextResponse.json(
                { error: "Name must be less than 255 characters" },
                { status: 400 }
            );
        }

        // --- Check for existing user ---
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 } // 409 Conflict
            );
        }

        // --- Hash Password ---
        // Never store plain text passwords!
        const hashedPassword = await hash(password, 10); // 10 is the salt round

        // --- Create User ---
        const userData: UserCreateData = {
            name: name.trim(),
            email: email,
            password: hashedPassword,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newUser = await (prisma.user as any).create({
            data: userData,
        });

        // --- Create a default portfolio for the new user ---
        // This makes the app easier to use immediately after signup
        await prisma.portfolio.create({
            data: {
                name: "My First Portfolio",
                userId: newUser.id,
            }
        });

        // Don't send the password back, even the hashed one
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        );
    }
}