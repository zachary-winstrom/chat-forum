import React, { useEffect } from "react";
import { useForumStore } from "../store/forumStore";

export default function PostList() {
  const { posts, fetchPosts, addReply, name } = useForumStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleReply = async (postId: number) => {
    const content = prompt("Enter your reply:");
    if (content) {
      await addReply(postId, content);
    }
  };

  return (
    <ul className="space-y-4 mt-4">
      {posts.map((post) => (
        <li key={post.id} className="p-4 border rounded">
          <p>{post.content}</p>
          <small className="block text-gray-600">— {post.author}</small>
          <button
            className="btn btn-sm btn-primary mt-2"
            onClick={() => handleReply(post.id)}
            disabled={!name}
          >
            Reply
          </button>
          {post.Reply && post.Reply.length > 0 && (
            <ul className="mt-2 ml-6 space-y-2 border-l pl-2">
              {post.Reply.map((reply) => (
                <li key={reply.id}>
                  <p>{reply.content}</p>
                  <small className="text-gray-600">— {reply.author}</small>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
