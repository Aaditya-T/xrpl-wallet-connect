import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "xumm",
      name: "XUMM",
      credentials: {
        token: { label: "JWT Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !process.env.ENC_KEY) {
          return null;
        }

        try {
          const decoded = jwt.verify(credentials.token, process.env.ENC_KEY) as {
            xrpAddress?: string;
          };

          if (decoded.xrpAddress) {
            return {
              id: decoded.xrpAddress,
              address: decoded.xrpAddress,
              walletType: "xumm",
            };
          }
        } catch (error) {
          return null;
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "gem",
      name: "GEM",
      credentials: {
        token: { label: "JWT Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !process.env.ENC_KEY) {
          return null;
        }

        try {
          const decoded = jwt.verify(credentials.token, process.env.ENC_KEY) as {
            xrpAddress?: string;
          };

          if (decoded.xrpAddress) {
            return {
              id: decoded.xrpAddress,
              address: decoded.xrpAddress,
              walletType: "gem",
            };
          }
        } catch (error) {
          return null;
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "crossmark",
      name: "Crossmark",
      credentials: {
        token: { label: "JWT Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !process.env.ENC_KEY) {
          return null;
        }

        try {
          const decoded = jwt.verify(credentials.token, process.env.ENC_KEY) as {
            xrpAddress?: string;
          };

          if (decoded.xrpAddress) {
            return {
              id: decoded.xrpAddress,
              address: decoded.xrpAddress,
              walletType: "crossmark",
            };
          }
        } catch (error) {
          return null;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = (user as { address?: string }).address;
        token.walletType = (user as { walletType?: string }).walletType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          address: token.address as string,
          walletType: token.walletType as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

