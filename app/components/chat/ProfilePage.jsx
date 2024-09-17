// ProfilePage.jsx
import { useRouter } from "next/router";
import { db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/app/components/AuthContext";

const ProfilePage = ({ profileUser }) => {
  const router = useRouter();
  const { user } = useAuth();

  const startChat = async () => {
    if (!user) {
      return alert("로그인 후 채팅을 시작할 수 있습니다.");
    }

    // 새로운 채팅 생성 또는 기존 채팅 열기
    const chatId = [user.uid, profileUser.uid].sort().join("_"); // 채팅 ID는 두 유저의 ID를 조합해 만듦

    const chatRef = doc(db, "chats", chatId);
    await setDoc(
      chatRef,
      {
        users: [user.uid, profileUser.uid],
        createdAt: new Date(),
      },
      { merge: true }
    );

    // 채팅 페이지로 이동
    router.push(`/chat/${chatId}`);
  };

  return (
    <div>
      <h1>{profileUser.name}의 프로필</h1>
      <button onClick={startChat}>1:1 채팅 시작</button>
    </div>
  );
};

export default ProfilePage;
