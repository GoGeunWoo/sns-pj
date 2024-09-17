import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  limit,
  startAfter,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/app/components/AuthContext";

// 좋아요 아이콘 컴포넌트
const HeartIcon = ({ liked, onClick }) => (
  <svg
    onClick={onClick}
    className={`w-6 h-6 cursor-pointer ${
      liked ? "text-red-500" : "text-gray-700"
    }`}
    fill={liked ? "red" : "none"}
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

// 댓글 아이콘 컴포넌트
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

// 게시글을 가져오는 함수
const fetchPosts = async () => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 게시글 카드 컴포넌트
const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isEditingComment, setIsEditingComment] = useState(null); // 수정 중인 댓글 ID
  const [editedComment, setEditedComment] = useState(""); // 수정된 댓글 내용
  const [isEditingMenuOpen, setIsEditingMenuOpen] = useState(null); // 수정 메뉴 토글
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false); // showModal 상태 정의
  const [editedText, setEditedText] = useState(post.text);
  const [editedImages, setEditedImages] = useState(post.images || []);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAuthor = user && user.uid === post.userId;
  const liked = Array.isArray(post.likes) && post.likes.includes(user?.uid);

  // 댓글 조회 및 무한 스크롤 로딩
  const loadComments = async () => {
    if (!showComments || !hasMoreComments) return;

    setIsLoadingComments(true);
    const commentsRef = collection(db, "posts", post.id, "comments");
    let q = query(commentsRef, orderBy("createdAt", "desc"), limit(20));

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(q);
    const newComments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments((prev) => [...prev, ...newComments]);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setHasMoreComments(newComments.length > 0);
    setIsLoadingComments(false);
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    if (!user) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    try {
      // 유저의 프로필 정보 가져오기
      const userProfileRef = doc(db, "users", user.uid);
      const userProfileSnap = await getDoc(userProfileRef);

      if (!userProfileSnap.exists()) {
        alert("유저 프로필 정보를 찾을 수 없습니다.");
        return;
      }

      const userProfile = userProfileSnap.data();
      const newComment = {
        userId: user.uid,
        userNickname: userProfile.nickname || "익명 사용자", // 유저 닉네임
        profileImage: userProfile.profileImage || "/default-avatar.png", // 유저 프로필 이미지
        text: comment,
        createdAt: new Date(),
      };

      const commentsRef = collection(db, "posts", post.id, "comments");
      const docRef = await addDoc(commentsRef, newComment); // 새 댓글 추가

      // 새 댓글을 기존 댓글 목록에 추가하여 최신화
      setComments((prev) => [{ id: docRef.id, ...newComment }, ...prev]);

      setComment(""); // 입력 필드 초기화
      setLastVisible(null);
      setHasMoreComments(true);
      queryClient.invalidateQueries(["posts"]);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 편집 아이콘 클릭 시 수정/삭제 메뉴 열고 닫기
  const toggleEditMenu = (commentId) => {
    setIsEditingMenuOpen(isEditingMenuOpen === commentId ? null : commentId);
  };

  // 댓글 수정
  // 수정 버튼 클릭 시 수정 모드로 전환
  const handleEditButtonClick = (comment) => {
    setIsEditingComment(comment.id); // 수정 모드로 진입
    setEditedComment(comment.text); // 기존 댓글 내용을 유지
    setIsEditingMenuOpen(null); // 수정/삭제 메뉴 닫기
  };

  // 댓글 수정 완료
  const handleCommentEdit = async (commentId) => {
    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);
      await updateDoc(commentRef, { text: editedComment });

      // 수정된 댓글을 최신화하여 반영
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, text: editedComment }
            : comment
        )
      );

      setIsEditingComment(null); // 수정 모드 해제
      setEditedComment(""); // 입력 필드 초기화
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);
      await deleteDoc(commentRef);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 좋아요 기능 토글
  const handleLikeToggle = async () => {
    if (!user) return;

    try {
      const postRef = doc(db, "posts", post.id);
      if (liked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
      }

      onPostUpdate({
        ...post,
        likes: liked
          ? post.likes.filter((uid) => uid !== user.uid)
          : [...post.likes, user.uid],
      });
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다.", error);
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 기존 게시글 수정 및 삭제 기능
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

      // 삭제된 이미지 처리
      const deletedImages = post.images.filter(
        (img) => !uploadedImages.includes(img)
      );

      // 삭제할 이미지가 존재할 경우 삭제 처리
      await Promise.all(
        deletedImages.map((img) => deleteObject(ref(storage, img)))
      );

      // 게시글 업데이트
      await updateDoc(postRef, {
        text: editedText,
        images: uploadedImages,
      });

      // 업데이트된 게시글을 부모 컴포넌트로 전달
      onPostUpdate({ ...post, text: editedText, images: uploadedImages });
      setShowModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    if (window.confirm("게시글을 삭제하시겠습니까?")) {
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

  const toggleComments = () => setShowComments(!showComments);
  const toggleExpandText = () => setIsExpanded(!isExpanded);

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

      {/* 이미지 섹션 */}
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
            <HeartIcon liked={liked} onClick={handleLikeToggle} />
            <CommentIcon onClick={toggleComments} />
          </div>
        </div>

        <p className="font-semibold text-sm mb-2">
          {Array.isArray(post.likes) ? post.likes.length : 0} likes
        </p>

        <p className="text-sm mb-2">
          <span className="font-semibold mr-2">{post.userNickname}</span>
          {isExpanded ? post.text : post.text.slice(0, 30) + "..."}
          {post.text.length > 50 && (
            <span
              onClick={toggleExpandText}
              className="text-blue-500 cursor-pointer ml-2"
            >
              {isExpanded ? "간략히" : "더보기"}
            </span>
          )}
        </p>

        {/* 댓글 섹션 */}
        {showComments && (
          <div className="relative mt-4 max-h-40 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-start">
                  <Image
                    src={comment.profileImage || "/default-avatar.png"}
                    alt={comment.userNickname || "익명 사용자"}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {comment.userNickname || "익명 사용자"}
                    </p>

                    {/* 수정 모드일 때 텍스트 에디터 표시 */}
                    {isEditingComment === comment.id ? (
                      <>
                        <textarea
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                        />
                        <button
                          onClick={() => handleCommentEdit(comment.id)}
                          className="text-blue-500"
                        >
                          {editedComment !== comment.text
                            ? "수정 완료"
                            : "수정"}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm">{comment.text}</p>
                    )}
                  </div>
                </div>

                {/* 수정/삭제 메뉴 */}
                {(comment.userId === user.uid || isAuthor) && (
                  <div className="relative">
                    <button onClick={() => toggleEditMenu(comment.id)}>
                      <svg
                        className="w-6 h-6 text-gray-500 cursor-pointer"
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

                    {/* 수정/삭제 버튼 */}
                    {isEditingMenuOpen === comment.id && (
                      <div className="absolute right-1 mt-1 w-12 bg-white shadow-lg rounded z-50">
                        <button
                          onClick={() => handleEditButtonClick(comment)}
                          className="text-sm text-gray-500 p-2 block w-full text-right"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("삭제 하시겠습니까?")) {
                              handleCommentDelete(comment.id);
                            }
                          }}
                          className="text-sm text-red-500 p-2 block w-full text-right"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {hasMoreComments && !isLoadingComments && (
              <button onClick={loadComments} className="text-blue-500 text-sm">
                더보기
              </button>
            )}
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
          placeholder="댓글 추가..."
          className="flex-grow text-sm focus:outline-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="text-blue-500 font-semibold text-sm ml-4 focus:outline-none"
          disabled={!comment.trim()}
        >
          게시
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">게시글 수정하기</h2>
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
                게시글 삭제
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

// 게시글 피드 컴포넌트
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

// 650줄~~
