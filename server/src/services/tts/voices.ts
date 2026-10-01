// Curated TTS voice catalog: the languages that matter most for Watchora's
// users (all major Indian languages + the world's widely-spoken languages),
// each with a male + female neural voice from Microsoft's free edge-tts service.
// The live list is refreshed on demand and cached; the curated list is the
// offline/fallback catalog so voice selection always works.

import { fetchVoiceList, type EdgeVoice } from './edge-tts.js';

export interface VoiceOption {
  shortName: string;
  locale: string;
  language: string; // English label
  native: string; // native label
  gender: 'Male' | 'Female';
}

// Fallback catalog — verified against the live voices endpoint (2026-08-06).
// [locale, language, native, female, male]
const CURATED: Array<[string, string, string, string, string]> = [
  ['en-US', 'English (US)', 'English (US)', 'en-US-JennyNeural', 'en-US-GuyNeural'],
  ['en-GB', 'English (UK)', 'English (UK)', 'en-GB-LibbyNeural', 'en-GB-RyanNeural'],
  ['en-IN', 'English (India)', 'English (India)', 'en-IN-NeerjaNeural', 'en-IN-PrabhatNeural'],
  ['en-AU', 'English (Australia)', 'English (Australia)', 'en-AU-NatashaNeural', 'en-AU-WilliamNeural'],
  ['hi-IN', 'Hindi', 'हिन्दी', 'hi-IN-SwaraNeural', 'hi-IN-MadhurNeural'],
  ['ta-IN', 'Tamil', 'தமிழ்', 'ta-IN-PallaviNeural', 'ta-IN-ValluvarNeural'],
  ['te-IN', 'Telugu', 'తెలుగు', 'te-IN-ShrutiNeural', 'te-IN-MohanNeural'],
  ['kn-IN', 'Kannada', 'ಕನ್ನಡ', 'kn-IN-SapnaNeural', 'kn-IN-GaganNeural'],
  ['ml-IN', 'Malayalam', 'മലയാളം', 'ml-IN-SobhanaNeural', 'ml-IN-MidhunNeural'],
  ['bn-IN', 'Bengali', 'বাংলা', 'bn-IN-TanishaaNeural', 'bn-IN-BashkarNeural'],
  ['gu-IN', 'Gujarati', 'ગુજરાતી', 'gu-IN-DhwaniNeural', 'gu-IN-NiranjanNeural'],
  ['mr-IN', 'Marathi', 'मराठी', 'mr-IN-AarohiNeural', 'mr-IN-ManoharNeural'],
  ['ur-IN', 'Urdu', 'اردو', 'ur-IN-GulNeural', 'ur-IN-SalmanNeural'],
  ['vi-VN', 'Vietnamese', 'Tiếng Việt', 'vi-VN-HoaiMyNeural', 'vi-VN-NamMinhNeural'],
  ['es-ES', 'Spanish (Spain)', 'Español', 'es-ES-ElviraNeural', 'es-ES-AlvaroNeural'],
  ['es-MX', 'Spanish (Mexico)', 'Español (MX)', 'es-MX-DaliaNeural', 'es-MX-JorgeNeural'],
  ['fr-FR', 'French', 'Français', 'fr-FR-DeniseNeural', 'fr-FR-HenriNeural'],
  ['de-DE', 'German', 'Deutsch', 'de-DE-KatjaNeural', 'de-DE-ConradNeural'],
  ['it-IT', 'Italian', 'Italiano', 'it-IT-ElsaNeural', 'it-IT-DiegoNeural'],
  ['pt-BR', 'Portuguese (Brazil)', 'Português', 'pt-BR-FranciscaNeural', 'pt-BR-AntonioNeural'],
  ['ru-RU', 'Russian', 'Русский', 'ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural'],
  ['ar-SA', 'Arabic', 'العربية', 'ar-SA-ZariyahNeural', 'ar-SA-HamedNeural'],
  ['zh-CN', 'Chinese (Mandarin)', '中文', 'zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural'],
  ['ja-JP', 'Japanese', '日本語', 'ja-JP-NanamiNeural', 'ja-JP-KeitaNeural'],
  ['ko-KR', 'Korean', '한국어', 'ko-KR-SunHiNeural', 'ko-KR-InJoonNeural'],
  ['nl-NL', 'Dutch', 'Nederlands', 'nl-NL-ColetteNeural', 'nl-NL-MaartenNeural'],
  ['tr-TR', 'Turkish', 'Türkçe', 'tr-TR-EmelNeural', 'tr-TR-AhmetNeural'],
  ['th-TH', 'Thai', 'ไทย', 'th-TH-PremwadeeNeural', 'th-TH-NiwatNeural'],
  ['id-ID', 'Indonesian', 'Bahasa Indonesia', 'id-ID-GadisNeural', 'id-ID-ArdiNeural'],
  ['fil-PH', 'Filipino', 'Filipino', 'fil-PH-BlessicaNeural', 'fil-PH-AngeloNeural'],
  ['ms-MY', 'Malay', 'Bahasa Melayu', 'ms-MY-YasminNeural', 'ms-MY-OsmanNeural'],
  ['sw-KE', 'Swahili', 'Kiswahili', 'sw-KE-ZuriNeural', 'sw-KE-RafikiNeural'],
];

