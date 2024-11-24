export interface ActionResponse<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}
