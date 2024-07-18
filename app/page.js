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
        alert(JSON.stringify(proof));
        // Check if the user has 10 or more followers
        const followerCount = parseInt(proof.parameters.follower_count);
        if (followerCount >= 10) {
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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">
        LinkedIn Follower Verification
      </h1>
      <p className="text-xl mb-8">
        You need at least 10 LinkedIn followers to access this app.
      </p>
      <button
        onClick={getVerificationReq}
        disabled={isVerifying}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isVerifying ? "Verifying..." : "Verify LinkedIn Followers"}
      </button>
    </main>
  );
}
