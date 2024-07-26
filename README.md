# Reclaim Protocol을 이용한 LinkedIn 팔로워 확인 구현 가이드

이 가이드는 Reclaim Protocol을 사용하여 LinkedIn 팔로워 수를 확인하는 프로세스를 구현하는 방법에 초점을 맞춥니다. Next.js와 React 관련 기본 지식은 이미 있다고 가정하고, Reclaim Protocol의 핵심 개념과 사용 방법을 설명하겠습니다.

## 1. Reclaim Protocol 소개

Reclaim Protocol은 사용자의 개인 데이터에 대한 증명을 안전하게 생성하고 검증할 수 있게 해주는 프로토콜입니다. 이 프로토콜을 통해 사용자는 자신의 데이터를 직접 공유하지 않고도 특정 조건을 만족함을 증명할 수 있습니다.

## 2. Reclaim SDK 설정

먼저 Reclaim SDK를 설치합니다:

```bash
npm install @reclaimprotocol/js-sdk
```

그리고 SDK를 초기화합니다:

```javascript
import { Reclaim } from "@reclaimprotocol/js-sdk";

const APP_ID = "YOUR_APP_ID";
const reclaimClient = new Reclaim.ProofRequest(APP_ID);
```

`APP_ID`는 Reclaim 대시보드에서 얻을 수 있습니다. 이 ID는 당신의 애플리케이션을 식별하는 데 사용됩니다.

## 3. 증명 요청 생성

LinkedIn 팔로워 수 확인을 위한 증명 요청을 생성합니다:

```javascript
const PROVIDER_ID = "YOUR_PROVIDER_ID"; // LinkedIn Equal Provider ID

const setupReclaimClient = async () => {
  await reclaimClient.buildProofRequest(PROVIDER_ID);
  reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
};
```

`PROVIDER_ID`는 LinkedIn 팔로워 수를 확인할 수 있는 특정 데이터 제공자를 식별합니다. `buildProofRequest` 메소드는 이 제공자에 대한 증명 요청을 구성합니다.

`setSignature` 메소드는 요청에 서명을 추가하여 요청의 진실성을 보장합니다. `APP_SECRET`은 애플리케이션의 비밀 키로, 절대 공개되어서는 안 됩니다.

## 4. 컨텍스트 추가

요청에 컨텍스트를 추가하여 증명의 목적과 범위를 명확히 할 수 있습니다:

```javascript
reclaimClient.addContext(
  `user's linkedin follower count`,
  "for Road To Global, ludium and namulabs"
);
```

이 컨텍스트는 증명 요청의 목적을 명시하며, 사용자에게 표시될 수 있습니다.

## 5. 증명 세션 시작

증명 세션을 시작하고 결과를 처리하는 콜백을 설정합니다:

```javascript
const startReclaimSession = () => {
  reclaimClient.startSession({
    onSuccessCallback: handleVerificationSuccess,
    onFailureCallback: handleVerificationFailure,
  });
};
```

`startSession` 메소드는 증명 프로세스를 시작합니다. 성공 및 실패 콜백을 제공하여 결과를 처리할 수 있습니다.

## 6. 증명 결과 처리

증명 성공 시 결과를 처리합니다:

```javascript
const handleVerificationSuccess = (proof) => {
  console.log("Verification success", proof);
  const followerCount = parseInt(
    JSON.parse(proof[0].claimData.parameters).paramValues.followers
  );
  if (followerCount >= 10) {
    // 접근 허용
  } else {
    // 접근 거부
  }
};
```

`proof` 객체에는 LinkedIn 팔로워 수에 대한 검증된 정보가 포함되어 있습니다. 이 정보를 파싱하여 필요한 조건(예: 10명 이상의 팔로워)을 만족하는지 확인할 수 있습니다.

## 7. 모바일과 데스크톱 환경 대응

Reclaim Protocol은 모바일과 데스크톱 환경에서 다르게 동작합니다:

```javascript
const handleVerifyClick = () => {
  if (isMobile) {
    getVerificationReq();
  } else {
    generateVerificationRequest();
  }
};

const getVerificationReq = async () => {
  await setupReclaimClient();
  const { requestUrl } = await reclaimClient.createVerificationRequest();
  window.open(requestUrl, "_blank");
};

const generateVerificationRequest = async () => {
  await setupReclaimClient();
  const { requestUrl } = await reclaimClient.createVerificationRequest();
  setUrl(requestUrl); // QR 코드 생성을 위해 URL 저장
};
```

모바일에서는 직접 새 창에서 인증 프로세스를 열고, 데스크톱에서는 QR 코드를 생성하여 모바일 기기로 스캔할 수 있게 합니다.
