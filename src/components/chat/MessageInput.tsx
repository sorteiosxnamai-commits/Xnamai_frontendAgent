import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { Paperclip, Send, Smile } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = 'Digite sua mensagem...',
}: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" type="button" disabled={disabled}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" disabled={disabled}>
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
            disabled && 'opacity-50',
          )}
        />
        <Button onClick={handleSend} disabled={disabled || !value.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
