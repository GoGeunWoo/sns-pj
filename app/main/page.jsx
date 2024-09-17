"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostFeed from "@/app/components/PostFeed"; // PostFeed 컴포넌트로 변경
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const queryClient = new QueryClient();

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        {/* PostCard 대신 PostFeed로 게시물 리스트 렌더링 */}
        <PostFeed />
      </main>
    </QueryClientProvider>
  );
}
