import type { Meta, StoryObj } from "@storybook/react";
import PostList from "./PostList";
import { useForumStore } from "../store/forumStore";

const meta: Meta<typeof PostList> = {
  title: "Components/PostList",
  component: PostList,
};
export default meta;

export const Default: StoryObj<typeof PostList> = {
  render: () => {
    useForumStore.setState({
      posts: [{ id: 1, content: "Hello World", author: "Alice", Reply: [] }],
    });
    return <PostList />;
  },
};
