import { create } from "zustand";

type Post = {
  id: number;
  content: string;
  author: string;
  createdAt?: string;
  Reply?: Reply[];
};

type Reply = {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt?: string;
};

interface ForumState {
  name: string;
  setName: (name: string) => void;
  posts: Post[];
  fetchPosts: () => Promise<void>;
  addPost: (content: string) => Promise<void>;
  addReply: (postId: number, content: string) => Promise<void>;
}

export const useForumStore = create<ForumState>((set, get) => ({
  name: "",
  setName: (name) => set({ name }),
  posts: [],
  fetchPosts: async () => {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    set({ posts });
  },
  addPost: async (content) => {
    const name = get().name;
    if (!name) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: name }),
    });
    get().fetchPosts();
  },
  addReply: async (postId, content) => {
    const name = get().name;
    if (!name) return;
    await fetch(`/api/posts/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: name }),
    });
    get().fetchPosts();
  },
}));
