import { aiSettingsStore } from '@/store/aiSettingsStore';
import type { AgentMode } from '@/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MODE_INSTRUCTIONS: Record<AgentMode, string> = {
  agent: 'Você é o Agente IA autônomo do PulseDesk. Responda diretamente ao usuário final de forma cordial e resolutiva.',
  copilot: 'Você é o Copiloto IA do PulseDesk. Ajude o ATENDENTE com resumos, sugestões de resposta, análises e dados. Use markdown quando útil.',
  suggestion: 'Gere apenas a mensagem sugerida para o atendente enviar ao cliente, sem explicações extras.',
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
