export const dummy = {
  pushPayload: {
    ref: "refs/heads/main",
    pusher: {
      name: "wilddogco",
    },
    commits: [
      {
        message: "feat: 새로운 기능 추가",
        url: "https://github.com/your-repo/commit/abc123",
      },
      {
        message: "fix: 버그 수정",
        url: "https://github.com/your-repo/commit/def456",
      },
    ],
  },
  issuePayload: {
    action: "Opened",
    issue: {
      number: 456,
      title: "로그인 오류 발생",
      html_url: "https://github.com/your-repo/issues/456",
      user: { login: "Jian-Buk" },
    },
  },
  commentPayload: {
    comment: {
      body: "동일 현상 확인했습니다.",
      html_url: "https://github.com/your-repo/issues/456#issuecomment-7890",
    },
    issue: {
      title: "로그인 오류 발생",
    },
    user: {
      name: "Joong-Rainy",
    },
  },
  pullRequestPayload: {
    action: "opened", // ALLOWED_ACTIONS: ["opened", "closed", "synchronize", "ready_for_review", "review_requested", "edited"]
    number: 123,
    pull_request: {
      title: "로그인 기능 추가",
      user: { login: "Joong-Rainy" },
      base: { ref: "main" },
      head: { ref: "feature/login" },
      html_url: "https://github.com/your-repo/pull/123",
    },
  },
  pullRequestReviewPayload: {
    action: "submitted",
    review: {
      user: { login: "Bingho" },
      state: "approved",
      body: "Looks good to me!",
      html_url: "https://github.com/your-repo/pull/123#pullrequestreview-7890",
    },
    pull_request: {
      number: 123,
      title: "로그인 기능 추가",
    },
  },
};
