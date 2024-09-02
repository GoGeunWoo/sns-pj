"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useParams } from "next/navigation";
import PostAdd from "@/app/components/PostAdd";
import PostDetail from "@/app/components/PostDetail"; // 추가된 임포트

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시글 상태
  const router = useRouter();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        router.push("/login");
      }
    };

    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(
          postsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const userPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched posts:", userPosts);

        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchUser();
    fetchPosts();
  }, [userId]);

  const handlePostAdd = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleModalClose = () => {
    setSelectedPost(null);
  };

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
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="mt-4 md:mt-0 text-white px-4 py-2 rounded bg-blue-500"
          >
            게시글 작성하기
          </button>
        </div>

        <div className="flex justify-evenly space-x-8 mt-6">
          <p className="text-lg font-bold">게시물 {posts.length}</p>
          <p className="text-lg font-bold">팔로워 81</p>
          <p className="text-lg font-bold">팔로우 129</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
        {posts.map((post) => (
          <div
            key={post.id}
            className="box-content p-4 border-2 bg-white flex flex-col justify-between items-center cursor-pointer"
            style={{
              width: "250px",
              height: "250px",
              gap: "10px",
              overflow: "hidden",
            }}
            onClick={() => handlePostClick(post)} // 클릭 이벤트 핸들러 추가
          >
            {post.images && post.images.length > 0 ? (
              <img
                src={post.images[0]}
                alt="게시글 이미지"
                className="w-full h-full object-cover rounded-md mb-2"
              />
            ) : (
              <p
                className="text-gray-800"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {post.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {isPostModalOpen && (
        <PostAdd
          onClose={() => setIsPostModalOpen(false)}
          userId={userId}
          onPostAdd={handlePostAdd}
        />
      )}

      {selectedPost && (
        <PostDetail post={selectedPost} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default UserProfile;
