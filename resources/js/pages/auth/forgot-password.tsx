// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="¿Olvidaste tu contraseña?"
            description="Ingresa tu correo para recibir un enlace de restablecimiento"
        >
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-[1px] text-[#2d6a4f]">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                                >
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="correo@ejemplo.com"
                                    className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                />
                                <InputError message={errors.email} className="mt-1 text-xs text-red-500" />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full rounded-2xl bg-[#1b4332] py-5 text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-[#d5dfd8] disabled:text-[#9db5a3] disabled:shadow-none"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Enviar enlace de restablecimiento
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-center text-xs text-[#8aab93]">
                    <span>O regresa para </span>
                    <TextLink
                        href={login()}
                        className="font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors"
                    >
                        iniciar sesión
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}