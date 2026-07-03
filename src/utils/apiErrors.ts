export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Ocorreu um erro. Tente novamente.',
): string {
  const axiosError = error as {
    code?: string;
    response?: { status?: number; data?: { detail?: unknown } };
    message?: string;
  };

  if (axiosError.code === 'ECONNABORTED') {
    return 'Servidor demorou para responder. Aguarde um momento e tente de novo.';
  }

  if (!axiosError.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet.';
  }

  const detail = axiosError.response.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'object' && item && 'msg' in item) {
          return String((item as { msg: string }).msg);
        }
        return String(item);
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
