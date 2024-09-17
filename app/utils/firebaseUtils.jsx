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

// 게시글 가져오기
export const fetchPosts = async () => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// 댓글 불러오기
export const loadComments = async (postId, lastVisible) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  let q = query(commentsRef, orderBy("createdAt", "desc"), limit(20));

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(q);
  const newComments = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    newComments,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
  };
};

// 좋아요 토글
export const toggleLike = async (postId, userId, liked) => {
  const postRef = doc(db, "posts", postId);
  if (liked) {
    await updateDoc(postRef, { likes: arrayRemove(userId) });
  } else {
    await updateDoc(postRef, { likes: arrayUnion(userId) });
  }
};
