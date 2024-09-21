import { create } from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  nickname: "",
  profileImage: "",
  greeting: "",
  user: null, // 초기 user 상태
  setUser: (newUser) => set({ user: newUser }), // user 상태 업데이트 함수
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setName: (name) => set({ name }),
  setNickname: (nickname) => set({ nickname }),
  setProfileImage: (profileImage) => set({ profileImage }),
  setGreeting: (greeting) => set({ greeting }),
  resetUserInfo: () =>
    set({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      nickname: "",
      profileImage: "",
      greeting: "",
    }),
}));

export default useStore;
