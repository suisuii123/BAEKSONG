export interface TranslationResult {
  english: string;
  chinese: string;
}

export async function autoTranslateText(text: string, context?: string): Promise<TranslationResult> {
  if (!text || !text.trim()) {
    return { english: '', chinese: '' };
  }
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return {
      english: data.english || text,
      chinese: data.chinese || text,
    };
  } catch (err) {
    console.warn('Auto translation failed:', err);
    return { english: text, chinese: text };
  }
}

export async function autoTranslateFields(
  fields: Record<string, string>,
  context?: string
): Promise<{ english: Record<string, string>; chinese: Record<string, string> }> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, context }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      english: data.english || {},
      chinese: data.chinese || {},
    };
  } catch (err) {
    console.warn('Auto translation fields failed:', err);
    return { english: {}, chinese: {} };
  }
}
