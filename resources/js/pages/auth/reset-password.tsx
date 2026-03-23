import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        {/* Email (readonly) */}
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="email"
                                className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                className="w-full rounded-xl border-[1.5px] border-[#c9e4d0] bg-[#f5faf6] px-4 py-3 text-sm font-medium text-[#3d5a47] cursor-not-allowed opacity-70"
                            />
                            <InputError message={errors.email} className="mt-1 text-xs text-red-500" />
                        </div>

                        {/* Password */}
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                            >
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Password"
                                className="w-full rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                            />
                            <InputError message={errors.password} className="mt-1 text-xs text-red-500" />
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                            >
                                Confirm password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                className="w-full rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                            />
                            <InputError message={errors.password_confirmation} className="mt-1 text-xs text-red-500" />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="mt-2 w-full rounded-2xl bg-[#1b4332] py-5 text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-[#d5dfd8] disabled:text-[#9db5a3] disabled:shadow-none"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}