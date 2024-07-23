"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reclaim } from "@reclaimprotocol/js-sdk";

export default function Home() {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const getVerificationReq = async () => {
    setIsVerifying(true);
    const APP_ID = "0x33E090932F66d7340d7166E603b5E7F1EC4d9915";
    const reclaimClient = new Reclaim.ProofRequest(APP_ID);

    const providerIds = [
      "4f041b5a-56b7-49e7-8289-e64cf5dad5a9", // LinkedIn Equal
    ];

    await reclaimClient.buildProofRequest(providerIds[0]);

    const APP_SECRET =
      "0x98d41ae62da76289b5d5b5c98f5c9b61b572b482aa088de7f6c7b260848c8dc9";
    reclaimClient.setSignature(
      await reclaimClient.generateSignature(APP_SECRET)
    );

    const { requestUrl } = await reclaimClient.createVerificationRequest();

    await reclaimClient.startSession({
      onSuccessCallback: (proof) => {
        console.log("Verification success", proof);
        prompt(
          "",
          JSON.stringify(JSON.stringify(proof[0].claimData.parameters))
        );
        // Check if the user has 10 or more followers
        const followerCount = parseInt(
          proof[0].claimData.parameters.paramValues.followers
        );
        if (followerCount == 0) {
          router.push("/congrats");
        } else {
          alert(
            "Sorry, you need at least 10 LinkedIn followers to access this app."
          );
        }
        setIsVerifying(false);
      },
      onFailureCallback: (error) => {
        console.error("Verification failed", error);
        alert("Verification failed. Please try again.");
        setIsVerifying(false);
      },
    });

    // Open the verification URL in a new window
    window.open(requestUrl, "_blank");
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
        onClick={getVerificationReq}
        disabled={isVerifying}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      >
        {isVerifying ? "Verifying..." : "Verify LinkedIn Followers"}
      </button>
    </main>
  );
}
