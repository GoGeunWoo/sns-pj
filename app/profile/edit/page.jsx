"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import useStore from "@/app/store";

const EditProfile = () => {
  const router = useRouter();
  const { profileImage, greeting, setProfileImage, setGreeting } = useStore();
  const [error, setError] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const user = auth.currentUser;

      await updateDoc(doc(db, "users", user.uid), {
        profileImage,
        greeting,
      });

      router.push(`/users/${user.uid}`); // 프로필 페이지로 이동
    } catch (err) {
      setError("프로필 업데이트 실패: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-zinc-500 shadow-md rounded-lg mx-4 sm:mx-auto">
        <h1 className="text-2xl font-bold mb-6">프로필 설정</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleUpdateProfile}>
          {/* 프로필 이미지 URL 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              프로필 이미지 URL
            </label>
            <input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          {/* 인사말 필드 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">인사말</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded"
          >
            저장
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
