import React, { useState, useEffect } from "react";
import PostCard from "@/app/components/PostCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/app/utils/firebaseUtils";

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const {
    data: fetchedPosts,
    error,
    isLoading,
  } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

  useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>게시글을 불러오는 중 오류가 발생했습니다.</div>;

  return (
    <div className="max-width-md mx-auto mt-8">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostUpdate={(updatedPost) =>
            setPosts((prev) =>
              prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
            )
          }
          onPostDelete={(deletedPostId) =>
            setPosts((prev) => prev.filter((p) => p.id !== deletedPostId))
          }
        />
      ))}
    </div>
  );
}
