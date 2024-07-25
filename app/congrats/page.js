"use client";
import React from "react";

const CongratulationsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
          축하합니다!
        </h1>
        <p className="mb-8 text-xl text-white md:text-2xl">
          LinkedIn 팔로워 검증에 성공하셨습니다.
        </p>
        <button
          className="px-6 py-3 mt-8 font-semibold text-blue-600 transition duration-300 bg-white rounded-full shadow-lg hover:bg-blue-100 hover:scale-105 active:scale-95"
          onClick={() =>
            alert("환영합니다! 이제 앱의 모든 기능을 사용하실 수 있습니다.")
          }
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default CongratulationsPage;
