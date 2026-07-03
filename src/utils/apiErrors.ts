const GENERIC_AXIOS_MESSAGE = /^Request failed with status code \d+$/;

function detailToMessage(detail: unknown): string | null {
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

  return null;
}

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

  if (axiosError.response) {
    const fromDetail = detailToMessage(axiosError.response.data?.detail);
    if (fromDetail) return fromDetail;

    const status = axiosError.response.status;
    if (status === 401) return 'E-mail ou senha incorretos';
    if (status === 403) return 'Acesso negado para esta conta';
    if (status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }

  if (error instanceof Error && error.message && !GENERIC_AXIOS_MESSAGE.test(error.message)) {
    return error.message;
  }

  if (!axiosError.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet.';
  }

  return fallback;
}
