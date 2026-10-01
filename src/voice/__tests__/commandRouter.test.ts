// Unit tests for the deterministic voice command router (v0.4).
// Safety-critical commands must always match locally, never via AI.

import { describe, expect, it } from 'vitest';
import { matchDeterministicCommand } from '../deterministicCommands';
import { CommandRouter } from '../commandRouter';
import { ConfirmationManager } from '../confirmationManager';

describe('deterministic emergency commands', () => {
  it('matches emergency phrases', () => {
    for (const phrase of ['Emergency', 'Watchora emergency', 'Send SOS', 'I need help', 'Call my trusted contact']) {
      const i = matchDeterministicCommand(phrase);
      expect(i?.intent, phrase).toBe('emergency');
      expect(i?.deterministic).toBe(true);
    }
  });

  it('requires confirmation for emergency', () => {
    const router = new CommandRouter();
    const intent = matchDeterministicCommand('Emergency')!;
    expect(router.requiresConfirmation(intent)).toBe(true);
  });

  it('matches cancel emergency', () => {
    expect(matchDeterministicCommand('Cancel emergency')?.intent).toBe('cancel_emergency');
    expect(matchDeterministicCommand('Cancel SOS')?.intent).toBe('cancel_emergency');
  });

  it('matches location sharing', () => {
    expect(matchDeterministicCommand('Send my current location')?.intent).toBe('send_location');
  });
});

describe('deterministic journey commands', () => {
  it('starts a journey with a destination', () => {
    const i = matchDeterministicCommand('Start a safe journey to the railway station')!;
    expect(i.intent).toBe('start_safe_journey');
    expect(i.parameters.destination).toBe('railway station');
  });

  it('requires confirmation when no destination given', () => {
    const i = matchDeterministicCommand('Start a safe journey')!;
    expect(i.requiresConfirmation).toBe(true);
  });

  it('matches safety phrases', () => {
    expect(matchDeterministicCommand('I am safe')?.intent).toBe('i_am_safe');
    expect(matchDeterministicCommand('I am lost')?.intent).toBe('i_am_lost');
    expect(matchDeterministicCommand('I arrived')?.intent).toBe('i_arrived');
    expect(matchDeterministicCommand('Stop my journey')?.intent).toBe('stop_safe_journey');
  });
});

describe('deterministic assist/settings commands', () => {
  it('matches assistance', () => {
    expect(matchDeterministicCommand('Describe what is ahead')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('Read this')?.intent).toBe('read_text');
  });

  it('matches settings', () => {
    expect(matchDeterministicCommand('Check my permissions')?.intent).toBe('permission_status');
    expect(matchDeterministicCommand('Speak slower')?.intent).toBe('speak_slower');
    expect(matchDeterministicCommand('Stop speaking')?.intent).toBe('stop_speech');
    expect(matchDeterministicCommand('Turn hazard vibration on')?.parameters.setting).toBe('hazardVibration');
  });

  it('matches tab navigation', () => {
    expect(matchDeterministicCommand('Open Safe Journey')?.parameters.tab).toBe('journey');
    expect(matchDeterministicCommand('Open settings')?.parameters.tab).toBe('settings');
  });

  it('matches help', () => {
    expect(matchDeterministicCommand('What can I do?')?.intent).toBe('help');
  });

  it('returns null for unknown', () => {
    expect(matchDeterministicCommand('the sky is blue today')).toBeNull();
  });
});

describe('confirmation manager', () => {
  it('routes confirm/cancel to the active request only', () => {
    const cm = new ConfirmationManager();
    let confirmed = 0;
    let cancelled = 0;
    expect(cm.request('emergency', 'Confirm?', () => confirmed++, () => cancelled++)).toBe(true);
    expect(cm.request('emergency', 'second', () => {})).toBe(false); // one at a time
    cm.handleConfirmIntent({ intent: 'confirm', parameters: {}, confidence: 1, requiresConfirmation: false, deterministic: true });
    expect(confirmed).toBe(1);
    cm.handleConfirmIntent({ intent: 'cancel', parameters: {}, confidence: 1, requiresConfirmation: false, deterministic: true });
    expect(cancelled).toBe(0); // already consumed
  });
});

