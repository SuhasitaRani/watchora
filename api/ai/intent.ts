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

  const rawTranscript = (body.transcript || '').trim();
  const transcript = rawTranscript.toLowerCase();

  if (!transcript) {
    res.status(200).json({ intent: 'unknown', parameters: {}, confidence: 0, requiresConfirmation: false });
    return;
  }

  // 1. Direct Multilingual Deterministic Intent Routing
  // Emergency / SOS
  if (
    hasMatch(transcript, [
      'emergency', 'sos', 'help me', 'need help',
      'आपातकाल', 'आपातकालीन', 'मदद', 'बचाओ', 'madad', 'bachao', 'aapatkal',
      'அவசரம்', 'உதவி', 'காப்பாற்று', 'avasaram', 'udavi', 'kaapatru',
      'అత్యవసరం', 'సహాయం', 'atyavasaram', 'sahayam',
      'জরুরী', 'সাহায্য', 'joruri',
      'मदत करा', 'कટોકટી', 'મદદ', 'emergencia', 'socorro'
    ])
  ) {
    if (hasMatch(transcript, ['cancel', 'stop', 'रद्द', 'ரத்து', 'రద్దు', 'বাতিল', 'थांबवा', 'radd'])) {
      res.status(200).json({ intent: 'cancel_emergency', parameters: {}, confidence: 1.0, requiresConfirmation: true });
      return;
    }
    res.status(200).json({ intent: 'emergency', parameters: {}, confidence: 1.0, requiresConfirmation: true });
    return;
  }

  // Safe Journey
  if (
    hasMatch(transcript, [
      'safe journey', 'start journey', 'start trip', 'begin journey',
      'यात्रा शुरू', 'सफर शुरू', 'yatra shuru', 'safar shuru',
      'பயணம் தொடங்கு', 'payanam thodangu', 'payanathai thodangu',
      'జర్నీ ప్రారంభించు', 'ప్రయాణం ప్రారంభించు', 'journey prarambhinchu',
      'যাত্রা শুরু', 'প্রবাস सुरू', 'મુસાફરી શરૂ'
    ])
  ) {
    res.status(200).json({ intent: 'start_safe_journey', parameters: {}, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  if (
    hasMatch(transcript, [
      'stop journey', 'end journey', 'stop safe journey',
      'यात्रा समाप्त', 'यात्रा रोको', 'yatra roko', 'yatra samapt',
      'பயணத்தை முடி', 'payanam mudi',
      'జర్నీ ఆపు', 'journey aapu', 'प्रवास थांबवा', 'મુસાફરી સમાપ્ત'
    ])
  ) {
    res.status(200).json({ intent: 'stop_safe_journey', parameters: {}, confidence: 0.95, requiresConfirmation: true });
    return;
  }

  if (
    hasMatch(transcript, [
      'i am safe', "i'm safe", 'i arrived', 'arrived safely',
      'मैं सुरक्षित हूँ', 'सुरक्षित हूँ', 'पहुँच गया', 'surakshit hun', 'pahunch gaya',
      'பாதுகாப்பாக இருக்கிறேன்', 'வந்துவிட்டேன்', 'vandhuvitten',
      'నేను చేరుకున్నాను', 'సురక్షితంగా ఉన్నాను', 'cherukunnanu',
      'আমি নিরাপদ', 'मी सुरक्षित आहे'
    ])
  ) {
    res.status(200).json({ intent: 'i_am_safe', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  // Sarvam AI Voice Changing
  const sarvamPersonas = [
    { names: ['priya', 'प्रिया'], voice: 'sarvam-priya' },
    { names: ['aditya', 'आदित्य'], voice: 'sarvam-aditya' },
    { names: ['neha', 'नेहा'], voice: 'sarvam-neha' },
    { names: ['ashutosh', 'आशुतोष'], voice: 'sarvam-ashutosh' },
    { names: ['kavya', 'காவ்யா'], voice: 'sarvam-kavya' },
    { names: ['rahul', 'రాహుల్'], voice: 'sarvam-rahul' },
    { names: ['sapna', 'ಸಪ್ನಾ'], voice: 'sarvam-sapna' },
    { names: ['sobhana', 'ശോഭന'], voice: 'sarvam-sobhana' },
    { names: ['midhun', 'മിഥുൻ'], voice: 'sarvam-midhun' },
    { names: ['shreya', 'শ্রেয়া'], voice: 'sarvam-shreya' },
    { names: ['pooja', 'पूजा'], voice: 'sarvam-pooja' },
    { names: ['simran', 'સિમરન'], voice: 'sarvam-simran' },
    { names: ['gurpreet', 'ਗੁਰਪ੍ਰੀਤ'], voice: 'sarvam-gurpreet' },
    { names: ['soumya', 'ସୌମ୍ୟା'], voice: 'sarvam-soumya' },
  ];

  for (const p of sarvamPersonas) {
    if (hasMatch(transcript, p.names)) {
      res.status(200).json({ intent: 'change_voice', parameters: { voice: p.voice }, confidence: 1.0, requiresConfirmation: false });
      return;
    }
  }

  if (hasMatch(transcript, ['sarvam voice', 'sarvam ai', 'change voice', 'switch voice', 'सर्वम आवाज', 'குரல் மாற்று', 'వాయిస్ మార్చు'])) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-priya' }, confidence: 0.9, requiresConfirmation: false });
    return;
  }

  // Language Switching
  const languageMappings = [
    { triggers: ['hindi', 'हिंदी', 'हिन्दी'], lang: 'hi' },
    { triggers: ['tamil', 'தமிழ்', 'தமிழில்'], lang: 'ta' },
    { triggers: ['telugu', 'తెలుగు', 'తెలుగులో'], lang: 'te' },
    { triggers: ['kannada', 'ಕನ್ನಡ'], lang: 'kn' },
    { triggers: ['malayalam', 'മലയാളം'], lang: 'ml' },
    { triggers: ['bengali', 'বাংলা', 'bangla'], lang: 'bn' },
    { triggers: ['marathi', 'मराठी'], lang: 'mr' },
    { triggers: ['gujarati', 'ગુજરાતી'], lang: 'gu' },
    { triggers: ['punjabi', 'ਪੰਜਾਬੀ'], lang: 'pa' },
    { triggers: ['odia', 'ଓଡ଼ିଆ'], lang: 'od' },
    { triggers: ['urdu', 'اردو'], lang: 'ur' },
    { triggers: ['spanish', 'espanol', 'español'], lang: 'es' },
    { triggers: ['french', 'francais', 'français'], lang: 'fr' },
    { triggers: ['german', 'deutsch'], lang: 'de' },
    { triggers: ['english', 'अंग्रेजी'], lang: 'en' },
  ];

  for (const l of languageMappings) {
    if (hasMatch(transcript, l.triggers) && hasMatch(transcript, ['switch', 'speak', 'language', 'change', 'बोलो', 'பேசு', 'మాట్లాడు', 'কথা', 'बोला', 'bol', 'pesu'])) {
      res.status(200).json({ intent: 'change_setting', parameters: { setting: 'language', value: l.lang }, confidence: 1.0, requiresConfirmation: false });
      return;
    }
  }

  // Vision & Surroundings Description
  if (
    hasMatch(transcript, [
      'surroundings', 'around me', 'this room', 'environment',
      'आस-पास', 'आस पास', 'माहौल', 'aas paas', 'kya hai yahan',
      'சுற்றி என்ன', 'சூழ்நிலை', 'sutri enna',
      'చుట్టూ ఏముంది', 'పరిసరాలు', 'chuttu emundhi',
      'চারপাশে কি', 'आजूबाजूला काय', 'આસપાસ શું', 'entorno'
    ])
  ) {
    res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'environment' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  if (
    hasMatch(transcript, [
      'what is ahead', 'what is in front', 'what do you see', 'describe scene', 'describe',
      'आगे क्या है', 'सामने क्या है', 'दिख रहा है', 'aage kya hai', 'samne kya hai', 'kya dikh raha hai',
      'முன்னால் என்ன', 'காட்சி', 'munadi enna', 'munnal enna',
      'ముందు ఏముంది', 'mundhu emundhi',
      'সামনে কি', 'पुढे काय', 'આગળ શું', 'que hay adelante', 'que ves'
    ])
  ) {
    res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'navigation' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  // OCR & Reading
  if (
    hasMatch(transcript, [
      'read this', 'read text', 'read the sign', 'read label', 'read',
      'यह पढ़ो', 'लिखा हुआ पढ़ो', 'पढ़कर सुनाओ', 'पढ़ो', 'padho', 'isko padho',
      'இதைப் படி', 'வாசி', 'idhai padi',
      'ఇది చదువు', 'చదువు', 'idhi chaduvu',
      'লেখাটি পড়ুন', 'हे वाचा', 'આ વાંચો', 'lee esto'
    ])
  ) {
    res.status(200).json({ intent: 'read_text', parameters: {}, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  // Camera Controls
  if (
    hasMatch(transcript, [
      'start camera', 'open camera', 'turn on camera',
      'कैमरा चालू', 'कैमरा खोलो', 'camera chalu', 'camera open',
      'கேமரா தொடங்கு', 'camera on sei',
      'కెమెరా ఆన్', 'camera on cheyi',
      'कॅमेरा सुरू'
    ])
  ) {
    res.status(200).json({ intent: 'start_camera', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  if (
    hasMatch(transcript, [
      'stop camera', 'close camera', 'turn off camera',
      'कैमरा बंद', 'camera band', 'camera off',
      'கேமரா நிறுத்து', 'camera off sei',
      'కెమెరా ఆపు', 'camera aapu',
      'कॅमेरा बंद'
    ])
  ) {
    res.status(200).json({ intent: 'stop_camera', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  if (
    hasMatch(transcript, [
      'take photo', 'take picture', 'capture',
      'फोटो खींचो', 'तस्वीर लो', 'photo khicho', 'tasveer lo',
      'படம் எடு', 'padam edu', 'photo edu',
      'ఫోటో తీయి', 'photo theeyi',
      'ছবি তুলুন', 'फोटो काढा'
    ])
  ) {
    res.status(200).json({ intent: 'capture_frame', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  // Navigation & Direction
  if (
    hasMatch(transcript, [
      'where am i', 'my location',
      'मैं कहाँ हूँ', 'मेरी लोकेशन', 'main kahan hun', 'meri location',
      'நான் எங்கே இருக்கிறேன்', 'engae irukiren',
      'నేను ఎక్కడ ఉన్నాను', 'ekkada unnanu',
      'আমি কোথায়', 'मी कुठे आहे', 'donde estoy'
    ])
  ) {
    res.status(200).json({ intent: 'start_navigation', parameters: { query: 'where' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  // Help
  if (hasMatch(transcript, ['help', 'what can i do', 'commands', 'मदद', 'सहायता', 'உதவி', 'సహాయం', 'ayuda'])) {
    res.status(200).json({ intent: 'help', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  // 2. Sarvam / Gemini Translation Fallback for Complex Phrases
  const sarvamApiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY;
  if (sarvamApiKey && transcript.length > 2) {
    try {
      const transRes = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': sarvamApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: rawTranscript,
          source_language_code: 'auto',
          target_language_code: 'en-IN',
          speaker_gender: 'Female',
          mode: 'formal',
          model: 'mayura:v1',
        }),
      });

      if (transRes.ok) {
        const transData = (await transRes.json()) as { translated_text?: string };
        const english = (transData.translated_text || '').toLowerCase();
        if (english && english !== transcript) {
          if (english.includes('emergency') || english.includes('help me') || english.includes('save me')) {
            res.status(200).json({ intent: 'emergency', parameters: {}, confidence: 0.95, requiresConfirmation: true });
            return;
          }
          if (english.includes('ahead') || english.includes('in front') || english.includes('what do you see')) {
            res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'navigation' }, confidence: 0.9, requiresConfirmation: false });
            return;
          }
          if (english.includes('surroundings') || english.includes('around me') || english.includes('room')) {
            res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'environment' }, confidence: 0.9, requiresConfirmation: false });
            return;
          }
          if (english.includes('read') || english.includes('text') || english.includes('label')) {
            res.status(200).json({ intent: 'read_text', parameters: {}, confidence: 0.9, requiresConfirmation: false });
            return;
          }
          if (english.includes('journey') || english.includes('trip') || english.includes('travel')) {
            res.status(200).json({ intent: 'start_safe_journey', parameters: {}, confidence: 0.9, requiresConfirmation: false });
            return;
          }
        }
      }
    } catch {
      // Continue to default unknown
    }
  }

  res.status(200).json({
    intent: 'unknown',
    parameters: {},
    confidence: 0,
    requiresConfirmation: false,
  });
}

function hasMatch(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k.toLowerCase()));
}
