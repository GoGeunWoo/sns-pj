import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/app/utils/firebaseUtils";
import PostCard from "@/app/components/PostCard"; // PostCard 컴포넌트 임포트

const PostFeed = ({ onPostClick }) => {
  // onPostClick prop 추가
  const [posts, setPosts] = useState([]);

  const {
    data: fetchedPosts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

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
          onClick={() => onPostClick(post)} // 클릭 시 부모로 게시글 전달
        />
      ))}
    </div>
  );
};

export default PostFeed;
