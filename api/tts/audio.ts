import { createHash, randomUUID } from 'node:crypto';
import WebSocket from 'ws';

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;
const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0`;
const WIN_EPOCH = 11644473600;
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const SYNTH_TIMEOUT_MS = 25_000;

function generateSecMsGec(nowMs: number = Date.now()): string {
  let ticks = nowMs / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e9 / 100;
  const strToHash = `${Math.round(ticks)}${TRUSTED_CLIENT_TOKEN}`;
  return createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

let clockSkewSeconds = 0;

function nowMs(): number {
  return Date.now() + clockSkewSeconds * 1000;
}

function parseRfc2616Date(date: string): number | null {
  const ms = Date.parse(date);
  return Number.isFinite(ms) ? ms / 1000 : null;
}

function wssUrl(): string {
  const gec = generateSecMsGec(nowMs());
  return (
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${gec}` +
    `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
    `&ConnectionId=${randomUUID().replaceAll('-', '')}`
  );
}

function wsHeaders(): Record<string, string> {
  return {
    'User-Agent': USER_AGENT,
    Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'Sec-MS-GEC': generateSecMsGec(nowMs()),
    'Sec-MS-GEC-Version': SEC_MS_GEC_VERSION,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
  };
}

function escXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rateToSsml(rate: number): string {
  const clamped = Math.min(2, Math.max(0.5, rate));
  const pct = Math.round((clamped - 1) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

// Extract language and locale details from voice string
function getVoiceLanguageInfo(voice: string): { langCode: string; locale: string; isIndian: boolean; defaultSpeaker: string } {
  const v = voice.toLowerCase();

  if (v.includes('ta-') || v.includes('tamil') || v.includes('vidya')) {
    return { langCode: 'ta-IN', locale: 'ta-IN', isIndian: true, defaultSpeaker: 'priya' };
  }
  if (v.includes('te-') || v.includes('telugu') || v.includes('rahul')) {
    return { langCode: 'te-IN', locale: 'te-IN', isIndian: true, defaultSpeaker: 'rahul' };
  }
  if (v.includes('kn-') || v.includes('kannada') || v.includes('sapna') || v.includes('gagan')) {
    return { langCode: 'kn-IN', locale: 'kn-IN', isIndian: true, defaultSpeaker: 'kavya' };
  }
  if (v.includes('ml-') || v.includes('malayalam') || v.includes('sobhana') || v.includes('midhun')) {
    return { langCode: 'ml-IN', locale: 'ml-IN', isIndian: true, defaultSpeaker: 'kavya' };
  }
  if (v.includes('bn-') || v.includes('bengali') || v.includes('tanishaa') || v.includes('bashkar')) {
    return { langCode: 'bn-IN', locale: 'bn-IN', isIndian: true, defaultSpeaker: 'shreya' };
  }
  if (v.includes('gu-') || v.includes('gujarati') || v.includes('dhwani')) {
    return { langCode: 'gu-IN', locale: 'gu-IN', isIndian: true, defaultSpeaker: 'simran' };
  }
  if (v.includes('mr-') || v.includes('marathi') || v.includes('aarohi')) {
    return { langCode: 'mr-IN', locale: 'mr-IN', isIndian: true, defaultSpeaker: 'pooja' };
  }
  if (v.includes('pa-') || v.includes('punjabi')) {
    return { langCode: 'pa-IN', locale: 'pa-IN', isIndian: true, defaultSpeaker: 'simran' };
  }
  if (v.includes('od-') || v.includes('odia')) {
    return { langCode: 'od-IN', locale: 'od-IN', isIndian: true, defaultSpeaker: 'shreya' };
  }
  if (v.includes('hi-') || v.includes('hindi') || v.includes('swara') || v.includes('madhur') || v.includes('anushka') || v.includes('priya') || v.includes('aditya') || v.includes('neha') || v.includes('ashutosh')) {
    return { langCode: 'hi-IN', locale: 'hi-IN', isIndian: true, defaultSpeaker: v.includes('aditya') || v.includes('ashutosh') || v.includes('madhur') ? 'aditya' : 'priya' };
  }
  if (v.includes('es-') || v.includes('spanish') || v.includes('elvira') || v.includes('alvaro')) {
    return { langCode: 'es-ES', locale: 'es-ES', isIndian: false, defaultSpeaker: '' };
  }
  if (v.includes('fr-') || v.includes('french') || v.includes('denise') || v.includes('henri')) {
    return { langCode: 'fr-FR', locale: 'fr-FR', isIndian: false, defaultSpeaker: '' };
  }
  if (v.includes('de-') || v.includes('german') || v.includes('katja') || v.includes('conrad')) {
    return { langCode: 'de-DE', locale: 'de-DE', isIndian: false, defaultSpeaker: '' };
  }
  if (v.includes('it-') || v.includes('italian') || v.includes('elsa') || v.includes('diego')) {
    return { langCode: 'it-IT', locale: 'it-IT', isIndian: false, defaultSpeaker: '' };
  }
  if (v.includes('en-in') || v.includes('neerja') || v.includes('prabhat')) {
    return { langCode: 'en-IN', locale: 'en-IN', isIndian: true, defaultSpeaker: v.includes('prabhat') ? 'aditya' : 'amelia' };
  }

  return { langCode: 'en-US', locale: 'en-US', isIndian: false, defaultSpeaker: 'amelia' };
}

// Common assistive app translations for rapid zero-latency responses
const COMMON_TRANSLATIONS: Record<string, Record<string, string>> = {
  'hi-IN': {
    'Hello from Watchora': 'वॉचोरा की ओर से नमस्ते',
    'Camera connected': 'कैमरा कनेक्ट हो गया है',
    'Camera connected and scanning.': 'कैमरा जुड़ गया है और स्कैन कर रहा है।',
    'Camera stopped.': 'कैमरा बंद कर दिया गया है।',
    'Starting the camera and scanning.': 'कैमरा चालू किया जा रहा है और स्कैनिंग शुरू हो रही है।',
    'Opening Home': 'होम स्क्रीन खोली जा रही है।',
    'Opening Visual Assistance': 'विजुअल असिस्ट खोला जा रहा है।',
    'Opening Safe Journey': 'सुरक्षित यात्रा खोली जा रही है।',
    'Opening Emergency': 'आपातकालीन स्क्रीन खोली जा रही है।',
    'Opening Settings': 'सेटिंग्स खोली जा रही है।',
    'Opening Saved Places': 'सहेजे गए स्थान खोले जा रहे हैं।',
    'Opening Community': 'कम्युनिटी रिपोर्ट खोली जा रही है।',
    'Dark mode on.': 'डार्क मोड चालू हो गया है।',
    'Light mode on.': 'लाइट मोड चालू हो गया है।',
    'Speaking faster.': 'तेज़ आवाज़ में बोल रहा हूँ।',
    'Speaking slower.': 'धीमी आवाज़ में बोल रहा हूँ।',
    'Stopping speech. Emergency warnings remain active.': 'आवाज़ बंद कर दी गई है। आपातकालीन चेतावनियाँ सक्रिय हैं।',
    'Logged out.': 'लॉग आउट हो गया है।',
  },
  'ta-IN': {
    'Hello from Watchora': 'வாச்சோராவின் வணக்கம்',
    'Camera connected': 'கேமரா இணைக்கப்பட்டது',
    'Camera connected and scanning.': 'கேமரா இணைக்கப்பட்டு ஸ்கேன் செய்கிறது.',
    'Camera stopped.': 'கேமரா நிறுத்தப்பட்டது.',
    'Starting the camera and scanning.': 'கேமரா தொடங்கப்பட்டு ஸ்கேன் செய்கிறது.',
    'Opening Home': 'முகப்பு திறக்கப்படுகிறது.',
    'Opening Visual Assistance': 'காட்சி உதவி திறக்கப்படுகிறது.',
    'Opening Safe Journey': 'பாதுகாப்பான பயணம் திறக்கப்படுகிறது.',
    'Opening Emergency': 'அவசர திரை திறக்கப்படுகிறது.',
    'Opening Settings': 'அமைப்புகள் திறக்கப்படுகின்றன.',
    'Dark mode on.': 'டார்க் மோட் ஆன் செய்யப்பட்டது.',
    'Light mode on.': 'லைட் மோட் ஆன் செய்யப்பட்டது.',
    'Logged out.': 'வெளியேறியது.',
  },
  'te-IN': {
    'Hello from Watchora': 'వాచోరా నుండి నమస్కారం',
    'Camera connected': 'కెమెరా కనెక్ట్ చేయబడింది',
    'Camera connected and scanning.': 'కెమెరా కనెక్ట్ చేయబడింది మరియు స్కాన్ చేస్తోంది.',
    'Camera stopped.': 'కెమెరా ఆపబడింది.',
    'Starting the camera and scanning.': 'కెమెరా ప్రారంభించబడుతోంది.',
    'Opening Home': 'హోమ్ స్క్రీన్ తెరవబడుతోంది.',
    'Opening Visual Assistance': 'విజువల్ అసిస్ట్ తెరవబడుతోంది.',
    'Opening Safe Journey': 'సేఫ్ జర్నీ తెరవబడుతోంది.',
    'Opening Settings': 'సెట్టింగ్‌లు తెరవబడుతున్నాయి.',
    'Logged out.': 'లాగ్ అవుట్ అయ్యారు.',
  },
  'es-ES': {
    'Hello from Watchora': 'Hola de Watchora',
    'Camera connected': 'Cámara conectada',
    'Camera connected and scanning.': 'Cámara conectada y escaneando.',
    'Camera stopped.': 'Cámara detenida.',
    'Starting the camera and scanning.': 'Iniciando cámara y escaneando.',
    'Opening Home': 'Abriendo Inicio.',
    'Opening Visual Assistance': 'Abriendo Asistencia Visual.',
    'Opening Safe Journey': 'Abriendo Viaje Seguro.',
    'Opening Emergency': 'Abriendo Emergencia.',
    'Opening Settings': 'Abriendo Ajustes.',
    'Dark mode on.': 'Modo oscuro activado.',
    'Light mode on.': 'Modo claro activado.',
    'Logged out.': 'Sesión cerrada.',
  },
  'fr-FR': {
    'Hello from Watchora': 'Bonjour de Watchora',
    'Camera connected': 'Caméra connectée',
    'Camera connected and scanning.': 'Caméra connectée et en cours d’analyse.',
    'Camera stopped.': 'Caméra arrêtée.',
    'Starting the camera and scanning.': 'Démarrage de la caméra.',
    'Opening Home': 'Ouverture de l’accueil.',
    'Opening Visual Assistance': 'Ouverture de l’assistance visuelle.',
    'Opening Safe Journey': 'Ouverture du trajet sécurisé.',
    'Opening Settings': 'Ouverture des paramètres.',
    'Logged out.': 'Déconnecté.',
  },
  'de-DE': {
    'Hello from Watchora': 'Hallo von Watchora',
    'Camera connected': 'Kamera verbunden',
    'Camera connected and scanning.': 'Kamera verbunden und scannt.',
    'Camera stopped.': 'Kamera gestoppt.',
    'Starting the camera and scanning.': 'Kamera wird gestartet.',
    'Opening Home': 'Startseite wird geöffnet.',
    'Opening Settings': 'Einstellungen werden geöffnet.',
    'Logged out.': 'Abgemeldet.',
  },
};

// Auto-translate English text to target language via Sarvam Mayura if available
async function translateIfNeeded(text: string, targetLang: string, apiKey: string): Promise<string> {
  if (!text || targetLang.startsWith('en')) return text;

  // Check common translations dictionary first
  if (COMMON_TRANSLATIONS[targetLang]?.[text]) {
    return COMMON_TRANSLATIONS[targetLang][text];
  }

  // If text is already in non-Latin script (Devanagari, Tamil, Telugu, etc.), return as is
  if (!/[a-zA-Z]/.test(text)) {
    return text;
  }

  // Call Sarvam Mayura Translation for Indian languages
  if (apiKey && targetLang.endsWith('-IN')) {
    try {
      const res = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text.slice(0, 500),
          source_language_code: 'en-IN',
          target_language_code: targetLang,
          mode: 'formal',
          model: 'mayura:v1',
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { translated_text?: string };
        if (data.translated_text) return data.translated_text;
      }
    } catch {
      // ignore
    }
  }

  return text;
}

// ── Sarvam AI Official Bulbul v3 TTS Integration ──
async function synthesizeSarvam(text: string, voice: string, rate: number, apiKey: string): Promise<Buffer | null> {
  try {
    const { langCode, defaultSpeaker } = getVoiceLanguageInfo(voice);
    const v = voice.toLowerCase();

    let speaker = defaultSpeaker;
    if (v.includes('aditya') || v.includes('ashutosh') || v.includes('madhur') || v.includes('prabhat')) {
      speaker = 'aditya';
    } else if (v.includes('priya') || v.includes('anushka') || v.includes('swara') || v.includes('manisha')) {
      speaker = 'priya';
    } else if (v.includes('rahul') || v.includes('mohan') || v.includes('valluvar')) {
      speaker = 'rahul';
    } else if (v.includes('kavya') || v.includes('vidya') || v.includes('pallavi') || v.includes('shruti') || v.includes('sapna') || v.includes('sobhana')) {
      speaker = 'kavya';
    } else if (v.includes('shreya') || v.includes('tanishaa')) {
      speaker = 'shreya';
    } else if (v.includes('pooja') || v.includes('aarohi')) {
      speaker = 'pooja';
    } else if (v.includes('simran') || v.includes('dhwani')) {
      speaker = 'simran';
    }

    const sanitizedText = text.slice(0, 500);

    const payload = {
      inputs: [sanitizedText],
      target_language_code: langCode,
      speaker: speaker,
      pitch: 0,
      pace: Math.max(0.5, Math.min(2.0, rate)),
      loudness: 1.0,
      speech_sample_rate: 24000,
      enable_preprocessing: true,
      model: 'bulbul:v3',
    };

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { audios?: string[] };
    if (data.audios && data.audios[0]) {
      return Buffer.from(data.audios[0], 'base64');
    }
    return null;
  } catch {
    return null;
  }
}

// ── Microsoft Edge Free Neural TTS Engine ──
function synthesizeChunk(text: string, voice: string, rate: number): Promise<Buffer> {
  const { locale } = getVoiceLanguageInfo(voice);
  let edgeVoice = voice;

  if (voice.startsWith('sarvam-')) {
    if (voice.includes('aditya') || voice.includes('abhilash') || voice.includes('ashutosh')) {
      edgeVoice = 'hi-IN-MadhurNeural';
    } else if (voice.includes('vidya')) {
      edgeVoice = 'ta-IN-PallaviNeural';
    } else if (voice.includes('rahul')) {
      edgeVoice = 'te-IN-ShrutiNeural';
    } else {
      edgeVoice = 'hi-IN-SwaraNeural';
    }
  }

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wssUrl(), { headers: wsHeaders() });
    const audio: Buffer[] = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.terminate();
        reject(new Error('TTS synthesis timed out'));
      }
    }, SYNTH_TIMEOUT_MS);

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // ignore
      }
      if (err) reject(err);
      else resolve(Buffer.concat(audio));
    };

    ws.on('unexpected-response', (_request, response) => {
      const dateHeader = response.headers['date'];
      const serverTime = typeof dateHeader === 'string' ? parseRfc2616Date(dateHeader) : null;
      if (serverTime != null) {
        clockSkewSeconds = serverTime - Date.now() / 1000;
      }
      response.resume();
      finish(new Error(`TTS 403 (skew corrected)`));
    });

    ws.on('message', (data: Buffer, isBinary: boolean) => {
      if (!isBinary) {
        const s = data.toString('utf8');
        if (s.includes('turn.end')) finish();
        return;
      }
      const buf = data as Buffer;
      const marker = Buffer.from('Path:audio\r\n');
      const idx = buf.indexOf(marker);
      if (idx === -1) return;
      audio.push(buf.subarray(idx + marker.length));
    });

    ws.on('error', (e: Error) => finish(e));
    ws.on('close', () => {
      if (!settled && audio.length > 0) finish();
      else if (!settled) finish(new Error('TTS connection closed'));
    });

    ws.on('open', () => {
      const requestId = randomUUID().replaceAll('-', '');
      const timestamp = new Date().toISOString();
      const configMsg =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: OUTPUT_FORMAT,
              },
            },
          },
        });

      const ssmlRate = rateToSsml(rate);
      const ssml =
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${locale}">` +
        `<voice name="${escXml(edgeVoice)}">` +
        `<prosody rate="${ssmlRate}" pitch="+0Hz">` +
        `${escXml(text)}` +
        `</prosody>` +
        `</voice>` +
        `</speak>`;

      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;

      ws.send(configMsg, (err) => {
        if (err) finish(err);
        else ws.send(ssmlMsg, (err2) => { if (err2) finish(err2); });
      });
    });
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const rawText = (req.query?.text as string) || 'Hello from Watchora';
  const voice = (req.query?.voice as string) || 'en-US-JennyNeural';
  const rate = parseFloat((req.query?.rate as string) || '1.0');

  const sarvamApiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY || 'sk_yaj0g3lw_EmKdN04nBNQnfrzQUfelmgeg';
  const { langCode, isIndian } = getVoiceLanguageInfo(voice);

  try {
    // Translate text if user selected non-English voice and text is in English
    const textToSynthesize = await translateIfNeeded(rawText, langCode, sarvamApiKey);

    let audioBuffer: Buffer | null = null;

    // Use Sarvam AI Bulbul v3 for Indian languages
    if (sarvamApiKey && isIndian) {
      audioBuffer = await synthesizeSarvam(textToSynthesize, voice, rate, sarvamApiKey);
    }

    // Use Microsoft Edge Neural Voice for European/Global languages or fallback
    if (!audioBuffer) {
      audioBuffer = await synthesizeChunk(textToSynthesize, voice, rate);
    }

    const isWav = audioBuffer.slice(0, 4).toString('ascii') === 'RIFF';
    res.setHeader('Content-Type', isWav ? 'audio/wav' : 'audio/mpeg');
    res.setHeader('Content-Length', String(audioBuffer.length));
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.status(200);
    res.end(audioBuffer);
  } catch (err: any) {
    console.error('TTS synthesis error:', err);
    res.status(500).json({ error: 'TTS synthesis failed', details: err?.message || String(err) });
  }
}
