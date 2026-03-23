import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-Factor Authentication" />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Enter recovery code"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                        className="mt-1 text-xs text-red-500"
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            className="h-12 w-12 rounded-xl border-[1.5px] border-[#c9e4d0] bg-white text-base font-bold text-[#1a2e1f] transition-all data-[active=true]:border-[#f4a318] data-[active=true]:ring-2 data-[active=true]:ring-[#f4a318]/15"
                                        >
                                            <InputOTPGroup className="gap-2">
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="h-12 w-12 rounded-xl border-[1.5px] border-[#c9e4d0] bg-white text-base font-bold text-[#1a2e1f] transition-all first:rounded-xl last:rounded-xl data-[active=true]:border-[#f4a318] data-[active=true]:ring-2 data-[active=true]:ring-[#f4a318]/15"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError
                                        message={errors.code}
                                        className="text-xs text-red-500"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full rounded-2xl bg-[#1b4332] py-5 text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-[#d5dfd8] disabled:text-[#9db5a3] disabled:shadow-none"
                                disabled={processing}
                            >
                                Continue
                            </Button>

                            <div className="text-center text-xs text-[#8aab93]">
                                <span>or you can </span>
                                <button
                                    type="button"
                                    className="font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors cursor-pointer"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}