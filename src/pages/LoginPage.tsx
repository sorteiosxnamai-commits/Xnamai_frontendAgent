import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      addToast({
        title: 'Login inválido',
        message: error instanceof Error ? error.message : 'E-mail ou senha incorretos',
        type: 'error',
      });
    }
  };

  const handleForgotPassword = () => {
    const email = resetEmail || getValues('email');
    if (!email || !z.string().email().safeParse(email).success) {
      addToast({ title: 'Email inválido', message: 'Informe um e-mail válido', type: 'warning' });
      return;
    }
    addToast({
      title: 'E-mail enviado',
      message: `Link de recuperação enviado para ${email}`,
      type: 'success',
    });
    setForgotOpen(false);
  };

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-teal-600/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[80px]" />
      </div>

      <Link
        to="/"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
              <Logo size="md" showCompany className="[&_span]:text-white [&_span_span]:text-teal-400 [&_p]:text-gray-500" />
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-white">Bem-vindo de volta</h1>
            <p className="mt-2 text-sm text-gray-400">
              Entre na sua conta para acessar a plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="seu@empresa.com"
              error={errors.email?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="rounded border-gray-600 bg-gray-800"
                />
                Lembrar acesso
              </label>
              <button
                type="button"
                className="text-sm text-teal-400 hover:underline"
                onClick={() => {
                  setResetEmail(getValues('email') ?? '');
                  setForgotOpen(true);
                }}
              >
                Esqueci minha senha
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              <Lock className="h-4 w-4" />
              Entrar na plataforma
            </Button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="font-medium text-teal-400 hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-600">
          <Mail className="h-3.5 w-3.5" />
          Protegido com criptografia · Conformidade LGPD
        </p>
      </motion.div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Recuperar senha" footer={
        <>
          <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancelar</Button>
          <Button onClick={handleForgotPassword}>Enviar link</Button>
        </>
      }>
        <p className="mb-4 text-sm text-gray-500">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
        <Input
          label="Email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="seu@empresa.com"
        />
      </Modal>
    </div>
  );
}
