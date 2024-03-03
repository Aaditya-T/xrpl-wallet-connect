import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { isInstalled, getPublicKey, signMessage } from "@gemwallet/api";
import sdk from "@crossmarkio/sdk";
import {useCookies} from "react-cookie";

import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [qrcode, setQrcode] = useState<string>("");
  const [jumpLink, setJumpLink] = useState<string>("");
  const [xrpAddress, setXrpAddress] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies(["jwt"]);
  const [enableJwt, setEnableJwt] = useState<boolean>(false);
  const [retrieved, setRetrieved] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }

    if (cookies.jwt !== undefined && cookies.jwt !== null) {
      const url = "/api/auth";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: cookies.jwt }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.hasOwnProperty("xrpAddress")) {
            setXrpAddress(data.xrpAddress);
            setRetrieved(true);
          }
        });
    }
  }, []);

  const getQrCode = async () => {
    const payload = await fetch("/api/auth/xumm/createpayload");
    const data = await payload.json();

    setQrcode(data.payload.refs.qr_png);
    setJumpLink(data.payload.next.always);

    if (isMobile) {
      //open in new tab
      window.open(data.payload.next.always, "_blank");
    }

    const ws = new WebSocket(data.payload.refs.websocket_status);

    ws.onmessage = async (e) => {
      let responseObj = JSON.parse(e.data);
      if (responseObj.signed !== null && responseObj.signed !== undefined) {
        const payload = await fetch(
          `/api/auth/xumm/getpayload?payloadId=${responseObj.payload_uuidv4}`
        );
        const payloadJson = await payload.json();

        const hex = payloadJson.payload.response.hex;
        const checkSign = await fetch(`/api/auth/xumm/checksign?hex=${hex}`);
        const checkSignJson = await checkSign.json();
        setXrpAddress(checkSignJson.xrpAddress)
        if (enableJwt) {
          setCookie("jwt", checkSignJson.token, { path: "/" });
        }
      } else {
        console.log(responseObj);
      }
    };
  };

  const handleConnectGem = () => {
    isInstalled().then((response) => {
      if (response.result.isInstalled) {
        getPublicKey().then((response) => {
          // console.log(`${response.result?.address} - ${response.result?.publicKey}`);
          const pubkey = response.result?.publicKey;
          //fetch nonce from /api/gem/nonce?pubkey=pubkey
          fetch(
            `/api/auth/gem/nonce?pubkey=${pubkey}&address=${response.result?.address}`
          )
            .then((response) => response.json())
            .then((data) => {
              const nonceToken = data.token;
              const opts = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${nonceToken}`,
                },
              };
              signMessage(nonceToken).then((response) => {
                const signedMessage = response.result?.signedMessage;
                if (signedMessage !== undefined) {
                  //post at /api/gem/checksign?signature=signature
                  fetch(`/api/auth/gem/checksign?signature=${signedMessage}`, opts)
                    .then((response) => response.json())
                    .then((data) => {
                      const { token, address } = data;
                      if (token === undefined) {
                        console.log("error");
                        return;
                      }
                      setXrpAddress(address);
                      if (enableJwt) {
                        setCookie("jwt", token, { path: "/" });
                      }
                    });
                }
              });
            });
        });
      }
    });
  };

  const handleConnectCrossmark = async () => {
    //sign in first, then generate nonce
    const hashUrl = "/api/auth/crossmark/hash";
    const hashR = await fetch(hashUrl);
    const hashJson = await hashR.json();
    const hash = hashJson.hash;
    const id = await sdk.methods.signInAndWait(hash)
    console.log(id);
    const address = id.response.data.address;
    const pubkey = id.response.data.publicKey;
    const signature = id.response.data.signature;
    const checkSign = await fetch(
      `/api/auth/crossmark/checksign?signature=${signature}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hash}`,
        },
        body: JSON.stringify({
          pubkey: pubkey,
          address: address,
        }),
      }
    );

    const checkSignJson = await checkSign.json();
    if (checkSignJson.hasOwnProperty("token")) {
      setXrpAddress(address);
      if (enableJwt) {
        setCookie("jwt", checkSignJson.token, { path: "/" });
      }
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">
          Welcome to XRPL wallet connect template!
        </h1>
        <p className="text-center mt-4 text-lg">
          This is a template for creating a wallet connect app with XRPL. Includes basic JWT authentication and 3 different wallet types.
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
        <Drawer>

          <DrawerTrigger className="mt-8 bg-blue-500 hover:bg-blue-600 w-48 h-12 rounded-lg text-white" onClick={getQrCode}>
            Connect with XAMAN
          </DrawerTrigger>
          <DrawerContent className="bg-white p-4">
            <DrawerHeader className="flex flex-col items-center">
              <DrawerTitle>Scann this qr code to sign in with xaman!</DrawerTitle>
            </DrawerHeader>
            <DrawerDescription className="flex flex-col items-center">
              {
                qrcode !== "" ? (
                  <Image
                    src={qrcode}
                    alt="xaman qr code"
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-[250px] rounded-xl bg-gray-300" />
                  </div>
                )
              }
              {jumpLink !== "" && (
                <Button className="mt-2 bg-blue-400 hover:bg-blue-500 w-48 h-12" onClick={() => {
                  window.open(jumpLink, "_blank");
                }}>
                  Open in Xaman
                </Button>
              )}
            </DrawerDescription>
          </DrawerContent>
        </Drawer>

        <Button
          className="mt-2 bg-blue-400 hover:bg-blue-500 w-48 h-12"
          onClick={handleConnectGem}
        >
          Connect with GEM
        </Button>

        <Button
          className="mt-2 bg-orange-500 hover:bg-orange-600 w-48 h-12"
          onClick={handleConnectCrossmark}
        >
          Connect with Crossmark
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
            <p className="text-center">
              Your XRP address is: <a className="font-bold" href={`https://bithomp.com/explorer/${xrpAddress}`}>{xrpAddress.slice(0, 3)}...{xrpAddress.slice(-3)}</a>{" "}
              {retrieved && (
                <span className="text-red-500 underline" onClick={() => {
                  removeCookie("jwt");
                  setRetrieved(false);
                  setXrpAddress("");
                }}>
                  (Retrieved from cookies, click to remove)
                </span>
              )}
            </p>
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
