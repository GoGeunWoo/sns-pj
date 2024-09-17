import { useState, useEffect } from "react";
import { updateProfile, onAuthStateChanged } from "firebase/auth"; // Firebase 인증 상태 변경 감지
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Firestore에서 유저 데이터 가져오기
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/firebaseConfig";
import useStore from "@/app/store"; // zustand 상태 관리

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useStore();
  const [name, setName] = useState(""); // 기본값을 비워둠
  const [nickname, setNickname] = useState("");
  const [greeting, setGreeting] = useState("");
  const [profileImage, setProfileImage] = useState(null); // 이미지 파일을 선택하는 필드
  const [profileImageUrl, setProfileImageUrl] = useState(""); // 기존 프로필 이미지를 보여주기 위한 URL 필드
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태를 기본적으로 true로 설정

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.uid) {
        // Firebase 인증 상태 체크
        onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                uid: currentUser.uid,
                ...userData,
              });
              setName(userData.name || "");
              setNickname(userData.nickname || "");
              setGreeting(userData.greeting || "");
              setProfileImageUrl(userData.profileImage || "");
            }
          }
          setIsLoading(false); // 유저 데이터를 성공적으로 로드한 후 로딩 상태를 false로 설정
        });
      } else {
        // 이미 유저 데이터가 있는 경우
        setName(user.name || "");
        setNickname(user.nickname || "");
        setGreeting(user.greeting || "");
        setProfileImageUrl(user.profileImage || "");
        setIsLoading(false); // 유저 데이터를 이미 로드한 경우 로딩 종료
      }
    };

    fetchUserData();
  }, [user, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user || !user.uid) {
      setError("유저 정보가 올바르지 않습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      setIsLoading(true); // 로딩 상태 시작
      let updatedProfileImageUrl = profileImageUrl; // 기존 이미지 URL 사용
      if (profileImage) {
        // 새로운 프로필 이미지가 선택된 경우 Firebase Storage에 업로드
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        updatedProfileImageUrl = await getDownloadURL(imageRef);
      }

      // Firebase auth 업데이트 (name, photoURL)
      await updateProfile(auth.currentUser, {
        displayName: name || user.name,
        photoURL: updatedProfileImageUrl,
      });

      // Firestore 업데이트 (nickname, greeting, profileImage)
      await updateDoc(doc(db, "users", user.uid), {
        name: name || user.name,
        nickname: nickname || user.nickname,
        greeting: greeting || user.greeting,
        profileImage: updatedProfileImageUrl || user.profileImage,
      });

      // 상태 업데이트
      setUser({
        ...user,
        name: name || user.name,
        nickname: nickname || user.nickname,
        greeting: greeting || user.greeting,
        profileImage: updatedProfileImageUrl || user.profileImage,
      });

      setSuccess("프로필이 성공적으로 업데이트되었습니다.");
      onClose(); // 모달 닫기

      // 페이지 새로고침
      window.location.reload(); // 프로필 수정 후 자동으로 새로고침
    } catch (error) {
      setError("프로필 업데이트 실패: " + error.message);
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return <div className="text-center">로딩 중...</div>; // 로딩 상태일 때 메시지 표시
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-full max-w-md p-8 bg-zinc-500 shadow-md rounded-lg mx-4 sm:mx-auto">
        <h1 className="text-2xl font-bold mb-6">프로필 편집</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
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
          {/* 인사말 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">인사말</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black placeholder-gray-500"
              placeholder="인사말을 입력하세요"
            />
          </div>
          {/* 기존 프로필 이미지 표시 및 프로필 사진 업로드 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">프로필 사진</label>
            {profileImageUrl && (
              <img
                src={profileImageUrl}
                alt="프로필 이미지"
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <input
              type="file"
              onChange={(e) => setProfileImage(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/*"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full bg-gray-900 text-white p-2 rounded"
              disabled={isLoading} // 로딩 중에는 버튼 비활성화
            >
              {isLoading ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-red-500 text-white p-2 rounded"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
