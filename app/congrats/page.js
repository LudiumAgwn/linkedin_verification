"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CongratulationsPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-400 to-purple-500">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
          축하합니다!
        </h1>
        <p className="mb-8 text-xl text-white md:text-2xl">
          LinkedIn 팔로워 검증에 성공하셨습니다.
        </p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        ></motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 mt-8 font-semibold text-blue-600 transition duration-300 bg-white rounded-full shadow-lg hover:bg-blue-100"
          onClick={() =>
            alert("환영합니다! 이제 앱의 모든 기능을 사용하실 수 있습니다.")
          }
        >
          시작하기
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CongratulationsPage;
