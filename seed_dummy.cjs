const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get platform IDs
    const { rows: platforms } = await client.query('SELECT id, slug FROM platforms ORDER BY id');
    const pMap = {};
    platforms.forEach(p => { pMap[p.slug] = p.id; });
    console.log('Platforms:', Object.keys(pMap));

    // ── KPI Targets (Jun-Jul 2026) ──
    const targets = [
      // Instagram
      { slug: 'instagram', month: 6, year: 2026, metrics: { reach: 50000, impressions: 80000, likes: 3000, comments: 500, shares: 800, profile_visits: 2000, follower_growth: 150 } },
      { slug: 'instagram', month: 7, year: 2026, metrics: { reach: 60000, impressions: 95000, likes: 3500, comments: 600, shares: 1000, profile_visits: 2500, follower_growth: 200 } },
      // TikTok
      { slug: 'tiktok', month: 6, year: 2026, metrics: { views: 100000, completion_rate: 45, likes: 8000, comments: 1200, shares: 1500, engagement_rate: 8.5 } },
      { slug: 'tiktok', month: 7, year: 2026, metrics: { views: 120000, completion_rate: 50, likes: 10000, comments: 1500, shares: 2000, engagement_rate: 9.2 } },
      // YouTube
      { slug: 'youtube', month: 6, year: 2026, metrics: { views: 15000, watch_time: 800, avg_duration: 180, subscriber_growth: 100, ctr: 12, likes: 1500, comments: 200 } },
      { slug: 'youtube', month: 7, year: 2026, metrics: { views: 20000, watch_time: 1000, avg_duration: 200, subscriber_growth: 150, ctr: 14, likes: 2000, comments: 300 } },
      // Website
      { slug: 'website', month: 6, year: 2026, metrics: { organic_traffic: 30000, bounce_rate: 55, conversion_rate: 2.5, avg_time_on_page: 120, likes: 100, comments: 50 } },
      { slug: 'website', month: 7, year: 2026, metrics: { organic_traffic: 35000, bounce_rate: 50, conversion_rate: 3.0, avg_time_on_page: 135, likes: 150, comments: 75 } },
      // Threads
      { slug: 'threads', month: 6, year: 2026, metrics: { replies_rate: 5, reposts: 200, follower_growth: 80, likes: 1500, comments: 300, engagement_rate: 6.5 } },
      { slug: 'threads', month: 7, year: 2026, metrics: { replies_rate: 6, reposts: 300, follower_growth: 120, likes: 2000, comments: 400, engagement_rate: 7.2 } },
    ];

    for (const t of targets) {
      const pid = pMap[t.slug];
      for (const [key, val] of Object.entries(t.metrics)) {
        await client.query(
          `INSERT INTO kpi_targets (platform_id, metric_key, month, year, target_value)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (platform_id, metric_key, month, year) DO UPDATE SET target_value = $5`,
          [pid, key, t.month, t.year, val]
        );
      }
    }
    console.log('✅ KPI Targets seeded');

    // ── Calendar Content (15 items, Jun-Jul 2026) ──
    const calendarItems = [
      { date: '2026-06-02', platform: 'instagram', title: 'Tips Skincare Pagi untuk Pemula', status: 'published', tone: 'casual', style: 'educational', assignee: 'Rina' },
      { date: '2026-06-04', platform: 'tiktok', title: 'Review Produk Facial Wash Viral', status: 'published', tone: 'entertaining', style: 'entertainment', assignee: 'Bella' },
      { date: '2026-06-07', platform: 'youtube', title: 'Tutorial Makeup Natural Sehari-hari', status: 'published', tone: 'professional', style: 'how-to', assignee: 'Rina' },
      { date: '2026-06-09', platform: 'instagram', title: 'Rekomendasi Sunscreen untuk Kulit Berminyak', status: 'published', tone: 'inspirational', style: 'storytelling', assignee: 'Dinda' },
      { date: '2026-06-11', platform: 'threads', title: 'Pengalaman Pakai Retinol 3 Bulan', status: 'published', tone: 'casual', style: 'storytelling', assignee: 'Bella' },
      { date: '2026-06-14', platform: 'website', title: 'Panduan Lengkap Skincare Routine', status: 'published', tone: 'professional', style: 'educational', assignee: 'Rina' },
      { date: '2026-06-16', platform: 'tiktok', title: 'Skincare Dupe Murah Meriah', status: 'published', tone: 'entertaining', style: 'entertainment', assignee: 'Dinda' },
      { date: '2026-06-19', platform: 'instagram', title: 'Kandungan Skincare yang Wajib Dihindari Ibu Hamil', status: 'published', tone: 'inspirational', style: 'educational', assignee: 'Bella' },
      { date: '2026-06-22', platform: 'youtube', title: 'Morning vs Night Routine: Mana Lebih Penting?', status: 'scheduled', tone: 'casual', style: 'educational', assignee: 'Rina' },
      { date: '2026-06-25', platform: 'instagram', title: 'Produk Lokal yang Setara Skincare Impor', status: 'scheduled', tone: 'inspirational', style: 'how-to', assignee: 'Dinda' },
      { date: '2026-06-28', platform: 'tiktok', title: 'Challenge: Skincare 3 Langkah vs 10 Langkah', status: 'scheduled', tone: 'entertaining', style: 'entertainment', assignee: 'Bella' },
      { date: '2026-07-02', platform: 'threads', title: 'Rekomendasi Moisturizer untuk Kulit Kombinasi', status: 'draft', tone: 'casual', style: 'how-to', assignee: 'Dinda' },
      { date: '2026-07-05', platform: 'website', title: 'Fakta & Mitos Skincare yang Perlu Kamu Tahu', status: 'draft', tone: 'professional', style: 'educational', assignee: 'Rina' },
      { date: '2026-07-08', platform: 'instagram', title: 'Seberapa Sering Harus Eksfoliasi?', status: 'draft', tone: 'casual', style: 'educational', assignee: 'Bella' },
      { date: '2026-07-11', platform: 'youtube', title: 'GRWM: Skincare Routine Sebelum Date Night', status: 'draft', tone: 'entertaining', style: 'storytelling', assignee: 'Dinda' },
    ];

    for (const item of calendarItems) {
      await client.query(
        `INSERT INTO calendar_content (platform, title, brief_objective, brief_key_message, brief_cta, tone, style, scheduled_date, status, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.platform,
          item.title,
          `Mengedukasi audiens tentang ${item.title.toLowerCase()}`,
          `${item.title} — konten informatif dan engaging untuk followers`,
          'Save dulu biar gak lupa!',
          item.tone, item.style, item.date, item.status, item.assignee
        ]
      );
    }
    console.log('✅ Calendar seeded: ' + calendarItems.length + ' items');

    // ── Reports + Report Metrics (weekly for Jun 2026) ──
    const reportDates = ['2026-06-07', '2026-06-14', '2026-06-21', '2026-06-28'];
    const reportData = {
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

    // Get member user ID
    const { rows: users } = await client.query("SELECT id FROM users WHERE role = 'member' LIMIT 1");
    const memberId = users.length > 0 ? users[0].id : 1;

    let reportCount = 0;
    for (const [slug, weeks] of Object.entries(reportData)) {
      const pid = pMap[slug];
      for (let w = 0; w < weeks.length; w++) {
        const r = await client.query(
          `INSERT INTO reports (platform_id, report_date, notes, created_by)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [pid, reportDates[w], `Laporan minggu ke-${w + 1} Juni 2026`, memberId]
        );
        const reportId = r.rows[0].id;
        for (const [key, val] of Object.entries(weeks[w])) {
          await client.query(
            `INSERT INTO report_metrics (report_id, metric_key, value) VALUES ($1, $2, $3)`,
            [reportId, key, val]
          );
        }
        reportCount++;
      }
    }
    console.log('✅ Reports seeded: ' + reportCount + ' reports');

    // ── Top Contents ──
    const topContents = [
      { slug: 'instagram', title: 'Tips Skincare Pagi untuk Pemula', url: '', metric_key: 'reach', metric_value: 8500, date: '2026-06-07' },
      { slug: 'instagram', title: 'Rekomendasi Sunscreen untuk Kulit Berminyak', url: '', metric_key: 'likes', metric_value: 1250, date: '2026-06-14' },
      { slug: 'tiktok', title: 'Review Produk Facial Wash Viral', url: '', metric_key: 'views', metric_value: 45000, date: '2026-06-07' },
      { slug: 'tiktok', title: 'Skincare Dupe Murah Meriah', url: '', metric_key: 'views', metric_value: 38000, date: '2026-06-21' },
      { slug: 'youtube', title: 'Tutorial Makeup Natural Sehari-hari', url: '', metric_key: 'views', metric_value: 8500, date: '2026-06-14' },
      { slug: 'youtube', title: 'Tutorial Makeup Natural Sehari-hari', url: '', metric_key: 'likes', metric_value: 680, date: '2026-06-14' },
      { slug: 'website', title: 'Panduan Lengkap Skincare Routine', url: '', metric_key: 'organic_traffic', metric_value: 5200, date: '2026-06-21' },
      { slug: 'threads', title: 'Pengalaman Pakai Retinol 3 Bulan', url: '', metric_key: 'likes', metric_value: 620, date: '2026-06-14' },
    ];

    for (const tc of topContents) {
      await client.query(
        `INSERT INTO top_contents (platform_id, title, url, metric_key, metric_value, report_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pMap[tc.slug], tc.title, tc.url, tc.metric_key, tc.metric_value, tc.date]
      );
    }
    console.log('✅ Top contents seeded: ' + topContents.length + ' items');

    await client.query('COMMIT');
    console.log('\n🎉 SEED LENGKAP! Semua data dummy berhasil dimasukkan.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
