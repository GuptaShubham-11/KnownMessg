import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbToConnect from "@/lib/db";
import User from "@/models/User";
import { User as NextAuthUser } from "next-auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await dbToConnect();
    const session = await getServerSession(authOptions);

    const user: NextAuthUser = session?.user as NextAuthUser;

    if (!session || !session.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const userMessages = await User.aggregate([
            {
                $match: {
                    _id: userId
                }
            },
            {
                $unwind: "$messages"
            },
            {
                $sort: {
                    "messages.createdAt": -1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    messages: {
                        $push: "$messages"
                    }
                }
            }
        ]);

        if (userMessages.length === 0) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "User messages fetched successfully", messages: userMessages[0].messages }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user messages:", error);
        return Response.json({ success: false, message: "Error fetching user messages" }, { status: 500 });
    }
}