import { IMessage } from "@/models/User";
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?: Array<IMessage>;
}