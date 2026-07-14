import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import { personaTestUnavailableMessage } from '@/features/persona/services/persona.service';
import type { AgentPersona } from '@/features/persona/types';
import { Send } from 'lucide-react';
import { useState } from 'react';

export function PersonaTestPanel({ persona }: { persona: AgentPersona }) {
  const [message, setMessage] = useState('');

  return (
    <Card title="Teste visual da persona" subtitle="O rascunho não é enviado ao agente ativo da empresa.">
      <div className="space-y-4">
        <TextareaField
          label="Mensagem simulada do cliente"
          value={message}
          onChange={setMessage}
          placeholder="Digite uma pergunta ou objeção para testar quando o backend suportar persona temporária."
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {personaTestUnavailableMessage}
        </div>
        <Button type="button" disabled>
          <Send className="h-4 w-4" /> Testar persona
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Persona em rascunho: {persona.name || 'Não configurado'}
        </p>
      </div>
    </Card>
  );
}
