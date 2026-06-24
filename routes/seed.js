import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

router.post('/seed-dummy', async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get platforms
    const { rows: platforms } = await client.query('SELECT id, slug FROM platforms ORDER BY id');
    const pMap = {};
    platforms.forEach(p => { pMap[p.slug] = p.id; });

    // ── KPI Targets Jun 2026 ──
    const junTargets = [
      { slug: 'instagram', m: { reach: 50000, impressions: 80000, likes: 3000, comments: 500, shares: 800, profile_visits: 2000, follower_growth: 150 } },
      { slug: 'tiktok', m: { views: 100000, completion_rate: 45, likes: 8000, comments: 1200, shares: 1500, engagement_rate: 8.5 } },
      { slug: 'youtube', m: { views: 15000, watch_time: 800, avg_duration: 180, subscriber_growth: 100, ctr: 12, likes: 1500, comments: 200 } },
      { slug: 'website', m: { organic_traffic: 30000, bounce_rate: 55, conversion_rate: 2.5, avg_time_on_page: 120, likes: 100, comments: 50 } },
      { slug: 'threads', m: { replies_rate: 5, reposts: 200, follower_growth: 80, likes: 1500, comments: 300, engagement_rate: 6.5 } },
    ];
    for (const t of junTargets) {
      for (const [k, v] of Object.entries(t.m)) {
        await client.query(
          `INSERT INTO kpi_targets (platform_id, metric_key, month, year, target_value)
           VALUES ($1, $2, 6, 2026, $3) ON CONFLICT (platform_id, metric_key, month, year) DO UPDATE SET target_value = $3`,
          [pMap[t.slug], k, v]
        );
      }
    }

    // ── KPI Targets Jul 2026 ──
    const julTargets = [
      { slug: 'instagram', m: { reach: 60000, impressions: 95000, likes: 3500, comments: 600, shares: 1000, profile_visits: 2500, follower_growth: 200 } },
      { slug: 'tiktok', m: { views: 120000, completion_rate: 50, likes: 10000, comments: 1500, shares: 2000, engagement_rate: 9.2 } },
      { slug: 'youtube', m: { views: 20000, watch_time: 1000, avg_duration: 200, subscriber_growth: 150, ctr: 14, likes: 2000, comments: 300 } },
      { slug: 'website', m: { organic_traffic: 35000, bounce_rate: 50, conversion_rate: 3.0, avg_time_on_page: 135, likes: 150, comments: 75 } },
      { slug: 'threads', m: { replies_rate: 6, reposts: 300, follower_growth: 120, likes: 2000, comments: 400, engagement_rate: 7.2 } },
    ];
    for (const t of julTargets) {
      for (const [k, v] of Object.entries(t.m)) {
        await client.query(
          `INSERT INTO kpi_targets (platform_id, metric_key, month, year, target_value)
           VALUES ($1, $2, 7, 2026, $3) ON CONFLICT (platform_id, metric_key, month, year) DO UPDATE SET target_value = $3`,
          [pMap[t.slug], k, v]
        );
      }
    }

    // ── 15 Calendar items ──
    const cal = [
      { d: '2026-06-02', p: 'instagram', t: 'Tips Skincare Pagi untuk Pemula', s: 'published', tn: 'casual', st: 'educational', a: 'Rina' },
      { d: '2026-06-04', p: 'tiktok', t: 'Review Produk Facial Wash Viral', s: 'published', tn: 'entertaining', st: 'entertainment', a: 'Bella' },
      { d: '2026-06-07', p: 'youtube', t: 'Tutorial Makeup Natural Sehari-hari', s: 'published', tn: 'professional', st: 'how-to', a: 'Rina' },
      { d: '2026-06-09', p: 'instagram', t: 'Rekomendasi Sunscreen untuk Kulit Berminyak', s: 'published', tn: 'inspirational', st: 'storytelling', a: 'Dinda' },
      { d: '2026-06-11', p: 'threads', t: 'Pengalaman Pakai Retinol 3 Bulan', s: 'published', tn: 'casual', st: 'storytelling', a: 'Bella' },
      { d: '2026-06-14', p: 'website', t: 'Panduan Lengkap Skincare Routine', s: 'published', tn: 'professional', st: 'educational', a: 'Rina' },
      { d: '2026-06-16', p: 'tiktok', t: 'Skincare Dupe Murah Meriah', s: 'published', tn: 'entertaining', st: 'entertainment', a: 'Dinda' },
      { d: '2026-06-19', p: 'instagram', t: 'Kandungan Skincare yang Wajib Dihindari Ibu Hamil', s: 'published', tn: 'inspirational', st: 'educational', a: 'Bella' },
      { d: '2026-06-22', p: 'youtube', t: 'Morning vs Night Routine: Mana Lebih Penting?', s: 'scheduled', tn: 'casual', st: 'educational', a: 'Rina' },
      { d: '2026-06-25', p: 'instagram', t: 'Produk Lokal yang Setara Skincare Impor', s: 'scheduled', tn: 'inspirational', st: 'how-to', a: 'Dinda' },
      { d: '2026-06-28', p: 'tiktok', t: 'Challenge: Skincare 3 Langkah vs 10 Langkah', s: 'scheduled', tn: 'entertaining', st: 'entertainment', a: 'Bella' },
      { d: '2026-07-02', p: 'threads', t: 'Rekomendasi Moisturizer untuk Kulit Kombinasi', s: 'draft', tn: 'casual', st: 'how-to', a: 'Dinda' },
      { d: '2026-07-05', p: 'website', t: 'Fakta & Mitos Skincare yang Perlu Kamu Tahu', s: 'draft', tn: 'professional', st: 'educational', a: 'Rina' },
      { d: '2026-07-08', p: 'instagram', t: 'Seberapa Sering Harus Eksfoliasi?', s: 'draft', tn: 'casual', st: 'educational', a: 'Bella' },
      { d: '2026-07-11', p: 'youtube', t: 'GRWM: Skincare Routine Sebelum Date Night', s: 'draft', tn: 'entertaining', st: 'storytelling', a: 'Dinda' },
    ];
    for (const c of cal) {
      await client.query(
        `INSERT INTO calendar_content (platform, title, brief_objective, brief_key_message, brief_cta, tone, style, scheduled_date, status, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [c.p, c.t, `Edukasi tentang ${c.t.toLowerCase()}`, `${c.t} — konten engaging untuk followers`, 'Save biar gak lupa!', c.tn, c.st, c.d, c.s, c.a]
      );
    }

    // ── Reports & Report Metrics ──
    const dates = ['2026-06-07', '2026-06-14', '2026-06-21', '2026-06-28'];
    const rpt = {
      instagram: [
        { reach: 12000, impressions: 18500, likes: 750, comments: 120, shares: 180, profile_visits: 450, follower_growth: 35 },
        { reach: 13800, impressions: 21000, likes: 890, comments: 145, shares: 210, profile_visits: 520, follower_growth: 42 },
        { reach: 15200, impressions: 23500, likes: 1020, comments: 168, shares: 245, profile_visits: 580, follower_growth: 48 },
        { reach: 16800, impressions: 25800, likes: 1150, comments: 190, shares: 280, profile_visits: 650, follower_growth: 55 },
      ],
      tiktok: [
        { views: 25000, completion_rate: 42, likes: 1800, comments: 280, shares: 350, engagement_rate: 7.8 },
        { views: 28500, completion_rate: 45, likes: 2100, comments: 320, shares: 400, engagement_rate: 8.2 },
        { views: 32000, completion_rate: 48, likes: 2450, comments: 380, shares: 460, engagement_rate: 8.8 },
        { views: 36000, completion_rate: 50, likes: 2800, comments: 420, shares: 520, engagement_rate: 9.3 },
      ],
      youtube: [
        { views: 3500, watch_time: 180, avg_duration: 160, subscriber_growth: 22, ctr: 11, likes: 320, comments: 45 },
        { views: 4200, watch_time: 220, avg_duration: 175, subscriber_growth: 28, ctr: 12, likes: 380, comments: 55 },
        { views: 4800, watch_time: 260, avg_duration: 185, subscriber_growth: 35, ctr: 13, likes: 450, comments: 62 },
        { views: 5500, watch_time: 310, avg_duration: 195, subscriber_growth: 40, ctr: 14, likes: 520, comments: 72 },
      ],
      website: [
        { organic_traffic: 6800, bounce_rate: 58, conversion_rate: 2.2, avg_time_on_page: 105, likes: 22, comments: 10 },
        { organic_traffic: 7500, bounce_rate: 56, conversion_rate: 2.4, avg_time_on_page: 115, likes: 28, comments: 14 },
        { organic_traffic: 8200, bounce_rate: 54, conversion_rate: 2.6, avg_time_on_page: 122, likes: 32, comments: 18 },
        { organic_traffic: 9000, bounce_rate: 52, conversion_rate: 2.8, avg_time_on_page: 130, likes: 38, comments: 22 },
      ],
      threads: [
        { replies_rate: 4.5, reposts: 45, follower_growth: 18, likes: 320, comments: 65, engagement_rate: 5.8 },
        { replies_rate: 5.0, reposts: 55, follower_growth: 22, likes: 380, comments: 78, engagement_rate: 6.2 },
        { replies_rate: 5.5, reposts: 62, follower_growth: 25, likes: 420, comments: 85, engagement_rate: 6.8 },
        { replies_rate: 6.0, reposts: 72, follower_growth: 30, likes: 480, comments: 95, engagement_rate: 7.2 },
      ],
    };

    const { rows: users } = await client.query("SELECT id FROM users WHERE role = 'member' LIMIT 1");
    const uid = users.length ? users[0].id : 1;
    let rc = 0;
    for (const [slug, weeks] of Object.entries(rpt)) {
      for (let w = 0; w < weeks.length; w++) {
        const r = await client.query(
          'INSERT INTO reports (platform_id, report_date, notes, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
          [pMap[slug], dates[w], `Minggu ke-${w + 1} Juni 2026`, uid]
        );
        for (const [k, v] of Object.entries(weeks[w])) {
          await client.query(
            'INSERT INTO report_metrics (report_id, metric_key, value) VALUES ($1, $2, $3) ON CONFLICT (report_id, metric_key) DO UPDATE SET value = $3',
            [r.rows[0].id, k, v]
          );
        }
        rc++;
      }
    }

    // ── Top Contents ──
    const top = [
      { s: 'instagram', t: 'Tips Skincare Pagi untuk Pemula', mk: 'reach', mv: 8500, d: '2026-06-07' },
      { s: 'instagram', t: 'Rekomendasi Sunscreen untuk Kulit Berminyak', mk: 'likes', mv: 1250, d: '2026-06-14' },
      { s: 'tiktok', t: 'Review Produk Facial Wash Viral', mk: 'views', mv: 45000, d: '2026-06-07' },
      { s: 'tiktok', t: 'Skincare Dupe Murah Meriah', mk: 'views', mv: 38000, d: '2026-06-21' },
      { s: 'youtube', t: 'Tutorial Makeup Natural Sehari-hari', mk: 'views', mv: 8500, d: '2026-06-14' },
      { s: 'youtube', t: 'Tutorial Makeup Natural Sehari-hari', mk: 'likes', mv: 680, d: '2026-06-14' },
      { s: 'website', t: 'Panduan Lengkap Skincare Routine', mk: 'organic_traffic', mv: 5200, d: '2026-06-21' },
      { s: 'threads', t: 'Pengalaman Pakai Retinol 3 Bulan', mk: 'likes', mv: 620, d: '2026-06-14' },
    ];
    for (const tc of top) {
      await client.query(
        'INSERT INTO top_contents (platform_id, title, url, metric_key, metric_value, report_date) VALUES ($1, $2, $3, $4, $5, $6)',
        [pMap[tc.s], tc.t, '', tc.mk, tc.mv, tc.d]
      );
    }

    await client.query('COMMIT');
    res.json({ status: 'ok', message: '✅ Seed dummy berhasil!', data: { platforms: platforms.length, kpi_targets: 60, calendar: cal.length, reports: rc, top_contents: top.length } });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed error:', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
    await pool.end();
  }
});

export default router;
