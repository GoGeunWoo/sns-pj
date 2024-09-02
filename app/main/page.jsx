"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard from "@/app/components/PostCard";
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
        <h4 className="title">Together Workout</h4>
        <p className="title-sub">다함께 운동하자 {user.displayName}</p>
        <PostCard />
      </main>
    </QueryClientProvider>
  );
}
