"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useParams } from "next/navigation";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        router.push("/login"); // 유저가 없을 경우 홈으로 리디렉션
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) return <p>로딩 중...</p>;

  return (
    <div className="justify-center items-center min-h-screen">
      <div className="w-full md:w-4/5 mx-auto p-4 md:p-8 bg-zinc-500 shadow-md rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <img
              src={user.profileImage}
              alt="프로필 이미지"
              className="w-24 h-24 rounded-full"
            />
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{user.name}의 프로필</h1>
              <p className="text-sm font-bold">닉네임: {user.nickname}</p>
              <p className="text-sm font-bold">이메일: {user.email}</p>
              <p className="text-sm font-bold">인사말: {user.greeting}</p>
            </div>
          </div>
          <button className="mt-4 md:mt-0 text-white px-4 py-2 rounded">
            프로필 편집
          </button>
        </div>

        <div className="flex justify-evenly space-x-8 mt-6">
          <p className="text-lg font-bold">게시물 5</p>
          <p className="text-lg font-bold">팔로워 81</p>
          <p className="text-lg font-bold">팔로우 129</p>
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="box-content p-4 border-4">1-1</div>
        <div className="box-content p-4 border-4">1-2</div>
        <div className="box-content p-4 border-4">1-3</div>
        <div className="box-content p-4 border-4">1-4</div>
        <div className="box-content p-4 border-4">2-1</div>
        <div className="box-content p-4 border-4">2-2</div>
        <div className="box-content p-4 border-4">2-3</div>
        <div className="box-content p-4 border-4">2-4</div>
      </div>
    </div>
  );
};

export default UserProfile;
