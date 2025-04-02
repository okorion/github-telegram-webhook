export type MessageType = "PUSH" | "ISSUE" | "MERGE_REQUEST" | "COMMENT";

export interface MessageFormatResult<T = any> {
  type: MessageType;
  data: T;
}
