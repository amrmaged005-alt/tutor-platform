import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Must be admin to mutate verified statuses
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, isVerified } = body;

        if (typeof userId !== "string" || typeof isVerified !== "boolean") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isVerified },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                isVerified: updatedUser.isVerified,
            },
        });
    } catch (error: any) {
        console.error("Error verifying tutor:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
