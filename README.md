# Reclaim Protocol을 이용한 LinkedIn 팔로워 확인 구현

이 가이드에서는 Reclaim Protocol을 사용하여 사용자의 LinkedIn 팔로워 수를 확인하는 Next.js 애플리케이션을 만드는 과정을 설명합니다. 서버 측에서 실행되어야 할 부분과 클라이언트 측에서 실행되는 부분을 구분하여 설명하겠습니다.

## 1. 프로젝트 설정

먼저 새로운 Next.js 프로젝트를 생성합니다:

```bash
npx create-next-app linkedin-follower-verification
cd linkedin-follower-verification
```

필요한 패키지를 설치합니다:

```bash
npm install @reclaimprotocol/js-sdk react-qr-code
```

## 2. Reclaim Protocol 구현

`app/page.js` 파일을 다음과 같이 작성합니다:

```jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

const APP_ID = "YOUR_APP_ID";
const APP_SECRET = "YOUR_APP_SECRET";
const PROVIDER_ID = "4f041b5a-56b7-49e7-8289-e64cf5dad5a0"; // LinkedIn Equal ABD

export default function Home() {
  const [url, setUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(isMobile);
  }, []);

  const handleVerificationSuccess = (proof) => {
    console.log("Verification success", proof);
    const followerCount = parseInt(
      JSON.parse(proof[0].claimData.parameters).paramValues.followers
    );
    if (followerCount == 0) {
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
      `user's address`,
      "for acmecorp.com on 1st january"
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
```

## 3. 구현 과정 설명

### Reclaim Client 초기화

```javascript
const reclaimClient = new Reclaim.ProofRequest(APP_ID);
```

Reclaim Protocol과 상호작용하기 위한 클라이언트를 초기화합니다. `APP_ID`는 아래 주소에서 'New Application' 버튼을 클릭하여 얻을 수 있습니다.
https://dev.reclaimprotocol.org/applications

어플리케이션 생성 과정에서 프로바이더를 추가 할 수 있습니다. 이때 'LinkedIn Equal'를 선택하여 추가해줍니다.

### 클라이언트 설정

```javascript
const setupReclaimClient = async () => {
  await reclaimClient.buildProofRequest(PROVIDER_ID);
  reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
};
```

이 부분은 보안상 서버 측에서 실행되어야 합니다. `APP_SECRET`은 절대 클라이언트에 노출되어서는 안 됩니다.
그러나 이 예시에서는 편의를 위해 클라이언트에서 실행됩니다.

### 증명 요청 생성

```javascript
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
```

이 함수는 증명 요청을 생성하고 QR 코드에 사용될 URL을 설정합니다.

### 세션 시작

```javascript
const startReclaimSession = () => {
  reclaimClient.startSession({
    onSuccessCallback: handleVerificationSuccess,
    onFailureCallback: handleVerificationFailure,
  });
};
```

Reclaim 세션을 시작하고 성공/실패 콜백을 설정합니다.

### 결과 처리

```javascript
const handleVerificationSuccess = (proof) => {
  console.log("Verification success", proof);
  const followerCount = parseInt(
    JSON.parse(proof[0].claimData.parameters).paramValues.followers
  );
  // ... 결과에 따른 처리
};
```

증명 결과를 처리하고 필요한 액션을 수행합니다.

## 4. 주의사항

1. `APP_SECRET`은 반드시 서버 측에서 관리해야 합니다. 이 예제에서는 학습을 위해 클라이언트 측에 포함되어 있지만, 실제 구현에서는 절대 이렇게 하면 안 됩니다.

2. 증명 요청 생성과 서명 과정(`setupReclaimClient`)도 이상적으로는 서버 측에서 처리해야 합니다.

3. 실제 구현에서는 증명 결과의 유효성을 서버 측에서 한 번 더 검증하는 것이 좋습니다.

## 5. 실행 및 테스트

1. `APP_ID`, `APP_SECRET`, `PROVIDER_ID`를 실제 값으로 교체합니다.
2. `npm run dev`로 애플리케이션을 실행합니다.
3. 브라우저에서 `http://localhost:3000`에 접속합니다.
4. "Verify LinkedIn Followers" 버튼을 클릭하고 프로세스를 따릅니다.
