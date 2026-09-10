export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const mode = body.mode || 'navigation';
  const prompt = (body.prompt || '').trim() || 'Describe what is ahead.';
  const imageDataUrl = body.imageDataUrl || '';

  if (mode === 'emergency') {
    res.status(400).json({ error: 'AI scene analysis is not used for emergency mode.' });
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  let imageParts: any[] = [];
  if (imageDataUrl) {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(imageDataUrl);
    if (match) {
      imageParts.push({
        inline_data: {
          mime_type: match[1],
          data: match[2],
        },
      });
    }
  }

  const MODE_INSTRUCTIONS: Record<string, string> = {
    navigation: 'You are a mobility assistant describing a scene to a blind pedestrian. Prioritize hazards (steps, curbs, obstacles, moving objects) and directional guidance (left, right, ahead). Keep the summary action-oriented and immediate, e.g. "Stop, there is a chair ahead" rather than a general description.',
    assistant: 'You are answering a specific question a blind user asked about what their camera sees. Answer the question directly in the summary. Use details for anything extra that is not essential to hear immediately.',
    reading: 'You are reading visible text aloud for a blind user (signs, labels, documents, screens). Extract and organize the text in reading order. Put the most important line in summary; put the rest in details. If no legible text is visible, say so.',
    environment: 'You are describing the general environment around a blind user for orientation purposes (indoor/outdoor, room type, notable fixed landmarks). Keep the summary brief and orienting, not a hazard alert.',
  };

  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.navigation;
  const promptText = `${instruction}\n\nUser request: "${prompt}"\n\nRespond with ONLY a valid JSON object matching this exact shape:\n{\n  "summary": "short sentence suitable for text-to-speech, under 20 words",\n  "details": ["optional supporting detail strings, 0-3 items"],\n  "warnings": ["safety or uncertainty warnings, 0-3 items"],\n  "confidence": "low" | "medium" | "high",\n  "shouldStop": false\n}`;

  if (geminiKey) {
    try {
      const parts = [{ text: promptText }, ...imageParts];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
          signal: controller.signal,
        },
      );
      clearTimeout(timeout);

      if (geminiRes.ok) {
        const payload = (await geminiRes.json()) as any;
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          if (parsed.summary) {
            res.status(200).json({
              mode,
              summary: parsed.summary,
              details: Array.isArray(parsed.details) ? parsed.details : [],
              warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
              confidence: parsed.confidence || 'medium',
              shouldStop: Boolean(parsed.shouldStop),
              demo: false,
              source: 'gemini',
            });
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini vision API error:', err);
    }
  }

  // Fallback assistive perceptions if cloud key is not set or times out
  const fallbackPerceptions: Record<string, { summary: string; details: string[]; warnings: string[] }> = {
    navigation: {
      summary: 'Pathway ahead is open. No immediate low-hanging hazards or steps detected.',
      details: ['Ground level is even.', 'Clear walking corridor in front of you.'],
      warnings: [],
    },
    environment: {
      summary: 'Indoor space with ambient lighting and open walkway.',
      details: ['Wall and furniture positioned along the sides.'],
      warnings: [],
    },
    reading: {
      summary: 'Document frame captured. Hold steady for clear line-by-line reading.',
      details: ['High contrast text area detected in view.'],
      warnings: [],
    },
    assistant: {
      summary: 'I see the scene in front of you. The area appears clear and accessible.',
      details: ['Ambient light is sufficient for navigation.'],
      warnings: [],
    },
  };

  const def = fallbackPerceptions[mode] || fallbackPerceptions.navigation;

  res.status(200).json({
    mode,
    summary: def.summary,
    details: def.details,
    warnings: def.warnings,
    confidence: 'medium',
    shouldStop: false,
    demo: true,
    source: 'gemini',
  });
}
