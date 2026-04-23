import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(appDir, '.env.example');
const envPath = path.join(appDir, '.env');

const parseEnvFile = (content) => {
  const entries = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    entries[key] = value;
  }

  return entries;
};

const maskValue = (value) => {
  if (!value) {
    return '(missing)';
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, 4)}***${value.slice(-4)}`;
};

const readLocalKey = () => {
  const processValue = String(process.env.VITE_GEMINI_API_KEY || '').trim();
  if (processValue) {
    return { source: 'process.env', value: processValue };
  }

  if (!fs.existsSync(envPath)) {
    return { source: '.env', value: '' };
  }

  const envEntries = parseEnvFile(fs.readFileSync(envPath, 'utf8'));
  return {
    source: '.env',
    value: String(envEntries.VITE_GEMINI_API_KEY || '').trim(),
  };
};

const result = {
  envExampleExists: fs.existsSync(envExamplePath),
  envFileExists: fs.existsSync(envPath),
  localKeySource: '',
  localKeyPresent: false,
  localKeyPreview: '(missing)',
  apiCallOk: false,
  error: '',
};

const localKey = readLocalKey();
result.localKeySource = localKey.source;
result.localKeyPresent = localKey.value.length > 0;
result.localKeyPreview = maskValue(localKey.value);

if (!localKey.value) {
  result.error =
    'Local VITE_GEMINI_API_KEY is missing. Create vitejs-vite/.env or set the environment variable before running live AI checks.';
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

const endpoint =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${localKey.value}`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: 'Reply with the single word OK.',
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 8,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  }),
});

if (!response.ok) {
  let errorMessage = `${response.status} ${response.statusText}`;

  try {
    const data = await response.json();
    errorMessage = data?.error?.message || errorMessage;
  } catch {
    // Keep the fallback message.
  }

  result.error = `Gemini API call failed: ${errorMessage}`;
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

const data = await response.json();
const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

result.apiCallOk = true;
result.responsePreview = String(text).trim().slice(0, 80);

console.log(JSON.stringify(result, null, 2));
