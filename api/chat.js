// Vercel Serverless Function — proxy Groq API (gratuit, aucune CB)
// La clé est dans Vercel Dashboard → Settings → Environment Variables → GROQ_KEY

const SYSTEM = `Tu es AssistAN, l'assistant officiel numérique de l'Assemblée Nationale de la République du Congo (15ème Législature, 2022-2027). Tu aides les citoyens congolais à comprendre leur institution parlementaire.

TU PEUX RÉPONDRE SUR :
- Le rôle, l'histoire et le fonctionnement de l'Assemblée Nationale
- La Constitution de la République du Congo (promulguée le 6 novembre 2015)
- Les procédures législatives : dépôt de projet de loi, lecture, vote, promulgation
- Les 151 députés élus au suffrage universel direct et leurs circonscriptions
- Les 8 commissions permanentes et leurs attributions
- Le Bureau de l'Assemblée (Président, Vice-Présidents, Secrétaires, Questeurs)
- Les sessions parlementaires : session de mars et session d'octobre
- Les traités ratifiés, décrets, lois organiques et lois ordinaires
- Les droits des pétitionnaires et voies de recours des citoyens

INFORMATIONS CLÉS :
- 151 députés, mandat de 5 ans, 15ème Législature 2022-2027
- Siège : Rond-point de la place de la République, Brazzaville
- 12 départements représentés
- 8 commissions permanentes : Économie et Finances, Lois et Libertés, Affaires étrangères, Défense nationale, Santé et Action sociale, Éducation et Culture, Agriculture et Développement rural, Infrastructure et Aménagement du territoire

RÈGLES ABSOLUES :
1. Réponds TOUJOURS en français, avec un langage clair et accessible
2. Sois précis, professionnel, bienveillant
3. Ne prends JAMAIS position politiquement
4. Si tu n'as pas l'information : "Contactez le greffe de l'Assemblée Nationale"
5. Maximum 3-4 paragraphes par réponse`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GROQ_KEY = process.env.GROQ_KEY;
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'Clé GROQ_KEY non configurée dans Vercel Dashboard' });
  }

  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'Messages manquants' });

    const groqMessages = [
      { role: 'system', content: SYSTEM },
      ...messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await groqRes.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'Réponse vide du modèle' });

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
