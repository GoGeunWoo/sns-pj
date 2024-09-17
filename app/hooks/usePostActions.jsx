import { updateDoc, deleteDoc, doc } from "firebase/firestore";
import { storage } from "@/firebaseConfig";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export const usePostActions = (postId, userId, postImages) => {
  const editPost = async (newText, newImages) => {
    const postRef = doc(db, "posts", postId);

    const uploadedImages = await Promise.all(
      newImages.map(async (image, index) => {
        if (image.startsWith("data:")) {
          const imageRef = ref(
            storage,
            `posts/${userId}/${Date.now()}_${index}`
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

    const deletedImages = postImages.filter(
      (img) => !uploadedImages.includes(img)
    );
    await Promise.all(
      deletedImages.map((img) => deleteObject(ref(storage, img)))
    );

    await updateDoc(postRef, { text: newText, images: uploadedImages });
  };

  const deletePost = async () => {
    const postRef = doc(db, "posts", postId);
    await Promise.all(postImages.map((img) => deleteObject(ref(storage, img))));
    await deleteDoc(postRef);
  };

  return { editPost, deletePost };
};
