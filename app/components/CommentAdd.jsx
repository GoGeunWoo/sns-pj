import { useState } from "react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/firebaseConfig"; // Your Firebase config
import { useAuth } from "@/app/components/AuthContext"; // Assume AuthContext for user authentication

// Zustand store for comment
const useCommentStore = create((set) => ({
  text: "",
  setText: (text) => set({ text }),
  clearText: () => set({ text: "" }),
}));

const CommentAdd = ({ postId, onClose, onCommentAdd }) => {
  const { text, setText, clearText } = useCommentStore();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Assuming user data comes from AuthContext

  const handleCommentSubmit = async () => {
    if (!text.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 유저의 프로필 정보 가져오기
      const userProfileRef = doc(db, "users", user.uid);
      const userProfileSnap = await getDoc(userProfileRef);

      if (!userProfileSnap.exists()) {
        alert("유저 프로필 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      const userProfile = userProfileSnap.data();

      const newComment = {
        userId: user.uid,
        userNickname: userProfile.nickname || "익명 사용자", // 유저 닉네임
        profileImage: userProfile.profileImage || "/default-avatar.png", // 유저 프로필 이미지
        text,
        createdAt: new Date(),
      };

      // 해당 게시글(postId)에 댓글 추가
      const docRef = await addDoc(
        collection(db, "posts", postId, "comments"),
        newComment
      );

      clearText(); // 댓글 작성 후 텍스트 필드 비우기
      onCommentAdd({ id: docRef.id, ...newComment });
      onClose(); // 모달을 닫음
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
      alert("댓글을 추가하는 데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-1/2 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">댓글 작성하기</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full p-4 border rounded mb-4"
          rows="3"
        />
        <button
          onClick={handleCommentSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "댓글 추가 중..." : "댓글 추가"}
        </button>
      </div>
    </div>
  );
};

export default CommentAdd;
