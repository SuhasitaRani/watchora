// Deterministic command router (v0.4). Safety-sensitive commands are matched
// locally through patterns BEFORE any AI interpretation. This is the layer
// that guarantees emergency/journey commands never depend on a model.

import type { VoiceIntent } from './voiceTypes';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?'"()।॥]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function has(text: string, ...needles: string[]): boolean {
  return needles.some((n) => text.includes(n));
}

/** Extracts a destination from phrases like "to the railway station" or "स्टेशन के लिए". */
function extractDestination(text: string): string {
  const m = /(?:to|toward|towards|के लिए|వరకు)\s+(?:the\s+)?(.+?)(?:\.|$)/.exec(text);
  if (!m) return '';
  const dest = m[1].trim().replace(/^(my|the|a)\s+/, '').trim();
  return dest.length > 0 && dest.length <= 60 ? dest : '';
}

function intent(intent: VoiceIntent['intent'], parameters: VoiceIntent['parameters'] = {}, requiresConfirmation = false, confidence = 0.99): VoiceIntent {
  return { intent, parameters, confidence, requiresConfirmation, deterministic: true };
}

/**
 * Matches a transcript against deterministic patterns. Returns null when no
 * deterministic command matches, so the caller can fall back to AI.
 */
export function matchDeterministicCommand(transcript: string): VoiceIntent | null {
  const t = normalize(transcript);
  if (!t) return null;

  // ── Voice Changing & Sarvam AI Persona Switching ──
  const VOICE_CHANGE_TRIGGERS = [
    'voice', 'change', 'switch', 'set', 'use', 'speak', 'select', 'choose', 'activate', 'talk', 'mode',
    'आवाज़', 'आवाज', 'बोलो', 'बदलो', 'लगाओ', 'करो',
    'குரல்', 'குரலை', 'மாற்று', 'மாத்து', 'பேசு', 'வை',
    'వాయిస్', 'మార్చు', 'మాట్లాడు', 'పెట్టు',
    'ಧ್ವನಿ', 'ಬದಲಾಯಿಸು', 'ಮಾತನಾಡು',
    'ശബ്ദം', 'മാറ്റുക', 'സംസാരിക്കൂ',
    'ভয়েস', 'কণ্ঠ', 'বলুন', 'পরিবর্তন',
    'आवाज', 'बोला', 'बदला',
    'અવાજ', 'બોલો', 'બદલો',
    'voz', 'cambiar', 'habla',
  ];

  if (has(t, 'priya', 'प्रिया') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-priya' }, false, 1);
  }
  if (has(t, 'aditya', 'आदित्य') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-aditya' }, false, 1);
  }
  if (has(t, 'neha', 'नेहा') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-neha' }, false, 1);
  }
  if (has(t, 'ashutosh', 'आशुतोष') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-ashutosh' }, false, 1);
  }
  if (has(t, 'kavya', 'காவ்யா') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-kavya' }, false, 1);
  }
  if (has(t, 'rahul', 'రాహుల్') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-rahul' }, false, 1);
  }
  if (has(t, 'shreya', 'শ্রেয়া') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-shreya' }, false, 1);
  }
  if (has(t, 'pooja', 'पूजा') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-pooja' }, false, 1);
  }
  if (has(t, 'simran', 'સિમરન') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-simran' }, false, 1);
  }
  if (has(t, 'sapna', 'ಸಪ್ನಾ') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-sapna' }, false, 1);
  }
  if (has(t, 'sobhana', 'ശോഭന') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-sobhana' }, false, 1);
  }
  if (has(t, 'midhun', 'മിഥുൻ') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'sarvam-midhun' }, false, 1);
  }
  if (has(t, 'swara', 'स्वरा') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'hi-IN-SwaraNeural' }, false, 1);
  }
  if (has(t, 'madhur', 'मधुर') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'hi-IN-MadhurNeural' }, false, 1);
  }
  if (has(t, 'neerja') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'en-IN-NeerjaNeural' }, false, 1);
  }
  if (has(t, 'prabhat') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'en-IN-PrabhatNeural' }, false, 1);
  }
  if (has(t, 'jenny') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'en-US-JennyNeural' }, false, 1);
  }
  if (has(t, 'guy') && has(t, ...VOICE_CHANGE_TRIGGERS)) {
    return intent('change_voice', { voice: 'en-US-GuyNeural' }, false, 1);
  }
  if (has(t, 'use sarvam voice', 'sarvam voice', 'switch to sarvam', 'sarvam ai voice', 'सर्वम आवाज़', 'सर्वम आवाज')) {
    return intent('change_voice', { voice: 'sarvam-priya' }, false, 1);
  }

  // ── Language Switching (Multilingual Voice Patterns) ──
  if (has(t, 'switch to hindi', 'speak hindi', 'speak in hindi', 'talk in hindi', 'hindi language', 'hindi voice', 'हिंदी में बोलो', 'हिंदी भाषा', 'हिन्दी में बोलो', 'हिन्दी भाषा', 'हिंदी आवाज', 'हिंदी करो')) {
    return intent('change_setting', { setting: 'language', value: 'hi' }, false, 1);
  }
  if (has(t, 'switch to tamil', 'speak tamil', 'speak in tamil', 'tamil language', 'tamil voice', 'தமிழில் பேசு', 'தமிழ் மொழி', 'தமிழ் குரல்', 'तमिल में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'ta' }, false, 1);
  }
  if (has(t, 'switch to telugu', 'speak telugu', 'speak in telugu', 'telugu language', 'telugu voice', 'తెలుగులో మాట్లాడు', 'తెలుగు భాష', 'తెలుగు వాయిస్', 'तेलुगु में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'te' }, false, 1);
  }
  if (has(t, 'switch to kannada', 'speak kannada', 'speak in kannada', 'kannada language', 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡು', 'ಕನ್ನಡ ಭಾಷೆ', 'कन्नड़ में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'kn' }, false, 1);
  }
  if (has(t, 'switch to malayalam', 'speak malayalam', 'speak in malayalam', 'malayalam language', 'മലയാളത്തിൽ സംസാരിക്കൂ', 'മലയാളം ഭാഷ', 'मलयालम में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'ml' }, false, 1);
  }
  if (has(t, 'switch to bengali', 'speak bengali', 'speak in bengali', 'bengali language', 'বাংলায় কথা বলুন', 'বাংলা ভাষা', 'बंगाली में बोलो', 'বাংলা')) {
    return intent('change_setting', { setting: 'language', value: 'bn' }, false, 1);
  }
  if (has(t, 'switch to marathi', 'speak marathi', 'speak in marathi', 'marathi language', 'मराठीत बोला', 'मराठी भाषा', 'मराठी आवाज', 'मराठी मध्ये बोला', 'मराठी')) {
    return intent('change_setting', { setting: 'language', value: 'mr' }, false, 1);
  }
  if (has(t, 'switch to gujarati', 'speak gujarati', 'speak in gujarati', 'gujarati language', 'ગુજરાતીમાં બોલો', 'ગુજરાતી ભાષા', 'गुजराती में बोलो', 'ગુજરાતી')) {
    return intent('change_setting', { setting: 'language', value: 'gu' }, false, 1);
  }
  if (has(t, 'switch to punjabi', 'speak punjabi', 'speak in punjabi', 'punjabi language', 'ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ', 'पंजाबी में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'pa' }, false, 1);
  }
  if (has(t, 'switch to odia', 'speak odia', 'speak in odia', 'odia language', 'ଓଡ଼ିଆରେ କୁହନ୍ତୁ', 'उड़िया में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'od' }, false, 1);
  }
  if (has(t, 'switch to urdu', 'speak urdu', 'speak in urdu', 'urdu language', 'اردو میں بولو', 'उर्दू में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'ur' }, false, 1);
  }
  if (has(t, 'switch to spanish', 'speak spanish', 'speak in spanish', 'habla espanol', 'habla en espanol', 'habla español')) {
    return intent('change_setting', { setting: 'language', value: 'es' }, false, 1);
  }
  if (has(t, 'switch to french', 'speak french', 'speak in french', 'parle francais', 'parle français')) {
    return intent('change_setting', { setting: 'language', value: 'fr' }, false, 1);
  }
  if (has(t, 'switch to german', 'speak german', 'speak in german', 'auf deutsch', 'sprich deutsch')) {
    return intent('change_setting', { setting: 'language', value: 'de' }, false, 1);
  }
  if (has(t, 'switch to italian', 'speak italian', 'parla italiano')) {
    return intent('change_setting', { setting: 'language', value: 'it' }, false, 1);
  }
  if (has(t, 'switch to english', 'speak english', 'speak in english', 'talk in english', 'अंग्रेजी में बोलो', 'अंग्रेज़ी में बोलो')) {
    return intent('change_setting', { setting: 'language', value: 'en' }, false, 1);
  }

  // ── Emergency (highest priority; local, deterministic) ──
  // Cancel must be checked BEFORE the bare emergency match, otherwise
  // "cancel emergency" would match "emergency".
  if (
    has(
      t,
      'cancel emergency',
      'cancel sos',
      'stop emergency',
      'stand down',
      'आपातकाल रद्द करो',
      'एसओएस रद्द करो',
      'आपातकाल रोको',
      'அவசரத்தை ரத்து செய்',
      'ரத்து செய்',
      'அత్యవసర పరిస్థితిని రద్దు చేయి',
      'জরুরী বাতিল',
      'आणीबाणी रद्द करा',
      'કટોકટી રદ કરો',
      'cancelar emergencia',
      'annuler urgence',
    )
  ) {
    return intent('cancel_emergency', {}, true, 1);
  }
  if (
    has(
      t,
      'emergency',
      'send sos',
      'sos',
      'i need help',
      'help me now',
      'call my trusted contact',
      'call trusted contact',
      'आपातकाल',
      'आपातकालीन',
      'मदद करो',
      'मुझे मदद चाहिए',
      'बचाओ',
      'एसओएस',
      'அவசரம்',
      'உதவி செய்',
      'காப்பாற்று',
      'అత్యవసరం',
      'సహాయం చేయండి',
      'জরুরী',
      'সাহায্য করুন',
      'मदत करा',
      'मदत पाहिजे',
      'કટોકટી',
      'મદદ કરો',
      'emergencia',
      'socorro',
    )
  ) {
    return intent('emergency', {}, true, 1);
  }
  if (
    has(
      t,
      'send my current location',
      'send my location',
      'share my location',
      'share location',
      'मेरी जगह भेजो',
      'मेरी लोकेशन भेजो',
      'मेरी स्थिति भेजो',
      'இருப்பிடத்தை பகிர்',
      'స్థానాన్ని పంపు',
      'আমার অবস্থান পাঠান',
      'माझे स्थान पाठवा',
      'મારી જગ્યા મોકલો',
      'compartir ubicacion',
      'compartir mi ubicacion',
    )
  ) {
    return intent('send_location', {}, true, 1);
  }
  if (
    has(
      t,
      'who acknowledged',
      'who acknowledged my sos',
      'who acknowledged my emergency',
      'किसने स्वीकार किया',
      'யார் ஏற்றுக்கொண்டார்',
      'ఎవరు అంగీకరించారు',
    )
  ) {
    return intent('who_acknowledged', {}, false, 1);
  }

  // ── Safe Journey ──
  if (
    has(
      t,
      'start a safe journey',
      'start safe journey',
      'start journey',
      'begin journey',
      'सुरक्षित यात्रा शुरू करो',
      'यात्रा शुरू करो',
      'सफर शुरू करो',
      'பயணத்தை தொடங்கு',
      'பாதுகாப்பான பயணம் தொடங்கு',
      'జర్నీ ప్రారంభించు',
      'సురక్షిత ప్రయాణం',
      'যাত্রা শুরু করুন',
      'प्रवास सुरू करा',
      'મુસાફરી શરૂ કરો',
      'iniciar viaje seguro',
      'iniciar viaje',
    )
  ) {
    const dest = extractDestination(t);
    return intent('start_safe_journey', { destination: dest }, dest ? false : true, 0.99);
  }
  if (
    has(
      t,
      'stop my journey',
      'stop the journey',
      'end journey',
      'end my journey',
      'stop safe journey',
      'यात्रा समाप्त करो',
      'यात्रा रोको',
      'सफर समाप्त करो',
      'பயணத்தை முடி',
      'జర్నీ ఆపు',
      'प्रवास थांबवा',
      'મુસાફરી સમાપ્ત કરો',
      'terminar viaje',
      'parar viaje',
    )
  ) {
    return intent('stop_safe_journey', {}, true, 1);
  }
  if (
    has(
      t,
      'check my journey',
      'journey status',
      'how is my journey',
      'यात्रा की स्थिति',
      'सफर कैसा है',
      'பயண நிலை',
      'జర్నీ స్థితి',
      'estado del viaje',
    )
  ) {
    return intent('check_journey', {}, false, 1);
  }
  if (
    has(
      t,
      'i am safe',
      "i'm safe",
      'i arrived',
      'arrived safely',
      'made it',
      'मैं सुरक्षित हूँ',
      'मैं सुरक्षित हूं',
      'सुरक्षित हूँ',
      'सुरक्षित हूं',
      'पहुँच गया',
      'पहुंच गया',
      'मैं पहुँच गया',
      'நான் பாதுகாப்பாக இருக்கிறேன்',
      'வந்துவிட்டேன்',
      'నేను చేరుకున్నాను',
      'నేను సురక్షితంగా ఉన్నాను',
      'আমি নিরাপদ',
      'আমি পৌঁছেছি',
      'मी सुरक्षित आहे',
      'मी पोहोचलो',
      'હું પહોંચી ગયો',
      'હું સલામત છું',
      'estoy a salvo',
      'llegue',
      'he llegado',
    )
  ) {
    return intent(
      has(t, 'i arrived', 'arrived safely', 'made it', 'पहुँच गया', 'पहुंच गया', 'வந்துவிட்டேன்', 'చేరుకున్నాను', 'পৌঁছেছি', 'पोहोचलो', 'પહોંચી', 'llegue', 'he llegado')
        ? 'i_arrived'
        : 'i_am_safe',
      {},
      false,
      1,
    );
  }
  if (
    has(
      t,
      'i am lost',
      "i'm lost",
      'lost my way',
      'i am confused',
      'help i am lost',
      'मैं रास्ता भटक गया',
      'मैं खो गया',
      'रास्ता भूल गया',
      'வழி தவறிவிட்டது',
      'దారి తప్పాను',
      'আমি হারিয়ে গেছি',
      'मी रस्ता चुकलो',
      'હું ખોવાઈ ગયો',
      'estoy perdido',
      'me perdi',
    )
  ) {
    return intent('i_am_lost', {}, false, 1);
  }

  // ── Vision coaching modes ──
  if (has(t, 'turn off navigation coaching', 'stop navigation coaching', 'disable coaching', 'stop coaching', 'turn off coaching', 'कोचिंग बंद करो')) {
    return intent('set_coach_mode', { mode: 'off' }, false, 1);
  }
  if (has(t, 'navigation mode', 'navigation coaching', 'turn on navigation coaching', 'start coaching', 'start navigation coaching', 'walking mode', 'नेविगेशन मोड')) {
    return intent('set_coach_mode', { mode: 'navigation' }, false, 1);
  }
  if (has(t, 'reading mode', 'text mode', 'रीडिंग मोड', 'पढ़ने का मोड')) {
    return intent('set_coach_mode', { mode: 'reading' }, false, 1);
  }
  if (has(t, 'exploration mode', 'explore mode', 'एक्सप्लोर मोड')) {
    return intent('set_coach_mode', { mode: 'exploration' }, false, 1);
  }
  if (has(t, 'shopping mode', 'शॉपिंग मोड')) {
    return intent('set_coach_mode', { mode: 'shopping' }, false, 1);
  }
  // ── Shopping (before generic "read this") ──
  if (
    has(
      t,
      'read this label',
      'read the label',
      'read this product',
      'read the product',
      'what does this cost',
      'what is the price',
      'check this product',
      'read the barcode',
      'लेबल पढ़ो',
      'कीमत क्या है',
      'दाम बताओ',
      'விலை என்ன',
      'ధర ఎంత',
      'લેબલ વાંચો',
    )
  ) {
    return intent('shopping', {}, false, 1);
  }

  // ── Assistance & Scene Description ──
  if (
    has(
      t,
      'describe my surroundings',
      'describe surroundings',
      'what is around me',
      'what is in this room',
      'tell me about this room',
      'what objects are near',
      'describe environment',
      'surroundings',
      'what is here',
      'मेरे आस-पास क्या है',
      'आस-पास क्या है',
      'आस पास क्या है',
      'माहौल बताओ',
      'आस पास बताओ',
      'कमरे में क्या है',
      'என்னைச் சுற்றி என்ன இருக்கிறது',
      'சூழ்நிலையை விவரி',
      'నా చుట్టూ ఏముంది',
      'పరిసరాలను వివరించు',
      'আমার চারপাশে কি আছে',
      'माझ्या आजूबाजूला काय आहे',
      'મારી આસપાસ શું છે',
      'describe mi entorno',
    )
  ) {
    return intent('describe_scene', { mode: 'environment' }, false, 1);
  }
  if (
    has(
      t,
      'describe what is ahead',
      'what is ahead',
      'what is in front',
      'describe the scene',
      'what do you see',
      'आगे क्या है',
      'सामने क्या है',
      'क्या दिख रहा है',
      'सामने देखो',
      'दृश्य बताओ',
      'आगे का दृश्य',
      'முன்னால் என்ன இருக்கிறது',
      'காட்சியை விவரி',
      'ముందు ఏముంది',
      'ముందున్నది వివరించు',
      'সামনে কি আছে',
      'पुढे काय आहे',
      'આગળ શું છે',
      'que hay adelante',
      'que ves',
    )
  ) {
    return intent('describe_scene', { mode: 'navigation' }, false, 1);
  }
  if (
    has(
      t,
      'read this',
      'read the text',
      'read text',
      'read what is here',
      'read the sign',
      'यह पढ़ो',
      'लिखा हुआ पढ़ो',
      'टेक्स्ट पढ़ो',
      'बोर्ड पढ़ो',
      'पढ़कर सुनाओ',
      'पढ़ो',
      'இதைப் படி',
      'உரையைப் படி',
      'இதை வாசி',
      'ఇది చదువు',
      'టెక్స్ట్ చదువు',
      'লেখাটি পড়ুন',
      'হে वाचा',
      'मजकूर वाचा',
      'આ વાંચો',
      'lee esto',
      'lee el texto',
    )
  ) {
    return intent('read_text', {}, false, 1);
  }
  if (
    has(
      t,
      'find the door',
      'where is the entrance',
      'where is the door',
      'दरवाजा कहाँ है',
      'दरवाजा ढूंढो',
      'கதவு எங்கே',
      'ద్వారం ఎక్కడ',
      'দরজা কোথায়',
      'donde esta la puerta',
    )
  ) {
    return intent('describe_scene', { focus: 'door' }, false, 0.9);
  }

  // ── Navigation ──
  if (has(t, 'navigate to', 'take me to', 'go to', 'navigate', 'रास्ता बताओ', 'ले चलो', 'मार्गदर्शन करो', 'வழி காட்டு', 'దారి చూపు', 'como llegar')) {
    const dest = extractDestination(t);
    return intent('start_navigation', { destination: dest }, false, dest ? 0.95 : 0.8);
  }
  if (has(t, 'how far is', 'distance to', 'which direction is', 'which way is', 'दूरी कितनी है', 'कितनी दूर है')) {
    const dest = extractDestination(t) || t.replace(/.*(?:how far is|distance to|which direction is|which way is|दूरी कितनी है)\s+(?:the\s+)?/, '').trim().slice(0, 40);
    return intent('start_navigation', { destination: dest, query: 'distance' }, false, 0.9);
  }
  if (has(t, 'where am i', 'मैं कहाँ हूँ', 'मेरी लोकेशन क्या है', 'நான் எங்கே இருக்கிறேன்', 'నేను ఎక్కడ ఉన్నాను', 'আমি কোথায়', 'मी कुठे आहे', 'donde estoy')) {
    return intent('start_navigation', { query: 'where' }, false, 0.95);
  }

  // ── Settings / permissions ──
  if (has(t, 'check my permissions', 'permission status', 'permission centre', 'open permission center', 'open permission centre', 'परमिशन स्टेटस', 'अनुमतियां')) {
    return intent('permission_status', {}, false, 1);
  }
  if (has(t, 'speak slower', 'slow down', 'talk slower', 'धीमे बोलो', 'धीरे बोलो', 'आवाज़ धीमी करो', 'மெதுவாகப் பேசு', 'నెమ్మదిగా మాట్లాడు', 'हळू बोला', 'habla mas despacio')) {
    return intent('speak_slower', {}, false, 1);
  }
  if (has(t, 'speak faster', 'talk faster', 'speed up', 'increase speech speed', 'speech speed up', 'तेज़ बोलो', 'जल्दी बोलो', 'आवाज़ तेज़ करो', 'வேகமாகப் பேசு', 'వేగంగా మాట్లాడు', 'जलद बोला', 'habla mas rapido')) {
    return intent('speak_faster', {}, false, 1);
  }
  if (has(t, 'more detail', 'give more details', 'longer answer', 'detailed description', 'विस्तार से बताओ', 'ज्यादा जानकारी')) {
    return intent('more_detail', {}, false, 1);
  }
  if (has(t, 'shorter answer', 'give a shorter answer', 'be brief', 'संक्षेप में बताओ', 'छोटा उत्तर')) {
    return intent('shorter_answer', {}, false, 1);
  }
  if (has(t, 'turn hazard vibration on', 'hazard vibration on', 'vibration on', 'vibration only', 'वाइब्रेशन चालू करो')) {
    return intent('change_setting', { setting: 'hazardVibration', value: true }, false, 1);
  }
  if (has(t, 'turn hazard vibration off', 'hazard vibration off', 'vibration off', 'वाइब्रेशन बंद करो')) {
    return intent('change_setting', { setting: 'hazardVibration', value: false }, false, 1);
  }
  if (has(t, 'voice warnings only', 'voice only', 'voice guidance on')) {
    return intent('change_setting', { setting: 'voiceWarnings', value: true }, false, 1);
  }
  if (has(t, 'turn voice guidance off', 'voice guidance off')) {
    return intent('change_setting', { setting: 'voiceGuidance', value: false }, false, 1);
  }

  // ── Camera controls ──
  if (
    has(
      t,
      'stop camera',
      'turn off camera',
      'close camera',
      'disconnect camera',
      'disable camera',
      'कैमरा बंद करो',
      'कैमरा रोको',
      'கேமராவை நிறுத்து',
      'కెమెరా ఆపు',
      'ক্যামেরা বন্ধ করুন',
      'कॅमेरा बंद करा',
      'કેમેરા બંધ કરો',
      'detener camara',
      'apagar camara',
    )
  ) {
    return intent('stop_camera', {}, false, 1);
  }
  if (
    has(
      t,
      'start camera',
      'open camera',
      'turn on camera',
      'connect camera',
      'enable camera',
      'कैमरा चालू करो',
      'कैमरा खोलो',
      'कैमरा शुरू करो',
      'கேமரா தொடங்கு',
      'కెమెరా ఆన్ చేయి',
      'ক্যামেরা চালু করুন',
      'कॅमेरा सुरू करा',
      'કેમેરા ચાલુ કરો',
      'iniciar camara',
      'abrir camara',
    )
  ) {
    return intent('start_camera', {}, false, 1);
  }
  if (
    has(
      t,
      'capture and analyze',
      'capture frame',
      'capture image',
      'take photo',
      'take picture',
      'analyze this',
      'analyze scene',
      'what do you see',
      'फोटो खींचो',
      'तस्वीर लो',
      'फोटो खींचकर बताओ',
      'படம் எடு',
      'ఫోటో తీయి',
      'ছবি তুলুন',
      'फोटो काढा',
      'ફોટો લો',
      'tomar foto',
    )
  ) {
    return intent('capture_frame', {}, false, 1);
  }

  // ── Theme controls ──
  if (has(t, 'dark mode', 'dark theme', 'switch to dark', 'turn on dark mode', 'डार्क मोड', 'டார்க் மோட்', 'modo oscuro')) {
    return intent('toggle_theme', { theme: 'Dark' }, false, 1);
  }
  if (has(t, 'light mode', 'light theme', 'switch to light', 'turn on light mode', 'लाइट मोड', 'லைட் மோட்', 'modo claro')) {
    return intent('toggle_theme', { theme: 'Light' }, false, 1);
  }

  // ── Open tabs / navigation between screens ──
  if (has(t, 'go home', 'open home', 'open the home screen', 'open dashboard', 'home screen', 'go to home', 'होम स्क्रीन', 'होम खोलो', 'मुखपृष्ठ', 'முகப்பு', 'హోమ్')) {
    return intent('open_tab', { tab: 'home' }, false, 1);
  }
  if (has(t, 'open assist', 'go to assist', 'vision assist', 'assist screen', 'open visual assist', 'असिस्ट', 'विजुअल असिस्ट', 'காட்சி உதவி', 'విజువల్ అసిస్ట్')) {
    return intent('open_tab', { tab: 'tracking' }, false, 1);
  }
  if (has(t, 'open safe journey', 'open journey', 'go to journey', 'safe travel', 'travel mode', 'सुरक्षित यात्रा खोलो', 'பாதுகாப்பான பயணம்')) {
    return intent('open_tab', { tab: 'journey' }, false, 1);
  }
  if (has(t, 'open emergency', 'open sos', 'open safety', 'go to emergency', 'go to sos', 'safety hub', 'आपातकालीन स्क्रीन', 'அவசர திரை')) {
    return intent('open_tab', { tab: 'sos' }, false, 1);
  }
  if (has(t, 'open reading', 'open read', 'go to reading', 'reading mode', 'रीडिंग स्क्रीन')) {
    return intent('open_tab', { tab: 'tracking', mode: 'reading' }, false, 1);
  }
  if (has(t, 'open saved places', 'open places', 'open my places', 'go to saved places', 'my places', 'सहेजे गए स्थान', 'स्थान सूची', 'இடங்கள்')) {
    return intent('open_tab', { tab: 'routes' }, false, 1);
  }
  if (has(t, 'open trusted contacts', 'open contacts', 'open my contacts', 'go to contacts', 'trusted contacts', 'विश्वसनीय संपर्क', 'தொடர்புகள்')) {
    return intent('open_tab', { tab: 'sos', section: 'contacts' }, false, 1);
  }
  if (has(t, 'open settings', 'go to settings', 'app settings', 'preferences', 'सेटिंग्स', 'सेटिंग्स खोलो', 'அமைப்புகள்', 'సెట్టింగ్‌లు', 'ajustes')) {
    return intent('open_tab', { tab: 'settings' }, false, 1);
  }
  if (has(t, 'open community', 'open reports', 'go to community', 'community reports', 'hazard reports', 'कम्युनिटी', 'समुदाय', 'சமூகம்')) {
    return intent('open_tab', { tab: 'community' }, false, 1);
  }
  if (has(t, 'open caregiver', 'go to caregiver', 'caregiver portal', 'caregiver', 'केयरगिवर')) {
    return intent('open_tab', { tab: 'caregiver' }, false, 1);
  }
  if (has(t, 'open admin', 'go to admin', 'admin panel', 'admin dashboard', 'एडमिन')) {
    return intent('open_tab', { tab: 'admin' }, false, 1);
  }
  if (has(t, 'what can i do', 'what can you do', 'help', 'what commands', 'list commands', 'voice commands', 'मदद', 'सहायता', 'क्या कर सकते हो', 'உதவி', 'సహాయం', 'ayuda')) {
    return intent('help', {}, false, 1);
  }

  // ── Account / Logout ──
  if (has(t, 'log out', 'logout', 'sign out', 'signout', 'लॉग आउट', 'வெளியேறு', 'లాగ్ అవుట్', 'cerrar sesion')) {
    return intent('logout', {}, true, 1);
  }

  // ── Saved places / hazards ──
  if (has(t, 'list my saved places', 'list saved places', 'my saved places', 'सहेजे गए स्थान दिखाओ')) {
    return intent('list_places', {}, false, 1);
  }
  if (has(t, 'save this location as', 'save this as', 'save this place', 'यह स्थान सहेजें')) {
    const m = /save this (?:location|place)?\s*(?:as|as my)?\s*(.+?)(?:\.|$)/.exec(t);
    return intent('save_place', { label: m?.[1]?.trim() ?? 'Saved place' }, true, 0.95);
  }
  if (has(t, 'report broken pavement', 'report construction', 'report hazard', 'report a hazard', 'खतरे की सूचना दें')) {
    const cat = has(t, 'broken pavement') ? 'broken-pavement' : has(t, 'construction') ? 'construction' : 'hazard';
    return intent('report_hazard', { category: cat }, true, 0.95);
  }
  if (has(t, 'what hazards are nearby', 'hazards nearby', 'आस-पास क्या खतरे हैं')) {
    return intent('report_hazard', { query: 'nearby' }, false, 0.95);
  }

  // ── Speech control ──
  if (
    has(
      t,
      'stop speaking',
      'be quiet',
      'silence',
      'shut up',
      'चुप रहो',
      'आवाज़ बंद करो',
      'बोलना बंद करो',
      'பேசாதே',
      'அமைதியாக இரு',
      'మాట్లాడటం ఆపు',
      'चुप बसा',
      'silencio',
      'detener voz',
    )
  ) {
    return intent('stop_speech', {}, false, 1);
  }
  if (
    has(
      t,
      'repeat that',
      'repeat last',
      'say that again',
      'repeat the last warning',
      'repeat',
      'फिर से बोलो',
      'दोहराओ',
      'दुबारा बोलो',
      'மீண்டும் சொல்',
      'மறுபடி சொல்',
      'మళ్లీ చెప్పు',
      'पुन्हा सांगा',
      'repite',
    )
  ) {
    return intent('repeat', {}, false, 1);
  }

  // ── Confirmation words ──
  if (
    t === 'confirm' ||
    t === 'yes' ||
    t === 'yeah' ||
    t === 'go ahead' ||
    t === 'ok' ||
    t === 'okay' ||
    t === 'हाँ' ||
    t === 'हां' ||
    t === 'सही है' ||
    t === 'ठीक है' ||
    t === 'ज़रूर' ||
    t === 'जरूर' ||
    t === 'स्वीकार' ||
    t === 'ஆம்' ||
    t === 'சரி' ||
    t === 'అవును' ||
    t === 'సరే' ||
    t === 'হ্যাঁ' ||
    t === 'होय' ||
    t === 'હા' ||
    t === 'sí' ||
    t === 'si' ||
    t === 'oui'
  ) {
    return intent('confirm', {}, false, 1);
  }
  if (
    t === 'cancel' ||
    t === 'no' ||
    t === 'never mind' ||
    t === 'stop' ||
    t === 'नहीं' ||
    t === 'रद्द करो' ||
    t === 'मत करो' ||
    t === 'रद्द' ||
    t === 'இல்லை' ||
    t === 'வேண்டாம்' ||
    t === 'வద్దు' ||
    t === 'లేదు' ||
    t === 'না' ||
    t === 'नाही' ||
    t === 'ના' ||
    t === 'non'
  ) {
    return intent('cancel', {}, false, 1);
  }

  return null;
}