describe('hybrid router (deterministic first, AI never for safety)', () => {
  it('deterministic wins even when the AI parser is present', async () => {
    const aiCalls: string[] = [];
    const router = new CommandRouter({
      aiParser: {
        async parseIntent(t: string) {
          aiCalls.push(t);
          return { intent: 'describe_scene', parameters: {}, confidence: 1, requiresConfirmation: false, deterministic: false };
        },
      },
    });
    const i = await router.route('Emergency');
    expect(i.intent).toBe('emergency');
    expect(i.deterministic).toBe(true);
    expect(aiCalls.length).toBe(0); // AI never consulted for safety
  });

  it('falls back to AI for flexible wording', async () => {
    const router = new CommandRouter({
      aiParser: {
        async parseIntent() {
          return { intent: 'describe_scene', parameters: {}, confidence: 0.9, requiresConfirmation: false, deterministic: false };
        },
      },
    });
    const i = await router.route('please tell me what you can see');
    expect(i.intent).toBe('describe_scene');
    expect(i.deterministic).toBe(false);
  });

  it('returns unknown offline without AI', async () => {
    const router = new CommandRouter({ aiParser: { async parseIntent() { return { intent: 'describe_scene', parameters: {}, confidence: 1, requiresConfirmation: false, deterministic: false }; } }, offline: true });
    const i = await router.route('please tell me what you can see');
    expect(i.intent).toBe('unknown');
  });
});

describe('v0.5 vision coaching + shopping commands', () => {
  it.each([
    ['navigation mode', 'navigation'],
    ['turn on navigation coaching', 'navigation'],
    ['reading mode', 'reading'],
    ['exploration mode', 'exploration'],
    ['shopping mode', 'shopping'],
    ['stop coaching', 'off'],
    ['turn off navigation coaching', 'off'],
  ])('maps "%s" to set_coach_mode(%s)', async (phrase, mode) => {
    const router = new CommandRouter({ aiParser: null });
    const i = await router.route(phrase);
    expect(i.intent).toBe('set_coach_mode');
    expect(i.parameters.mode).toBe(mode);
    expect(i.deterministic).toBe(true);
  });

  it.each(['read this label', 'what does this cost', 'check this product', 'read the barcode'])(
    'maps "%s" to shopping',
    async (phrase) => {
      const router = new CommandRouter({ aiParser: null });
      const i = await router.route(phrase);
      expect(i.intent).toBe('shopping');
      expect(i.deterministic).toBe(true);
    },
  );

  it('never lets coaching phrases touch the safety router', async () => {
    const router = new CommandRouter({ aiParser: null });
    const i = await router.route('stop coaching');
    expect(i.intent).toBe('set_coach_mode');
    expect(i.requiresConfirmation).toBe(false);
  });
});

