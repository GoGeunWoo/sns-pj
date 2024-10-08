"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useStore from "@/app/store"; // zustand를 통한 상태 관리

const Signup = () => {
  const router = useRouter();
  const {
    email,
    password,
    confirmPassword,
    setEmail,
    setPassword,
    setConfirmPassword,
    name,
    setName,
    nickname,
    setNickname,
  } = useStore();
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [greeting, setGreeting] = useState("");

  const defaultProfileImage = "https://example.com/default-profile-image.png";
  const defaultGreeting = "안녕하세요! 인사말을 설정해주세요.";

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const easyPatterns = ["1234", "abcd", "qwerty", "password"];
    const isCommonPattern = easyPatterns.some((pattern) =>
      password.includes(pattern)
    );
    return (
      !isCommonPattern && passwordRegex.test(password) && password.length >= 10
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError(
        "비밀번호는 최소 8자리 이상이며, 문자, 숫자, 특수문자를 포함하고 쉬운 패턴을 포함하지 않아야 합니다."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let profileImageUrl = defaultProfileImage;
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        nickname,
        profileImage: profileImageUrl,
        greeting: greeting || defaultGreeting,
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError("회원가입 실패: " + err.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-zinc-500 shadow-md rounded-lg mx-4 sm:mx-auto">
        <h1 className="text-2xl font-bold mb-6">회원가입</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
          {/* 이름 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          {/* 닉네임 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          {/* 이메일 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          {/* 비밀번호 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          {/* 비밀번호 확인 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          {/* 프로필 사진 (선택사항) */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              프로필 사진 (선택사항)
            </label>
            <input
              type="file"
              onChange={(e) => setProfileImage(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/*"
            />
          </div>
          {/* 인사말 (선택사항) */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              인사말 (선택사항)
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="인사말을 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
