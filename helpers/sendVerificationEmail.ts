import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export default async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "From Knownmessg - Verification Code",
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.log("Error sending email", error);
        return { success: false, message: "Error sending email" };
    }
}   
