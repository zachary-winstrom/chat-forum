import React, { useState, useEffect } from "react";
import PostList from "../components/PostList";
import { useForumStore } from "../store/forumStore";

export default function Home() {
  const { name, setName, addPost } = useForumStore();
  const [content, setContent] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, [setName]);

  const handlePost = async () => {
    if (!name) {
      alert("Please set your name first.");
      return;
    }
    await addPost(content);
    setContent("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Chat Forum</h1>
      {!name && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="input input-bordered w-full max-w-xs"
            onBlur={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <textarea
          className="textarea textarea-bordered w-full max-w-lg"
          placeholder="Say something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handlePost}>
          Post
        </button>
      </div>
      <PostList />
    </div>
  );
}