describe('Sarvam AI voice changing and language switching patterns', () => {
  it('maps voice changing commands to specific Sarvam personas', async () => {
    const router = new CommandRouter({ aiParser: null });

    // Priya (Hindi Female)
    const priya1 = await router.route('change voice to Priya');
    expect(priya1.intent).toBe('change_voice');
    expect(priya1.parameters.voice).toBe('sarvam-priya');

    const priya2 = await router.route('प्रिया की आवाज़');
    expect(priya2.intent).toBe('change_voice');
    expect(priya2.parameters.voice).toBe('sarvam-priya');

    // Aditya (Hindi Male)
    const aditya = await router.route('switch voice to Aditya');
    expect(aditya.intent).toBe('change_voice');
    expect(aditya.parameters.voice).toBe('sarvam-aditya');

    // Kavya (Tamil)
    const kavya = await router.route('குரலை காவ்யா ஆக மாற்று');
    expect(kavya.intent).toBe('change_voice');
    expect(kavya.parameters.voice).toBe('sarvam-kavya');

    // Rahul (Telugu)
    const rahul = await router.route('వాయిస్ రాహుల్ చేయి');
    expect(rahul.intent).toBe('change_voice');
    expect(rahul.parameters.voice).toBe('sarvam-rahul');

    // Shreya (Bengali)
    const shreya = await router.route('change voice to Shreya');
    expect(shreya.intent).toBe('change_voice');
    expect(shreya.parameters.voice).toBe('sarvam-shreya');

    // Pooja (Marathi)
    const pooja = await router.route('पूजा आवाज');
    expect(pooja.intent).toBe('change_voice');
    expect(pooja.parameters.voice).toBe('sarvam-pooja');

    // Simran (Gujarati)
    const simran = await router.route('સિમરન અવાજ');
    expect(simran.intent).toBe('change_voice');
    expect(simran.parameters.voice).toBe('sarvam-simran');

    // Sapna (Kannada)
    const sapna = await router.route('set voice to Sapna');
    expect(sapna.intent).toBe('change_voice');
    expect(sapna.parameters.voice).toBe('sarvam-sapna');

    // Ashutosh
    const ashu = await router.route('आशुतोष की आवाज़');
    expect(ashu.intent).toBe('change_voice');
    expect(ashu.parameters.voice).toBe('sarvam-ashutosh');

    // Generic Sarvam
    const genericSarvam = await router.route('use sarvam voice');
    expect(genericSarvam.intent).toBe('change_voice');
    expect(genericSarvam.parameters.voice).toBe('sarvam-priya');
  });

  it('maps language switching commands across Indic and global languages', async () => {
    const router = new CommandRouter({ aiParser: null });

    // Hindi
    expect((await router.route('switch to hindi')).parameters.value).toBe('hi');
    expect((await router.route('हिंदी में बोलो')).parameters.value).toBe('hi');

    // Tamil
    expect((await router.route('switch to tamil')).parameters.value).toBe('ta');
    expect((await router.route('தமிழில் பேசு')).parameters.value).toBe('ta');

    // Telugu
    expect((await router.route('switch to telugu')).parameters.value).toBe('te');
    expect((await router.route('తెలుగులో మాట్లాడు')).parameters.value).toBe('te');

    // Kannada
    expect((await router.route('switch to kannada')).parameters.value).toBe('kn');
    expect((await router.route('ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡು')).parameters.value).toBe('kn');

    // Malayalam
    expect((await router.route('switch to malayalam')).parameters.value).toBe('ml');

    // Bengali
    expect((await router.route('switch to bengali')).parameters.value).toBe('bn');
    expect((await router.route('বাংলায় কথা বলুন')).parameters.value).toBe('bn');

    // Marathi
    expect((await router.route('switch to marathi')).parameters.value).toBe('mr');
    expect((await router.route('मराठीत बोला')).parameters.value).toBe('mr');

    // Gujarati
    expect((await router.route('switch to gujarati')).parameters.value).toBe('gu');
    expect((await router.route('ગુજરાતીમાં બોલો')).parameters.value).toBe('gu');

    // Spanish
    expect((await router.route('switch to spanish')).parameters.value).toBe('es');
    expect((await router.route('habla espanol')).parameters.value).toBe('es');

    // French
    expect((await router.route('switch to french')).parameters.value).toBe('fr');

    // German
    expect((await router.route('switch to german')).parameters.value).toBe('de');

    // English
    expect((await router.route('switch to english')).parameters.value).toBe('en');
    expect((await router.route('अंग्रेजी में बोलो')).parameters.value).toBe('en');
  });
});

