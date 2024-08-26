import create from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  nickname: "",
  profileImage: "",
  greeting: "",
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
