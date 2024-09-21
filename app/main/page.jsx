"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostFeed from "@/app/components/PostFeed";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PostDetail from "@/app/components/PostDetail"; // 게시글 모달 컴포넌트 추가

const queryClient = new QueryClient();

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시글 상태 추가

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        Please log in to view this page. <Link href="/login">Log in</Link>
      </div>
    );
  }

  // 게시글 클릭 시 모달을 열기 위한 함수
  const handlePostClick = (post) => {
    setSelectedPost(post); // 선택한 게시글을 설정하여 모달 열기
  };

  // 모달 닫기 함수
  const handleModalClose = () => {
    setSelectedPost(null); // 모달 닫을 때 선택된 게시글 초기화
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        {/* PostFeed에 handlePostClick 전달 */}
        <PostFeed onPostClick={handlePostClick} />

        {/* 선택된 게시글이 있을 때만 PostDetail 모달을 렌더링 */}
        {selectedPost && (
          <PostDetail post={selectedPost} onClose={handleModalClose} />
        )}
      </main>
    </QueryClientProvider>
  );
}
