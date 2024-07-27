"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

const APP_ID = "0x33E090932F66d7340d7166E603b5E7F1EC4d9915";
const APP_SECRET =
  "0x98d41ae62da76289b5d5b5c98f5c9b61b572b482aa088de7f6c7b260848c8dc9";
const PROVIDER_ID = "4f041b5a-56b7-49e7-8289-e64cf5dad5a0"; // LinkedIn Equal

export default function Home() {
  const [url, setUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // mobile
      setIsMobile(true);
    } else {
      // desktop
      setIsMobile(false);
    }
  }, []);

  const handleVerificationSuccess = (proof) => {
    console.log("Verification success", proof);
    const followerCount = parseInt(
      JSON.parse(proof[0].claimData.parameters).paramValues.followers
    );
    if (followerCount >= 10) {
      router.push("/congrats");
    } else {
      alert(
        "Sorry, you need at least 10 LinkedIn followers to access this app."
      );
    }
    setIsVerifying(false);
  };
  const handleVerificationFailure = (error) => {
    console.error("Verification failed", error);
    alert("Verification failed. Please try again.");
    setIsVerifying(false);
  };

  const setupReclaimClient = async () => {
    await reclaimClient.buildProofRequest(PROVIDER_ID);
    reclaimClient.setSignature(
      await reclaimClient.generateSignature(APP_SECRET)
    );
  };

  const startReclaimSession = () => {
    reclaimClient.startSession({
      onSuccessCallback: handleVerificationSuccess,
      onFailureCallback: handleVerificationFailure,
    });
  };

  const getVerificationReq = async () => {
    setIsVerifying(true);
    await setupReclaimClient();
    const { requestUrl } = await reclaimClient.createVerificationRequest();
    startReclaimSession();
    window.open(requestUrl, "_blank");
  };

  const generateVerificationRequest = async () => {
    reclaimClient.addContext(
      `user's linkedin follower count`,
      "for Road To Global, ludium and namulabs"
    );
    await setupReclaimClient();
    const { requestUrl } = await reclaimClient.createVerificationRequest();
    setUrl(requestUrl);
    startReclaimSession();
  };

  const handleVerifyClick = () => {
    if (isMobile) {
      getVerificationReq();
    } else {
      generateVerificationRequest();
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="mb-8 text-4xl font-bold">
        LinkedIn Follower Verification
      </h1>
      <p className="mb-8 text-xl">
        You need at least 10 LinkedIn followers to access this app.
      </p>
      <button
        onClick={handleVerifyClick}
        disabled={isVerifying}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      >
        {isVerifying ? "Verifying..." : "Verify LinkedIn Followers"}
      </button>
      {url && <QRCode value={url} />}
    </main>
  );
}
