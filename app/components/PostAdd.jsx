import { useState } from "react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { create } from "zustand";
import { db, storage } from "@/firebaseConfig";

const usePostStore = create((set) => ({
  text: "",
  images: [],
  setText: (text) => set({ text }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),
  clearImages: () => set({ images: [] }),
}));

const PostAdd = ({ onClose, userId, onPostAdd }) => {
  const { text, images, setText, addImage, removeImage, clearImages } =
    usePostStore();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files.length + images.length <= 5) {
      Array.from(e.target.files).forEach((file) => {
        const objectURL = URL.createObjectURL(file);
        addImage(objectURL);
      });
    } else {
      alert("최대 5장까지 이미지를 업로드할 수 있습니다.");
    }
  };

  const uploadImage = async (image, index) => {
    const response = await fetch(image);
    const blob = await response.blob();
    const fileRef = ref(storage, `posts/${userId}/${Date.now()}_${index}`);

    const metadata = {
      contentType: blob.type,
    };

    const snapshot = await uploadBytes(fileRef, blob, metadata);
    return getDownloadURL(snapshot.ref);
  };

  const handlePostSubmit = async () => {
    if (!text.trim() && images.length === 0) {
      alert("내용 또는 이미지를 추가해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 유저의 프로필 정보 가져오기
      const userProfileRef = doc(db, "users", userId);
      const userProfileSnap = await getDoc(userProfileRef);

      if (!userProfileSnap.exists()) {
        alert("유저 프로필 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      const userProfile = userProfileSnap.data();

      const uploadedImages = await Promise.all(
        images.map((image, index) => uploadImage(image, index))
      );

      const newPost = {
        userId,
        userNickname: userProfile.nickname, // 유저 닉네임
        profileImage: userProfile.profileImage, // 유저 프로필 이미지
        text,
        images: uploadedImages,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "posts"), newPost);

      setText("");
      clearImages();
      onPostAdd({ id: docRef.id, ...newPost });
      onClose();
    } catch (error) {
      console.error("게시글 추가 중 오류 발생:", error);
      alert("게시글을 추가하는 데 실패했습니다. 다시 시도해주세요.");
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
        <h2 className="text-xl font-bold mb-4">게시글 작성하기</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="게시글 내용을 입력하세요..."
          className="w-full p-4 border rounded mb-4"
          rows="4"
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="border p-2 mb-4"
          accept="image/*"
          multiple
          disabled={images.length >= 5}
        />
        <div className="grid grid-cols-5 gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`preview-${index}`}
                className="w-full h-auto rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 text-white bg-red-600 rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handlePostSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "게시글 추가 중..." : "게시글 추가"}
        </button>
      </div>
    </div>
  );
};

export default PostAdd;
