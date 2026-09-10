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
  if (transcript.includes('describe') || transcript.includes('what is ahead') || transcript.includes('surroundings')) {
    res.status(200).json({ intent: 'describe_scene', parameters: {}, confidence: 0.95, requiresConfirmation: false });
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
  if (transcript.includes('help') || transcript.includes('what can i say')) {
    res.status(200).json({ intent: 'help', parameters: {}, confidence: 1.0, requiresConfirmation: false });
    return;
  }

  res.status(200).json({
    intent: 'unknown',
    parameters: {},
    confidence: 0,
    requiresConfirmation: false,
  });
}
