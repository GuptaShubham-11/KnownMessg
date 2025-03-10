import dbToConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function POST(req: Request) {
    await dbToConnect();

    try {
        const { username, email, password } = await req.json();

        const existingUserVerifiedByUsername = await User.findOne({ username, isVerified: true });

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                {
                    status: 400
                }
            )
        }

        const existingUserVerifiedByEmail = await User.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "Email already exists",
                    },
                    {
                        status: 400
                    }
                );
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);

                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiray = new Date(Date.now() + 3600000).toISOString();

                await existingUserVerifiedByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            await new User({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiray: expiryDate.toISOString(),
                isVerified: false,
                isAcceptingMessage: true,
                message: [],
            }).save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message || "Error sending verification email",
                },
                {
                    status: 500
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "User registered successfully. Please check your email for verification.",
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error("Error registering User", error);
        return Response.json(
            {
                success: false,
                message: "Error registering User",
            },
            {
                status: 500
            }
        )
    }
}
