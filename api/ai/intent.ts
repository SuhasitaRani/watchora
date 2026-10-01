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

  const transcript = (body.transcript || '').toLowerCase().trim();

  // Deterministic safe intent routing
  if (transcript.includes('emergency') || transcript.includes('sos')) {
    res.status(200).json({ intent: 'emergency', parameters: {}, confidence: 1.0, requiresConfirmation: true });
    return;
  }
  if (transcript.includes('surroundings') || transcript.includes('around me') || transcript.includes('this room') || transcript.includes('environment')) {
    res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'environment' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('describe') || transcript.includes('what is ahead') || transcript.includes('what do you see')) {
    res.status(200).json({ intent: 'describe_scene', parameters: { mode: 'navigation' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('read') || transcript.includes('text')) {
    res.status(200).json({ intent: 'read_text', parameters: {}, confidence: 0.95, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('journey') || transcript.includes('start trip')) {
    res.status(200).json({ intent: 'start_safe_journey', parameters: {}, confidence: 0.9, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('priya')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-priya' }, confidence: 1.0, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('aditya')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-aditya' }, confidence: 1.0, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('neha')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-neha' }, confidence: 1.0, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('kavya')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-kavya' }, confidence: 1.0, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('rahul')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-rahul' }, confidence: 1.0, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('voice') || transcript.includes('change voice') || transcript.includes('sarvam')) {
    res.status(200).json({ intent: 'change_voice', parameters: { voice: 'sarvam-priya' }, confidence: 0.9, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('hindi')) {
    res.status(200).json({ intent: 'change_setting', parameters: { setting: 'language', value: 'hi' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('tamil')) {
    res.status(200).json({ intent: 'change_setting', parameters: { setting: 'language', value: 'ta' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }
  if (transcript.includes('telugu')) {
    res.status(200).json({ intent: 'change_setting', parameters: { setting: 'language', value: 'te' }, confidence: 0.95, requiresConfirmation: false });
    return;
  }

  res.status(200).json({
    intent: 'unknown',
    parameters: {},
    confidence: 0,
    requiresConfirmation: false,
  });
}
