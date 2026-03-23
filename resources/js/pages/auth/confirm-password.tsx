import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
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
                                placeholder="Password"
                                autoComplete="current-password"
                                autoFocus
                                className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                            />
                            <InputError message={errors.password} className="mt-1 text-xs text-red-500" />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full rounded-2xl bg-[#1b4332] py-5 text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-[#d5dfd8] disabled:text-[#9db5a3] disabled:shadow-none"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner className="mr-2 h-4 w-4" />}
                                Confirm password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}