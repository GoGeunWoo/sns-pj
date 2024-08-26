import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative h-screen">
      <Image
        src="/background-image.jpg"
        layout="fill"
        objectFit="cover"
        alt="Background"
      />
      <div className="absolute inset-0 bg-black bg-opacity-60">
        <div className="flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-5xl font-bold mb-4">Together Workout</h1>
          <p className="text-xl mb-8">다함께 운동하자</p>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}