export type MessageType =
  | "PUSH"
  | "ISSUE"
  | "MERGE_REQUEST"
  | "COMMENT"
  | "PULL_REQUEST_REVIEW";

export interface MessageFormatResult<T = any> {
  type: MessageType;
  data: T;
}
