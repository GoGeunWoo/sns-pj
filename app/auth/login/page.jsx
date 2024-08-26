"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/firebaseConfig";
import useStore from "@/app/store";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const { email, password, setEmail, setPassword, setUser, resetUserInfo } =
    useStore();
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/main");
    } catch (err) {
      setError("로그인 실패: " + err.message);
    }
  };

  //구글 로그인
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      resetUserInfo();
      router.push("/main");
    } catch (error) {
      setError("Google 로그인 실패: " + error.message);
    }
  };

  //애플 로그인
  const handleAppleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      setUser(result.user);
      resetUserInfo();
      router.push("/main");
    } catch (error) {
      setError("Apple 로그인 실패: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md w-full p-8 bg-zinc-500 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold">로그인</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded"
          >
            로그인
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white p-2 rounded mt-2"
          >
            Google로 로그인
          </button>
          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full bg-black text-white p-2 rounded mt-2"
          >
            Apple로 로그인
          </button>
          <div className="flex justify-between w-48 mt-5 text-xs text-gray-200">
            <p>아이디/비밀번호 찾기</p>
            <Link href="/auth/signup">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
