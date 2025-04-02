export interface Formatter {
  canHandle(payload: any): boolean;
  format(payload: any): string;
}
