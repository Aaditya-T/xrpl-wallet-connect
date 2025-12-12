import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/hooks/useWallet";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [enableJwt, setEnableJwt] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const {
    xrpAddress,
    isLoading,
    error,
    xummQrCode,
    xummJumpLink,
    connectXUMM,
    connectGEM,
    connectCrossmark,
    disconnect,
    isRetrieved,
  } = useWallet(enableJwt);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">
          Welcome to XRPL wallet connect template!
        </h1>
        <p className="text-center mt-4 text-lg">
          This is a template for creating a wallet connect app with XRPL. Includes NextAuth.js authentication and 3 different wallet types.
        </p>
        <a
          href="https://github.com/Aaditya-T"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
        >
          <Image
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
            alt="Github logo"
            width={24}
            height={24}
            className="mr-2"
          />
          <span>Crafted by Aaditya (A.K.A Ghost!)</span>
        </a>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <Drawer>
          <DrawerTrigger
            className="mt-8 bg-blue-500 hover:bg-blue-600 w-48 h-12 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={connectXUMM}
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect with XAMAN"}
          </DrawerTrigger>
          <DrawerContent className="bg-white p-4">
            <DrawerHeader className="flex flex-col items-center">
              <DrawerTitle>Scan this QR code to sign in with Xaman!</DrawerTitle>
            </DrawerHeader>
            <DrawerDescription className="flex flex-col items-center">
              {xummQrCode !== "" ? (
                <Image
                  src={xummQrCode}
                  alt="Xaman QR code"
                  width={200}
                  height={200}
                  priority
                />
              ) : (
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[250px] w-[250px] rounded-xl bg-gray-300" />
                </div>
              )}
              {xummJumpLink !== "" && (
                <Button
                  className="mt-2 bg-blue-400 hover:bg-blue-500 w-48 h-12"
                  onClick={() => {
                    window.open(xummJumpLink, "_blank");
                  }}
                >
                  Open in Xaman
                </Button>
              )}
            </DrawerDescription>
          </DrawerContent>
        </Drawer>

        <Button
          className="mt-2 bg-blue-400 hover:bg-blue-500 w-48 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={connectGEM}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect with GEM"}
        </Button>

        <Button
          className="mt-2 bg-orange-500 hover:bg-orange-600 w-48 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={connectCrossmark}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect with Crossmark"}
        </Button>

        <div className="mt-2">
          <input
            type="checkbox"
            id="enableJwt"
            name="enableJwt"
            checked={enableJwt}
            onChange={() => setEnableJwt(!enableJwt)}
          />
          <label htmlFor="enableJwt" className="ml-2">
            Enable JWT
          </label>
        </div>

        <div className="mt-8">
          {xrpAddress !== "" && (
            <div className="text-center">
              <p>
                Your XRP address is:{" "}
                <a
                  className="font-bold text-blue-600 hover:text-blue-800 underline"
                  href={`https://bithomp.com/explorer/${xrpAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {xrpAddress.slice(0, 3)}...{xrpAddress.slice(-3)}
                </a>
              </p>
              {isRetrieved && (
                <p className="mt-2">
                  <span className="text-sm text-gray-600">
                    (Authenticated via NextAuth)
                  </span>
                </p>
              )}
              <Button
                className="mt-4 bg-red-500 hover:bg-red-600 w-48 h-10"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <p className="text-center">
            Have a suggestion or found a bug? Open an issue on the{" "}
            <a
              href="https://github.com/Aaditya-T/xrpl-wallet-connect"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              GitHub repository
            </a>
          </p>
        </div>

      </div>

    </main>
  );
}
