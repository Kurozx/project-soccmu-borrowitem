import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const username = String(
            credentials?.username || ""
          ).trim();

          const password = String(
            credentials?.password || ""
          );

          if (!username || !password) {
            return null;
          }

          const [rows] = await db.execute(
            `
            SELECT
              id,
              username,
              email,
              password,
              role
            FROM users
            WHERE username = ?
            LIMIT 1
            `,
            [username]
          );

          if (!Array.isArray(rows) || rows.length === 0) {
            console.log("LOGIN: Username not found");
            return null;
          }

          const user = rows[0] as {
            id: number;
            username: string;
            email: string;
            password: string;
            role: "user" | "admin";
          };

          const passwordMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordMatch) {
            console.log("LOGIN: Password incorrect");
            return null;
          }

          console.log("LOGIN SUCCESS:", {
            id: user.id,
            username: user.username,
            role: user.role,
          });

          return {
            id: String(user.id),
            name: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error(
            "AUTH AUTHORIZE ERROR:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // แก้ปัญหา AdapterUser ไม่มี role
        token.role = (user as {
          role: "user" | "admin";
        }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);

        session.user.role =
          token.role as "user" | "admin";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});