import { useState, useCallback, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { isInstalled, getPublicKey, signMessage } from "@gemwallet/api";
import sdk from "@crossmarkio/sdk";

interface UseWalletReturn {
  xrpAddress: string;
  isLoading: boolean;
  error: string | null;
  xummQrCode: string;
  xummJumpLink: string;
  connectXUMM: () => Promise<void>;
  connectGEM: () => Promise<void>;
  connectCrossmark: () => Promise<void>;
  disconnect: () => void;
  isRetrieved: boolean;
}

export function useWallet(enableJwt: boolean = false): UseWalletReturn {
  const { data: session, status } = useSession();
  const [xrpAddress, setXrpAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [xummQrCode, setXummQrCode] = useState<string>("");
  const [xummJumpLink, setXummJumpLink] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Sync session with local state
  useEffect(() => {
    if (status === "authenticated" && session?.user?.address) {
      setXrpAddress(session.user.address);
    } else if (status === "unauthenticated") {
      setXrpAddress("");
    }
  }, [session, status]);

  const connectXUMM = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetch("/api/auth/xumm/createpayload");
      const data = await payload.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const qrCode = data.payload.refs.qr_png;
      const jumpLink = data.payload.next.always;

      setXummQrCode(qrCode);
      setXummJumpLink(jumpLink);

      // Open in new tab on mobile
      if (window.innerWidth < 768) {
        window.open(jumpLink, "_blank");
      }

      // Set up WebSocket connection
      const ws = new WebSocket(data.payload.refs.websocket_status);
      wsRef.current = ws;

      ws.onmessage = async (e) => {
        try {
          const responseObj = JSON.parse(e.data);
          if (responseObj.signed) {
            const payloadResponse = await fetch(
              `/api/auth/xumm/getpayload?payloadId=${responseObj.payload_uuidv4}`
            );
            const payloadJson = await payloadResponse.json();

            if (payloadJson.error) {
              throw new Error(payloadJson.error);
            }

            const hex = payloadJson.payload.response.hex;
            const checkSign = await fetch(`/api/auth/xumm/checksign?hex=${hex}`);
            const checkSignJson = await checkSign.json();

            if (checkSignJson.error) {
              throw new Error(checkSignJson.error);
            }

            setXrpAddress(checkSignJson.xrpAddress);
            if (enableJwt && checkSignJson.token) {
              await signIn("xumm", {
                token: checkSignJson.token,
                redirect: false,
              });
            }
            setIsLoading(false);
            ws.close();
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to verify signature");
          setIsLoading(false);
          ws.close();
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
        setIsLoading(false);
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create XUMM payload");
      setIsLoading(false);
    }
  }, [enableJwt]);

  const connectGEM = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const installed = await isInstalled();
      if (!installed.result.isInstalled) {
        throw new Error("GEM wallet is not installed");
      }

      const publicKeyResponse = await getPublicKey();
      const pubkey = publicKeyResponse.result?.publicKey;
      const address = publicKeyResponse.result?.address;

      if (!pubkey || !address) {
        throw new Error("Failed to get public key from GEM wallet");
      }

      // Get nonce
      const nonceResponse = await fetch(
        `/api/auth/gem/nonce?pubkey=${pubkey}&address=${address}`
      );
      const nonceData = await nonceResponse.json();

      if (nonceData.error) {
        throw new Error(nonceData.error);
      }

      const nonceToken = nonceData.token;

      // Sign message
      const signResponse = await signMessage(nonceToken);
      const signedMessage = signResponse.result?.signedMessage;

      if (!signedMessage) {
        throw new Error("Failed to sign message");
      }

      // Verify signature
      const checkSignResponse = await fetch(
        `/api/auth/gem/checksign?signature=${signedMessage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nonceToken}`,
          },
        }
      );

      const checkSignData = await checkSignResponse.json();

      if (checkSignData.error) {
        throw new Error(checkSignData.error);
      }

      if (!checkSignData.token || !checkSignData.address) {
        throw new Error("Invalid response from server");
      }

      setXrpAddress(checkSignData.address);
      if (enableJwt && checkSignData.token) {
        await signIn("gem", {
          token: checkSignData.token,
          redirect: false,
        });
      }
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to GEM wallet");
      setIsLoading(false);
    }
  }, [enableJwt]);

  const connectCrossmark = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get hash
      const hashResponse = await fetch("/api/auth/crossmark/hash");
      const hashJson = await hashResponse.json();

      if (hashJson.error) {
        throw new Error(hashJson.error);
      }

      const hash = hashJson.hash;

      // Sign in with Crossmark
      const signInResponse = await sdk.methods.signInAndWait(hash);
      const address = signInResponse.response.data.address;
      const pubkey = signInResponse.response.data.publicKey;
      const signature = signInResponse.response.data.signature;

      // Verify signature
      const checkSignResponse = await fetch(
        `/api/auth/crossmark/checksign?signature=${signature}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hash}`,
          },
          body: JSON.stringify({
            pubkey,
            address,
          }),
        }
      );

      const checkSignJson = await checkSignResponse.json();

      if (checkSignJson.error) {
        throw new Error(checkSignJson.error);
      }

      if (!checkSignJson.token) {
        throw new Error("Invalid response from server");
      }

      setXrpAddress(address);
      if (enableJwt && checkSignJson.token) {
        await signIn("crossmark", {
          token: checkSignJson.token,
          redirect: false,
        });
      }
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Crossmark");
      setIsLoading(false);
    }
  }, [enableJwt]);

  const disconnect = useCallback(async () => {
    setXrpAddress("");
    setXummQrCode("");
    setXummJumpLink("");
    await signOut({ redirect: false });
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return {
    xrpAddress,
    isLoading,
    error,
    xummQrCode,
    xummJumpLink,
    connectXUMM,
    connectGEM,
    connectCrossmark,
    disconnect,
    isRetrieved: status === "authenticated" && !!session?.user?.address,
  };
}

