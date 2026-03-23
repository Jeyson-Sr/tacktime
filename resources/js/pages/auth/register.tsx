import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Crear una cuenta"
            description="Ingresa tus datos a continuación para crear tu cuenta"
        >
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Name */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="name"
                                    className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                                >
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nombre completo"
                                    className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                />
                                <InputError message={errors.name} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Email */}
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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ecaral.pe"
                                    pattern=".+@ecaral\.pe$"
                                    title="Debe ser un correo con dominio @ecaral.pe"
                                    className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                />
                                <InputError message={errors.email} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                                >
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Contraseña"
                                    className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                />
                                <InputError message={errors.password} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-[10px] font-bold uppercase tracking-[1px] text-[#8aab93]"
                                >
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirmar contraseña"
                                    className="rounded-xl border-[1.5px] border-[#c9e4d0] bg-white px-4 py-3 text-sm font-medium text-[#1a2e1f] placeholder:text-[#8aab93] focus:border-[#f4a318] focus:ring-2 focus:ring-[#f4a318]/15 focus-visible:ring-[#f4a318]/15 focus-visible:border-[#f4a318] transition-all"
                                />
                                <InputError message={errors.password_confirmation} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                tabIndex={5}
                                data-test="register-user-button"
                                className="mt-2 w-full rounded-2xl bg-[#1b4332] py-5 text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-[#d5dfd8] disabled:text-[#9db5a3] disabled:shadow-none"
                            >
                                {processing && <Spinner className="mr-2 h-4 w-4" />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-xs text-[#8aab93]">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors"
                            >
                                Iniciar sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}