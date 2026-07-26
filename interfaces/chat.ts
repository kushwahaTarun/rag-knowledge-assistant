export interface Message{
    role: string;
    content: string;
}

export interface chatFormState{
    error: string,
    chats: Message[],
}