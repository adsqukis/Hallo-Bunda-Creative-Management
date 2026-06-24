import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const TONE_OPTIONS = ['professional', 'casual', 'entertaining', 'inspirational'];
const STYLE_OPTIONS = ['educational', 'storytelling', 'how-to', 'entertainment', 'news'];

// POST generate brief via DeepSeek
// body: { platform, topik, tone, style }
router.post('/generate', async (req, res) => {
  try {
    const { platform, topik, tone, style } = req.body;

    if (!platform || !topik || !tone || !style) {
      return res.status(400).json({ error: 'Platform, topik, tone, dan style wajib diisi' });
    }

    if (!TONE_OPTIONS.includes(tone)) {
      return res.status(400).json({ error: `Tone tidak valid. Pilihan: ${TONE_OPTIONS.join(', ')}` });
    }
    if (!STYLE_OPTIONS.includes(style)) {
      return res.status(400).json({ error: `Style tidak valid. Pilihan: ${STYLE_OPTIONS.join(', ')}` });
    }

    const prompt = `Buatkan brief konten media sosial untuk platform ${platform} dengan topik: "${topik}".

Tone: ${tone}
Style: ${style}

Output HARUS dalam format JSON murni seperti ini, tanpa markdown, tanpa backtick, tanpa teks tambahan:
{
  "objective": "tujuan konten ini, 1-2 kalimat",
  "key_message": "pesan utama yang ingin disampaikan, 1-2 kalimat",
  "cta": "call to action, 1 kalimat singkat"
}`;

    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Kamu adalah content strategist yang membuat brief konten media sosial singkat dan actionable. Selalu balas dalam JSON murni sesuai format yang diminta.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rawText = response.data.choices[0].message.content;

    // Bersihkan kemungkinan markdown fences sebelum parse JSON
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let brief;
    try {
      brief = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Gagal parse JSON dari DeepSeek:', rawText);
      return res.status(502).json({ error: 'AI mengembalikan format tidak terduga, coba generate ulang' });
    }

    res.json({
      objective: brief.objective || '',
      key_message: brief.key_message || '',
      cta: brief.cta || '',
      tone,
      style,
      platform,
      topik
    });
  } catch (err) {
    console.error('DeepSeek API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gagal generate brief dari AI. Cek API key atau coba lagi.' });
  }
});

router.get('/options', (req, res) => {
  res.json({ tone: TONE_OPTIONS, style: STYLE_OPTIONS });
});

export default router;
