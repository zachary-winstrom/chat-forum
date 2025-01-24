import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import PostList from "../PostList";
import { useForumStore } from "../../store/forumStore";

jest.mock("../../store/forumStore", () => ({
  useForumStore: jest.fn(),
}));

describe("PostList Component", () => {
  it("renders no posts", () => {
    (
      useForumStore as jest.MockedFunction<typeof useForumStore>
    ).mockReturnValue({
      posts: [],
      fetchPosts: jest.fn(),
    });
    render(<PostList />);
    expect(screen.queryByText(/Hello World/i)).not.toBeInTheDocument();
  });
});
