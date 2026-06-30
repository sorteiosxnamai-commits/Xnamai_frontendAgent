import { aiSettingsStore } from '@/store/aiSettingsStore';
import type { AgentMode } from '@/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MODE_INSTRUCTIONS: Record<AgentMode, string> = {
  agent:
    'Você é o Agente IA do PulseDesk. Responda ao atendente de forma cordial, cite dados reais do contexto (estoque, pedidos, valores) e proponha ações concretas.',
  copilot:
    'Você é o Copiloto IA do PulseDesk. Ajude o ATENDENTE (não fale com o cliente diretamente salvo em sugestões entre aspas). Use markdown, bullets e emojis moderados. Seja específico com números do contexto.',
  suggestion:
    'Retorne APENAS o texto da mensagem pronta para o atendente enviar ao cliente. Tom profissional, empático, em português BR. Sem explicações extras.',
};

export async function callOpenAI(
  userMessage: string,
  systemContext: string,
  history: ChatMessage[] = [],
  mode: AgentMode = 'copilot',
): Promise<string> {
  const settings = aiSettingsStore.get();

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${MODE_INSTRUCTIONS[mode]}\n\n${systemContext}`,
    },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: settings.temperature,
      max_tokens: 1024,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message ?? response.statusText;
    throw new Error(`OpenAI: ${msg}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content?.trim() ?? 'Não foi possível gerar resposta.';
}
