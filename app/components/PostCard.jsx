import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/firebaseConfig";
import { useAuth } from "@/app/components/AuthContext";

// SVG icons
const HeartIcon = () => (
  <svg
    className="w-6 h-6 text-gray-700 cursor-pointer"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const CommentIcon = ({ onClick }) => (
  <svg
    className="w-6 h-6 text-gray-700 cursor-pointer"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-6 h-6 text-gray-700 cursor-pointer"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const fetchPosts = async () => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedText, setEditedText] = useState(post.text);
  const [editedImages, setEditedImages] = useState(post.images || []);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const toggleComments = () => setShowComments(!showComments);
  const toggleExpandText = () => setIsExpanded(!isExpanded);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    setComment("");
  };

  const isAuthor = user && user.uid === post.userId;

  const handleEdit = async () => {
    if (!isAuthor) return;

    try {
      const postRef = doc(db, "posts", post.id);

      const uploadedImages = await Promise.all(
        editedImages.map(async (image, index) => {
          if (image.startsWith("data:")) {
            const imageRef = ref(
              storage,
              `posts/${post.userId}/${Date.now()}_${index}`
            );
            const snapshot = await uploadBytes(
              imageRef,
              await fetch(image).then((r) => r.blob())
            );
            return getDownloadURL(snapshot.ref);
          }
          return image;
        })
      );

      const deletedImages = post.images.filter(
        (img) => !uploadedImages.includes(img)
      );
      await Promise.all(
        deletedImages.map((img) => deleteObject(ref(storage, img)))
      );

      await updateDoc(postRef, {
        text: editedText,
        images: uploadedImages,
      });

      onPostUpdate({ ...post, text: editedText, images: uploadedImages });
      setShowModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update the post. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await Promise.all(
          post.images.map((img) => deleteObject(ref(storage, img)))
        );
        await deleteDoc(doc(db, "posts", post.id));
        onPostDelete(post.id);
        setShowModal(false);
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post. Please try again.");
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isTextLong = post.text.length > 50;
  const truncatedText = isTextLong ? post.text.slice(0, 30) + "..." : post.text;

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 max-w-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
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
        {isAuthor && (
          <button
            className="focus:outline-none"
            onClick={() => setShowModal(true)}
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Conditionally render the image section */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <Image
            src={post.images[0] || "https://via.placeholder.com/500"}
            alt="Post image"
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <HeartIcon />
            <CommentIcon onClick={toggleComments} />
            <SendIcon />
          </div>
        </div>

        <p className="font-semibold text-sm mb-2">{post.likes} likes</p>

        <p className="text-sm mb-2">
          <span className="font-semibold mr-2">{post.userNickname}</span>
          {isExpanded ? post.text : truncatedText}
          {isTextLong && (
            <span
              onClick={toggleExpandText}
              className="text-blue-500 cursor-pointer ml-2"
            >
              {isExpanded ? "간략히" : "더보기"}
            </span>
          )}
        </p>

        {showComments && (
          <div className="mt-4 max-h-40 overflow-y-auto">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex items-start mb-2">
                <Image
                  src={comment.profileImage || "/default-avatar.png"}
                  alt={comment.userName}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <p className="text-sm">
                  <span className="font-semibold mr-2">
                    {comment.userNickname}
                  </span>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          {new Date(post.createdAt.seconds * 1000).toLocaleString()}
        </p>
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center border-t p-4"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-grow text-sm focus:outline-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="text-blue-500 font-semibold text-sm ml-4 focus:outline-none"
          disabled={!comment.trim()}
        >
          Post
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows="4"
            />
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              className="mb-4"
            />
            <div className="flex flex-wrap mb-4">
              {editedImages.map((img, index) => (
                <div key={index} className="relative w-20 h-20 m-1">
                  <Image
                    src={img}
                    alt={`Image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                삭제
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PostFeed() {
  const [posts, setPosts] = useState([]);

  const {
    data: fetchedPosts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  React.useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts</div>;

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
