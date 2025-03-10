import dbToConnect from "@/lib/db";
import User from "@/models/User";
import { verifySchema } from "@/schemas/verifySchema";

export async function POST(req: Request) {
    await dbToConnect();

    try {
        const { username, verifyCode } = await req.json();

        console.log(username, verifyCode);


        const decodedUsername = decodeURIComponent(username);

        const result = verifySchema.safeParse({ verifyCode: verifyCode });
        console.log(result);


        if (!result.success) {
            const verifyCodeError = result.error.format().verifyCode?._errors || [];
            return Response.json({ success: false, message: verifyCodeError || "Invalid verification code" }, { status: 400 });
        }


        const user = await User.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const isCodeNotExpired = new Date() < new Date(user.verifyCodeExpiray);

        if (user.verifyCode === verifyCode && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({ success: true, message: "Verification code verified successfully" });
        } else if (!isCodeNotExpired) {
            return Response.json({ success: false, message: "Verification code has expired.sign up again" }, { status: 400 });
        } else {
            return Response.json({ success: false, message: "Invalid verification code" }, { status: 400 });
        }

    } catch (error) {
        console.log("Error verifying verification code", error);
        return Response.json({ success: false, message: "Error verifying verification code" });
    }
}


