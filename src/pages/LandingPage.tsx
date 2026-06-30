import { LandingFooter, LandingNavbar, LandingSection } from '@/components/landing/LandingLayout';
import { LandingChatDemo } from '@/components/landing/LandingChatDemo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Headphones,
  Instagram,
  Mail,
  MessageCircle,
  Mic,
  Send,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const channels = [
  { icon: MessageCircle, name: 'WhatsApp', color: 'text-green-400' },
  { icon: Instagram, name: 'Instagram', color: 'text-pink-400' },
  { icon: MessageCircle, name: 'Facebook', color: 'text-blue-400' },
  { icon: Send, name: 'Telegram', color: 'text-sky-400' },
  { icon: Headphones, name: 'WebChat', color: 'text-violet-400' },
  { icon: Mail, name: 'E-mail', color: 'text-gray-400' },
];

const features = [
  {
    icon: Bot,
    title: 'Robô de Atendimento',
    desc: 'Automatize triagens e respostas 24/7. Ativo sem interrupções, com encaminhamento inteligente para humanos.',
    tag: '24/7',
  },
  {
    icon: Sparkles,
    title: 'Copiloto IA',
    desc: 'Resuma conversas, transcreva áudios e receba sugestões de resposta com tom de voz da sua empresa.',
    tag: 'Generative IA',
  },
  {
    icon: GitBranch,
    title: 'Funil de Vendas',
    desc: 'Pipeline visual intuitivo. Histórico unificado por negócio e relatórios de conversão.',
    tag: 'Sales CRM',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Avançados',
    desc: 'NPS, CSAT, tempo médio e performance do time em dashboards em tempo real.',
    tag: 'Analytics',
  },
];

const segments = [
  'Varejo', 'E-commerce', 'Saúde', 'Educação', 'Jurídico',
  'Financeiro', 'Imobiliário', 'Tecnologia', 'Indústria', 'Turismo',
];

const steps = [
  {
    step: '01',
    icon: MessageCircle,
    title: 'Conecte seus canais',
    desc: 'WhatsApp, Instagram, WebChat e e-mail em minutos — um painel, zero confusão.',
    color: 'text-green-400',
    glow: 'group-hover:shadow-green-900/30',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Atenda com IA + time',
    desc: 'Robô triagem 24/7, Copiloto sugere respostas e humanos assumem quando precisar.',
    color: 'text-violet-400',
    glow: 'group-hover:shadow-violet-900/30',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Converta e analise',
    desc: 'Funil de vendas, campanhas e dashboards com NPS, CSAT e tempo de resposta.',
    color: 'text-teal-400',
    glow: 'group-hover:shadow-teal-900/30',
  },
];

const benefits = [
  { icon: Headphones, title: 'Suporte dedicado', desc: 'Atendimento humano e contínuo' },
  { icon: Shield, title: 'Segurança LGPD', desc: 'Criptografia e backup automático' },
  { icon: Zap, title: 'Setup gratuito', desc: 'Implantação rápida sem custo inicial' },
  { icon: Users, title: 'Treinamento incluso', desc: 'Onboarding completo para sua equipe' },
];

const faqs = [
  {
    q: 'O que é o PulseDesk?',
    a: 'Plataforma multicanal que centraliza WhatsApp, Instagram, Facebook, Telegram, WebChat, SMS e e-mail em um único painel, com IA integrada.',
  },
  {
    q: 'Funciona com WhatsApp API Oficial?',
    a: 'Sim. Múltiplos atendentes em um número, automação, campanhas e governança — sem depender de celular.',
  },
  {
    q: 'Posso integrar com meu CRM?',
    a: 'Sim. HubSpot, RD Station, Pipedrive, Salesforce e dezenas de ERPs e e-commerces via API aberta.',
  },
  {
    q: 'Tem teste grátis?',
    a: '5 dias gratuitos com treinamento e suporte inclusos. Sem cartão de crédito.',
  },
];