describe('Multilingual deterministic safety, navigation, and camera patterns', () => {
  it('matches multilingual emergency commands', () => {
    // Hindi
    expect(matchDeterministicCommand('आपातकाल')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('मदद करो')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('एसओएस भेजो')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('आपातकाल रद्द करो')?.intent).toBe('cancel_emergency');
    expect(matchDeterministicCommand('मेरी जगह भेजो')?.intent).toBe('send_location');

    // Tamil
    expect(matchDeterministicCommand('அவசரம்')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('உதவி செய்')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('அவசரத்தை ரத்து செய்')?.intent).toBe('cancel_emergency');
    expect(matchDeterministicCommand('இருப்பிடத்தை பகிர்')?.intent).toBe('send_location');

    // Telugu
    expect(matchDeterministicCommand('అత్యవసరం')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('సహాయం చేయండి')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('స్థానాన్ని పంపు')?.intent).toBe('send_location');

    // Bengali
    expect(matchDeterministicCommand('জরুরী')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('সাহায্য করুন')?.intent).toBe('emergency');

    // Spanish
    expect(matchDeterministicCommand('emergencia')?.intent).toBe('emergency');
    expect(matchDeterministicCommand('cancelar emergencia')?.intent).toBe('cancel_emergency');
    expect(matchDeterministicCommand('compartir ubicacion')?.intent).toBe('send_location');
  });

  it('matches multilingual safe journey patterns', () => {
    // Hindi
    expect(matchDeterministicCommand('सुरक्षित यात्रा शुरू करो')?.intent).toBe('start_safe_journey');
    expect(matchDeterministicCommand('यात्रा समाप्त करो')?.intent).toBe('stop_safe_journey');
    expect(matchDeterministicCommand('यात्रा की स्थिति')?.intent).toBe('check_journey');
    expect(matchDeterministicCommand('मैं सुरक्षित हूँ')?.intent).toBe('i_am_safe');
    expect(matchDeterministicCommand('मैं पहुँच गया')?.intent).toBe('i_arrived');
    expect(matchDeterministicCommand('मैं रास्ता भटक गया')?.intent).toBe('i_am_lost');

    // Tamil
    expect(matchDeterministicCommand('பயணத்தை தொடங்கு')?.intent).toBe('start_safe_journey');
    expect(matchDeterministicCommand('பயணத்தை முடி')?.intent).toBe('stop_safe_journey');
    expect(matchDeterministicCommand('நான் பாதுகாப்பாக இருக்கிறேன்')?.intent).toBe('i_am_safe');
    expect(matchDeterministicCommand('வந்துவிட்டேன்')?.intent).toBe('i_arrived');
    expect(matchDeterministicCommand('வழி தவறிவிட்டது')?.intent).toBe('i_am_lost');

    // Telugu
    expect(matchDeterministicCommand('జర్నీ ప్రారంభించు')?.intent).toBe('start_safe_journey');
    expect(matchDeterministicCommand('నేను సురక్షితంగా ఉన్నాను')?.intent).toBe('i_am_safe');
    expect(matchDeterministicCommand('దారి తప్పాను')?.intent).toBe('i_am_lost');

    // Spanish
    expect(matchDeterministicCommand('iniciar viaje seguro')?.intent).toBe('start_safe_journey');
    expect(matchDeterministicCommand('terminar viaje')?.intent).toBe('stop_safe_journey');
    expect(matchDeterministicCommand('estoy a salvo')?.intent).toBe('i_am_safe');
    expect(matchDeterministicCommand('llegue')?.intent).toBe('i_arrived');
    expect(matchDeterministicCommand('estoy perdido')?.intent).toBe('i_am_lost');
  });

  it('matches multilingual assistance, reading, and camera patterns', () => {
    // Hindi
    expect(matchDeterministicCommand('आगे क्या है')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('मेरे आस-पास क्या है')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('यह पढ़ो')?.intent).toBe('read_text');
    expect(matchDeterministicCommand('कैमरा चालू करो')?.intent).toBe('start_camera');
    expect(matchDeterministicCommand('कैमरा बंद करो')?.intent).toBe('stop_camera');
    expect(matchDeterministicCommand('फोटो खींचो')?.intent).toBe('capture_frame');
    expect(matchDeterministicCommand('धीमे बोलो')?.intent).toBe('speak_slower');
    expect(matchDeterministicCommand('तेज़ बोलो')?.intent).toBe('speak_faster');
    expect(matchDeterministicCommand('आवाज़ बंद करो')?.intent).toBe('stop_speech');
    expect(matchDeterministicCommand('फिर से बोलो')?.intent).toBe('repeat');

    // Tamil
    expect(matchDeterministicCommand('முன்னால் என்ன இருக்கிறது')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('இதைப் படி')?.intent).toBe('read_text');
    expect(matchDeterministicCommand('கேமரா தொடங்கு')?.intent).toBe('start_camera');
    expect(matchDeterministicCommand('கேமராவை நிறுத்து')?.intent).toBe('stop_camera');
    expect(matchDeterministicCommand('படம் எடு')?.intent).toBe('capture_frame');

    // Telugu
    expect(matchDeterministicCommand('ముందు ఏముంది')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('ఇది చదువు')?.intent).toBe('read_text');
    expect(matchDeterministicCommand('కెమెరా ఆన్ చేయి')?.intent).toBe('start_camera');

    // Spanish
    expect(matchDeterministicCommand('que hay adelante')?.intent).toBe('describe_scene');
    expect(matchDeterministicCommand('lee esto')?.intent).toBe('read_text');
    expect(matchDeterministicCommand('iniciar camara')?.intent).toBe('start_camera');
    expect(matchDeterministicCommand('detener camara')?.intent).toBe('stop_camera');
    expect(matchDeterministicCommand('tomar foto')?.intent).toBe('capture_frame');
  });

  it('matches multilingual confirmation words', () => {
    expect(matchDeterministicCommand('हाँ')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('ठीक है')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('ஆம்')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('சரி')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('అవును')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('হ্যাঁ')?.intent).toBe('confirm');
    expect(matchDeterministicCommand('sí')?.intent).toBe('confirm');

    expect(matchDeterministicCommand('नहीं')?.intent).toBe('cancel');
    expect(matchDeterministicCommand('रद्द करो')?.intent).toBe('cancel');
    expect(matchDeterministicCommand('இல்லை')?.intent).toBe('cancel');
    expect(matchDeterministicCommand('வద్దు')?.intent).toBe('cancel');
    expect(matchDeterministicCommand('না')?.intent).toBe('cancel');
    expect(matchDeterministicCommand('no')?.intent).toBe('cancel');
  });
});
