// app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export async function POST(request: Request) {
    console.log("🔧 Iniciando processo de autenticação...");

    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token não fornecido" },
                { status: 400 }
            );
        }

        // 🔍 Verifica token do Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return NextResponse.json(
                { error: "Token inválido" },
                { status: 401 }
            );
        }

        const { email, name, picture } = payload;

        console.log("👤 Dados do Google:", { email, name });

        // 🔄 Upsert do usuário (cria ou atualiza)
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name: name || undefined,
                picture: picture || undefined,
            },
            create: {
                email,
                name: name || "",
                picture: picture || "",
            },
            include: {
                // igual ao exemplo do Prisma
                // posts: true,  // se quiser relacionamentos aqui
            },
        });

        console.log("✅ Usuário encontrado/criado:", user.id);

        // 🔐 Gera JWT
        const myJwt = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            success: true,
            jwt: myJwt,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
        });

    } catch (err) {
        console.error("❌ Erro interno:", err);

        return NextResponse.json(
            {
                error: "Erro interno no servidor",
                details: process.env.NODE_ENV === "development"
                    ? (err instanceof Error ? err.message : String(err))
                    : undefined,
            },
            { status: 500 }
        );
    }
}
