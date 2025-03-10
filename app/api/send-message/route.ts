import dbToConnect from "@/lib/db";
import User from "@/models/User";
import { IMessage } from "@/models/User";

export async function POST(req: Request) {
    await dbToConnect();

    const { username, content } = await req.json();

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (!user.isAcceptingMessage) {
            return Response.json({ success: false, message: "User is not accepting messages" }, { status: 403 });
        }

        const newMessage = {
            content,
            createdAt: new Date(),
        }

        user.message.push(newMessage as IMessage);
        await user.save();

        return Response.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message:", error);
        return Response.json({ success: false, message: "Error sending message" }, { status: 500 });
    }
}