const SARVAM_VOICES: VoiceOption[] = [
  { shortName: 'sarvam-priya', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'प्रिया (हिन्दी)', gender: 'Female' },
  { shortName: 'sarvam-aditya', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'आदित्य (हिन्दी)', gender: 'Male' },
  { shortName: 'sarvam-neha', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'नेहा (हिन्दी)', gender: 'Female' },
  { shortName: 'sarvam-ashutosh', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'आशुतोष (हिन्दी)', gender: 'Male' },
  { shortName: 'sarvam-kavya', locale: 'ta-IN', language: 'Tamil (Sarvam AI)', native: 'காவ்யா (தமிழ்)', gender: 'Female' },
  { shortName: 'sarvam-rahul', locale: 'te-IN', language: 'Telugu (Sarvam AI)', native: 'రాహుల్ (తెలుగు)', gender: 'Male' },
  { shortName: 'sarvam-sapna', locale: 'kn-IN', language: 'Kannada (Sarvam AI)', native: 'ಸಪ್ನಾ (ಕನ್ನಡ)', gender: 'Female' },
  { shortName: 'sarvam-sobhana', locale: 'ml-IN', language: 'Malayalam (Sarvam AI)', native: 'ശോഭന (മലയാളം)', gender: 'Female' },
  { shortName: 'sarvam-midhun', locale: 'ml-IN', language: 'Malayalam (Sarvam AI)', native: 'മിഥുൻ (മലയാളം)', gender: 'Male' },
  { shortName: 'sarvam-shreya', locale: 'bn-IN', language: 'Bengali (Sarvam AI)', native: 'শ্রেয়া (বাংলা)', gender: 'Female' },
  { shortName: 'sarvam-pooja', locale: 'mr-IN', language: 'Marathi (Sarvam AI)', native: 'पूजा (मराठी)', gender: 'Female' },
  { shortName: 'sarvam-simran', locale: 'gu-IN', language: 'Gujarati (Sarvam AI)', native: 'સિમરન (ગુજરાતી)', gender: 'Female' },
  { shortName: 'sarvam-gurpreet', locale: 'pa-IN', language: 'Punjabi (Sarvam AI)', native: 'ਗੁਰਪ੍ਰੀਤ (ਪੰਜਾਬੀ)', gender: 'Female' },
  { shortName: 'sarvam-soumya', locale: 'od-IN', language: 'Odia (Sarvam AI)', native: 'ସୌମ୍ୟା (ଓଡ଼ିଆ)', gender: 'Female' },
];

export function curatedVoices(): VoiceOption[] {
  const out: VoiceOption[] = [...SARVAM_VOICES];
  for (const [locale, language, native, female, male] of CURATED) {
    out.push({ shortName: female, locale, language, native, gender: 'Female' });
    out.push({ shortName: male, locale, language, native, gender: 'Male' });
  }
  return out;
}

/** Default voice per language (female unless unavailable). */
export function defaultVoiceFor(locale: string): string {
  if (locale.startsWith('hi')) return 'sarvam-priya';
  if (locale.startsWith('ta')) return 'sarvam-kavya';
  if (locale.startsWith('te')) return 'sarvam-rahul';
  if (locale.startsWith('kn')) return 'sarvam-sapna';
  if (locale.startsWith('ml')) return 'sarvam-sobhana';
  if (locale.startsWith('bn')) return 'sarvam-shreya';
  if (locale.startsWith('mr')) return 'sarvam-pooja';
  if (locale.startsWith('gu')) return 'sarvam-simran';
  if (locale.startsWith('pa')) return 'sarvam-gurpreet';
  if (locale.startsWith('od')) return 'sarvam-soumya';
  const row = CURATED.find(([l]) => l === locale);
  return row?.[3] ?? 'en-US-JennyNeural';
}

/** Locale from a voice short name (e.g. hi-IN-SwaraNeural -> hi-IN, sarvam-priya -> hi-IN). */
export function localeFromVoice(shortName: string): string {
  if (shortName.startsWith('sarvam-')) {
    if (shortName.includes('kavya')) return 'ta-IN';
    if (shortName.includes('rahul')) return 'te-IN';
    if (shortName.includes('sapna')) return 'kn-IN';
    if (shortName.includes('sobhana') || shortName.includes('midhun')) return 'ml-IN';
    if (shortName.includes('shreya')) return 'bn-IN';
    if (shortName.includes('pooja')) return 'mr-IN';
    if (shortName.includes('simran')) return 'gu-IN';
    if (shortName.includes('gurpreet')) return 'pa-IN';
    if (shortName.includes('soumya')) return 'od-IN';
    return 'hi-IN';
  }
  const m = /^([a-z]{2}-[A-Z]{2})/.exec(shortName);
  return m?.[1] ?? 'en-US';
}

let cachedLive: VoiceOption[] | null = null;
let cachedAt = 0;

/** Merges the live voice list (all locales) with the curated catalog. */
export async function getAllVoices(): Promise<VoiceOption[]> {
  const curated = curatedVoices();
  try {
    if (cachedLive && Date.now() - cachedAt < 60 * 60 * 1000) return cachedLive;
    const live = await fetchVoiceList();
    const seen = new Set(curated.map((v) => v.shortName));
    const extra: VoiceOption[] = [];
    for (const v of live) {
      if (seen.has(v.ShortName)) continue;
      const locale = localeFromVoice(v.ShortName);
      const curatedRow = CURATED.find(([l]) => l === locale);
      extra.push({
        shortName: v.ShortName,
        locale,
        language: curatedRow?.[1] ?? locale,
        native: curatedRow?.[2] ?? locale,
        gender: v.Gender === 'Male' ? 'Male' : 'Female',
      });
      seen.add(v.ShortName);
    }
    const merged = [...curated, ...extra].sort((a, b) => a.language.localeCompare(b.language) || a.shortName.localeCompare(b.shortName));
    cachedLive = merged;
    cachedAt = Date.now();
    return merged;
  } catch {
    return curated; // offline fallback
  }
}
