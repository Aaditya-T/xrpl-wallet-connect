import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      address: string;
      walletType: string;
    };
  }

  interface User {
    address: string;
    walletType: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
    walletType?: string;
  }
}

