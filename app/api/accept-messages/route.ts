import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbToConnect from "@/lib/db";
import User from "@/models/User";
import { User as NextAuthUser } from "next-auth";

export async function POST(req: Request) {
    await dbToConnect();
    const session = await getServerSession(authOptions);

    const user: NextAuthUser = session?.user as NextAuthUser;

    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = user._id;
    const { isAcceptingMessage } = await req.json();

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { isAcceptingMessage }, { new: true });
        if (!updatedUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({ success: true, message: "User isAcceptingMessage updated successfully", updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user isAcceptingMessage:", error);
        return Response.json({ success: false, message: "Error updating user isAcceptingMessage" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbToConnect();
    const session = await getServerSession(authOptions);

    const user: NextAuthUser = session?.user as NextAuthUser;

    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({ success: true, message: "User isAcceptingMessage fetched successfully", isAcceptingMessage: user.isAcceptingMessage }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user isAcceptingMessage:", error);
        return Response.json({ success: false, message: "Error fetching user isAcceptingMessage" }, { status: 500 });
    }
}


