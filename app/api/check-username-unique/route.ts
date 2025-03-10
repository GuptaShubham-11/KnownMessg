import dbToConnect from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({ username: usernameValidation });

export async function GET(req: Request) {
    await dbToConnect();

    try {
        const { searchParams } = new URL(req.url);
        const queryParams = {
            username: searchParams.get("username"),
        }

        const result = usernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const usernameError = result.error.format().username?._errors || [];
            return Response.json({ success: false, message: usernameError || "Invalid username" }, { status: 400 });
        }

        const { username } = result.data;
        console.log("username", username);


        const existingUserVerifiedByUsername = await User.findOne({ username, isVerified: true });

        if (existingUserVerifiedByUsername) {
            return Response.json({ success: false, message: "Username already exists" }, { status: 400 });
        }

        return Response.json({ success: true, message: "Username is unique" });
    } catch (error) {
        console.log("error username checking", error);
        return Response.json({ success: false, message: "Error checking username" });
    }
}
