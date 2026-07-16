export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-56 items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
      Carregando ChatBô...
    </div>
  );
}

export function PageState({ error, empty }: { error?: string; empty?: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
      {error ?? empty ?? 'Carregando ChatBô...'}
    </div>
  );
}
