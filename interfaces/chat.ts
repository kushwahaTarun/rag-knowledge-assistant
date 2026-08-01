export interface Message {
  role: string;
  content: string;
  createdAt?: number;
}

export interface chatFormState {
  error: string;
  chats: Message[];
}
