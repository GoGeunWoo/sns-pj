import { useState } from "react";
import { loadComments } from "@/app/utils/firebaseUtils";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const loadMoreComments = async () => {
    if (!hasMoreComments) return;

    const { newComments, lastVisible: newLastVisible } = await loadComments(
      postId,
      lastVisible
    );
    setComments((prev) => [...prev, ...newComments]);
    setLastVisible(newLastVisible);
    setHasMoreComments(newComments.length > 0);
  };

  const addComment = async (commentData) => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const docRef = await addDoc(commentsRef, commentData);
    setComments((prev) => [{ id: docRef.id, ...commentData }, ...prev]);
  };

  const editComment = async (commentId, newText) => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentRef, { text: newText });
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, text: newText } : comment
      )
    );
  };

  const deleteComment = async (commentId) => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await deleteDoc(commentRef);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return {
    comments,
    loadMoreComments,
    addComment,
    editComment,
    deleteComment,
    hasMoreComments,
  };
};