const stats = [
  { value: '7+', label: 'Canais integrados' },
  { value: '68%', label: 'Resolução via bot' },
  { value: '1m 48s', label: 'Tempo médio resposta' },
  { value: '4.6/5', label: 'CSAT médio' },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-600/20 blur-[120px]" />
          <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-300"
          >
            <Sparkles className="h-4 w-4" /> Inteligência Artificial Integrada
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Centralize todos os seus canais,{' '}
            <span className="gradient-text">organize conversas</span> e acelere respostas com IA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
          >
            Atenda no WhatsApp, Instagram, Facebook, WebChat, Telegram, SMS ou e-mail.
            Sem alternar janelas, sem perder histórico — tudo em um só lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="min-w-[200px]" onClick={() => navigate('/login')}>
              Começar teste grátis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] border-gray-600 text-white hover:bg-white/5"
              onClick={() => navigate('/login')}
            >
              Já tenho conta
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm text-gray-500"
          >
            5 dias grátis · Treinamento incluso · Sem cartão
          </motion.p>

          <LandingChatDemo />

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-8 flex justify-center"
          >
            <ChevronDown className="h-6 w-6 text-gray-600" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <LandingSection className="border-y border-white/5 bg-gray-900/50 py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-teal-400">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Canais */}
      <LandingSection id="canais">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Todos os seus canais em uma só tela
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Sem abas, sem conversas perdidas, sem confusão.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {channels.map(({ icon: Icon, name, color }) => (
            <div
              key={name}
              className="group flex cursor-default flex-col items-center rounded-2xl border border-white/5 bg-gray-900/50 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-teal-500/40 hover:bg-gray-900 hover:shadow-xl hover:shadow-teal-900/25"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:bg-white/[0.08] group-hover:shadow-lg group-hover:shadow-black/20">
                <Icon
                  className={`h-8 w-8 ${color} transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110`}
                />
              </div>
              <span className="mt-4 text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white">
                {name}
              </span>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Recursos */}
      <LandingSection id="recursos" className="bg-gray-900/30">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ferramentas que fazem a diferença</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Ecossistema completo para escalar seu atendimento com inteligência.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, tag }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/5 bg-gray-900/50 p-6 transition-all hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-900/10"
            >
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
                {tag}
              </span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 transition-colors group-hover:bg-teal-500/20">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Mic, title: 'Transcrição de áudios', desc: 'Converta mensagens de voz em texto automaticamente' },
            { icon: Sparkles, title: 'Texto mágico', desc: 'Gere respostas profissionais com um clique' },
            { icon: Star, title: 'NPS e CSAT', desc: 'Meça satisfação do cliente em tempo real' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-xl border border-white/5 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="mt-1 text-sm text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Segmentos */}
      <LandingSection id="segmentos">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Soluções para cada segmento</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Do pequeno negócio à enterprise — adaptável ao seu fluxo de trabalho.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {segments.map((seg) => (
            <span
              key={seg}
              className="rounded-full border border-white/10 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-teal-500/30 hover:text-white"
            >
              {seg}
            </span>
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Pequenas Empresas', desc: 'Centralize canais, automatize tarefas e ganhe tempo para o cliente.', cta: 'Começar agora' },
            { title: 'Médias Empresas', desc: 'Dashboards avançados, integração com CRMs e automação de marketing.', cta: 'Escalar time' },
            { title: 'Enterprise', desc: 'Segurança de nível enterprise, APIs abertas e gerente dedicado.', cta: 'Falar com especialista' },
          ].map(({ title, desc, cta }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/80 to-gray-950 p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm text-gray-400">{desc}</p>
              <Button variant="outline" className="mt-6 border-gray-700 text-gray-300 hover:bg-white/5" onClick={() => navigate('/login')}>
                {cta}
              </Button>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Como funciona */}
      <LandingSection id="como-funciona" className="bg-gray-900/30">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"
          >
            <Zap className="h-6 w-6 text-teal-400" />
          </motion.div>
          <h2 className="text-3xl font-bold sm:text-4xl">Como funciona o PulseDesk</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Do primeiro contato ao fechamento — três passos para escalar seu atendimento.
          </p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute top-16 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-teal-500/30 to-transparent md:block" />

          {steps.map(({ step, icon: Icon, title, desc, color, glow }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`group relative rounded-2xl border border-white/5 bg-gray-900/60 p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-teal-500/30 hover:bg-gray-900 hover:shadow-xl ${glow}`}
            >
              <span className="text-xs font-bold tracking-widest text-teal-500/80">{step}</span>
              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-white/[0.08]">
                <Icon className={`h-7 w-7 ${color} transition-transform duration-300 group-hover:scale-110`} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Começar em 3 passos <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </LandingSection>

      {/* Benefícios */}
      <LandingSection>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* FAQ */}
      <LandingSection id="faq" className="bg-gray-900/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-gray-900/50 overflow-hidden">
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/5 px-5 py-4 text-sm text-gray-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </LandingSection>

      {/* CTA Final */}
      <LandingSection>
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-center sm:p-16">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Pronto para transformar seu atendimento?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-teal-100">
              Teste grátis por 5 dias. Treinamento e suporte inclusos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="min-w-[220px] bg-white text-teal-800 hover:bg-gray-100" onClick={() => navigate('/login')}>
                Começar teste grátis
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px] border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/login')}>
                Entrar na plataforma
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-teal-100">
              {['Sem cartão', 'Setup grátis', 'LGPD', 'Suporte humano'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </LandingSection>

      <LandingFooter />
    </div>
  );
}
