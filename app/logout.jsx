"use client";

import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white p-2 rounded"
    >
      로그아웃
    </button>
  );
};

export default LogoutButton;
