'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';

export default function SignUpForm() {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const [debouncedUsername] = useDebounceValue(username, 500);

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (!debouncedUsername.trim()) return;

            setIsCheckingUsername(true);
            setUsernameMessage('');

            try {
                const response = await axios.get<ApiResponse>(
                    `/api/check-username-unique?username=${debouncedUsername}`
                );

                setUsernameMessage(response.data.message);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                setUsernameMessage(
                    axiosError.response?.data.message ?? 'Error checking username'
                );
            } finally {
                setIsCheckingUsername(false);
            }
        };

        checkUsernameUnique();
    }, [debouncedUsername]);


    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data);

            toast.success(response.data.message);
            router.replace(`/verify/${data.username}`);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage =
                axiosError.response?.data.message ||
                'There was a problem with your sign-up. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h3 className="mb-4 font-bold text-2xl">Sign up to start</h3>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username Field */}
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setUsername(e.target.value); // ✅ Update state correctly
                                        }}
                                    />
                                    <div className="flex items-center space-x-2 mt-1">
                                        {isCheckingUsername && (
                                            <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
                                        )}
                                        {usernameMessage && (
                                            <p className={`text-sm ${usernameMessage === 'Username is unique'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                                }`}>
                                                {usernameMessage}
                                            </p>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name="email" />
                                    <p className="text-muted-foreground text-sm">
                                        We will send you a verification code
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" {...field} name="password" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </Form>

                {/* Sign In Link */}
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
