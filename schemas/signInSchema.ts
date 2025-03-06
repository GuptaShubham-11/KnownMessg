import { z } from "zod";

export const signInSchema = z.object({
    identifier: z.string(),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        )
});