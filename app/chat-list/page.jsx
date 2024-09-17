// ChatListPage.jsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/app/components/AuthContext";
import Link from "next/link";

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("users", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(loadedChats);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <h1>채팅 목록</h1>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link href={`/chat/${chat.id}`}>채팅방 {chat.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatListPage;
