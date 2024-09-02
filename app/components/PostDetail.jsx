import React from "react";
import Image from "next/image";

const PostDetail = ({ post, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick} // 오버레이 클릭으로 모달 닫기
    >
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full relative flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          &times;
        </button>

        {/* 이미지가 있을 경우에만 표시, 고정 크기 500x500 */}
        {post.images && post.images.length > 0 && (
          <div className="w-300px h-300px relative">
            <Image
              src={post.images[0] || "https://via.placeholder.com/500"}
              alt="Post image"
              width={500}
              height={500}
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>
        )}

        <div
          className={`p-4 flex flex-col justify-between ${
            post.images && post.images.length > 0 ? "w-1/2" : "w-full"
          }`}
        >
          <div>
            <div className="flex items-center mb-4">
              <Image
                src={post.profileImage || "/default-avatar.png"}
                alt={post.userNickname}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <p className="font-semibold text-sm">{post.userNickname}</p>
              </div>
            </div>

            <p className="text-sm mb-4">{post.text}</p>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt.seconds * 1000).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
