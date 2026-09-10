import { GeminiProvider } from './gemini-provider.js';
import { AiProviderError, type AiProvider, type AiRequest, type AiResult } from './types.js';

export class DemoProvider implements AiProvider {
  async generate(request: AiRequest): Promise<AiResult> {
    if (request.mode === 'emergency') {
      throw new AiProviderError('AI is not used for emergency mode', 'unsupported');
    }

    const demoSummaries: Record<Exclude<AiRequest['mode'], 'emergency'>, { summary: string; details: string[] }> = {
      navigation: {
        summary: 'Demo mode: path appears clear, but watch for low obstacles and steps.',
        details: ['Central corridor is unobstructed.', 'Ground surface is level.'],
      },
      assistant: {
        summary: `Demo mode: ${request.prompt.trim() || 'the user is inside a safe indoor space.'}`,
        details: ['Ambient lighting is sufficient for navigation.'],
      },
      reading: {
        summary: 'Demo mode: EXIT. Reception Desk. Stairs ahead on the right.',
        details: ['High contrast text area detected.'],
      },
      environment: {
        summary: 'Demo mode: indoor room environment with ambient lighting.',
        details: [
          "Center walkway directly ahead at 12 o'clock appears clear.",
          "Left and right sides (9 o'clock and 3 o'clock) have open clearance.",
          "Floor surface is flat and free of immediate trip hazards.",
        ],
      },
    };

    const def = demoSummaries[request.mode];

    return {
      mode: request.mode,
      summary: def.summary,
      details: def.details,
      warnings: ['This is a demo response. No live AI analysis was performed.'],
      confidence: 'low',
      shouldStop: false,
    };
  }
}

let cachedProvider: { key: string; provider: AiProvider } | null = null;

export function getAiProvider(apiKey: string | undefined, model: string): AiProvider {
  if (!apiKey) {
    return new DemoProvider();
  }

  if (cachedProvider?.key === apiKey) {
    return cachedProvider.provider;
  }

  const provider = new GeminiProvider(apiKey, model);
  cachedProvider = { key: apiKey, provider };
  return provider;
}

export { AiProviderError };
export type { AiMode, AiProvider, AiRequest, AiResult } from './types.js';
