// ChatPage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/app/components/AuthContext";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  const { chatId } = router.query; // URL에서 chatId 가져오기

  useEffect(() => {
    if (!chatId || !user) return;

    // Firestore에서 실시간으로 메시지 불러오기
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      senderId: user.uid,
      text: newMessage,
      createdAt: Timestamp.now(),
    });

    setNewMessage(""); // 메시지 전송 후 입력란 초기화
  };

  return (
    <div>
      <h1>채팅</h1>
      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.senderId === user.uid ? "sent" : "received"
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지 입력..."
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default ChatPage;
