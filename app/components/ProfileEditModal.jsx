import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/firebaseConfig";
import useStore from "@/app/store";

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.displayName || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [greeting, setGreeting] = useState(user?.greeting || "");
  const [profileImage, setProfileImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let photoURL = user.photoURL;
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL,
      });

      await updateDoc(doc(db, "users", user.uid), {
        nickname,
        greeting,
        photoURL,
      });

      setUser({ ...user, displayName: name, nickname, greeting, photoURL });
      onClose();
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
        />
        <textarea
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          placeholder="인사말"
        />
        <input
          type="file"
          onChange={(e) => setProfileImage(e.target.files[0])}
        />
        <button type="submit">저장</button>
        <button type="button" onClick={onClose}>
          취소
        </button>
      </form>
    </div>
  );
};

export default ProfileEditModal;
