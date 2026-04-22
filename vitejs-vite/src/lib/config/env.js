const readEnv = (key) => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
};

export const GEMINI_API_KEY = readEnv('VITE_GEMINI_API_KEY');
export const HAS_GEMINI_API_KEY = GEMINI_API_KEY.length > 0;
