export function getApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (error.status === 401) return 'Please sign in with valid credentials.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if ('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
      const message = error.data.message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message) && message.every(item => typeof item === 'string')) return message.join(', ');
    }
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the API. Check your connection and try again.';
    if (error.status === 'TIMEOUT_ERROR') return 'The request timed out. Please try again.';
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Something went wrong. Please try again.';
}
