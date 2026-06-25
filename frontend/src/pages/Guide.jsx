export default function Guide() {
  const sections = [
    {
      title: '📊 Overview',
      role: 'Semua Role',
      desc: 'Dashboard utama yang menampilkan ringkasan performa konten.',
      items: [
        'Akumulasi metrik: total postingan, engagement, reach, follower growth',
        'Line chart tren performa per platform (Instagram, TikTok, YouTube, dll)',
        'Top 5 konten dengan engagement terbaik',
        'Filter tanggal untuk melihat data periode tertentu'
      ]
    },
    {
      title: '📝 Input Laporan',
      role: 'Semua Role',
      desc: 'Form untuk mencatat laporan konten yang sudah dipublikasikan.',
      items: [
        'Pilih platform (Instagram, TikTok, YouTube, Shopee, dll)',
        'Input tanggal posting dan metrik: views, likes, comments, shares, reach',
        'Tandai top content untuk muncul di Overview',
        'Riwayat laporan yang sudah diinput bisa dilihat di tabel bawah'
      ]
    },
    {
      title: '📅 Kalender Konten',
      role: 'Semua Role',
      desc: 'Penjadwalan konten untuk melihat rencana posting harian.',
      items: [
        'Lihat jadwal konten per tanggal',
        'Filter berdasarkan platform dan status',
        'Tambah, edit, atau hapus jadwal konten'
      ]
    },
    {
      title: '📬 Permintaan Konten',
      role: 'Semua Role',
      desc: 'Manajemen request design & video dengan sistem Kanban.',
      items: [
        '3 status: Pending → In Progress → Done',
        'Drag/tombol untuk pindah status',
        'Klik card untuk lihat detail: brief, link referensi, link hasil, catatan',
        'Edit atau hapus permintaan dari detail modal',
        'Buat permintaan baru dengan form lengkap'
      ]
    },
    {
      title: '🎯 KPI',
      role: 'Admin Only',
      desc: 'Perbandingan target KPI bulanan vs capaian aktual per platform.',
      items: [
        'Pilih bulan dan tahun yang ingin dicek',
        'Lihat target vs rata-rata capaian per metrik',
        'Status warna: 🟢 Tercapai, 🟡 Mendekati, 🔴 Tidak tercapai',
        'Digunakan untuk evaluasi performa tiap platform'
      ]
    },
    {
      title: '⚙️ Settings',
      role: 'Admin Only',
      desc: 'Konfigurasi master data aplikasi.',
      items: [
        '🏷️ Target KPI — atur target bulanan per platform',
        '📱 Platform — tambah/edit platform sosial media',
        '👥 Users — kelola akun admin dan member'
      ]
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Panduan Penggunaan</div>
          <h1 className="page-title">Penggunaan Aplikasi</h1>
        </div>
      </div>

      <div className="guide-intro">
        <p><strong>Hallo Bunda Creative Management</strong> adalah aplikasi untuk mengelola operasional konten sosial media — dari perencanaan, eksekusi, laporan, hingga evaluasi KPI.</p>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="card guide-section">
          <div className="guide-section-header">
            <h2 className="guide-section-title">{s.title}</h2>
            <span className={`badge ${s.role === 'Admin Only' ? 'badge-admin' : 'badge-all'}`}>{s.role}</span>
          </div>
          <p className="guide-section-desc">{s.desc}</p>
          <ul className="guide-list">
            {s.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="card guide-section" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
        <h2 className="guide-section-title" style={{ color: 'var(--accent)' }}>💡 Tips</h2>
        <ul className="guide-list">
          <li>Pastikan selalu <strong>Input Laporan</strong> setelah konten dipublikasikan agar data Overview akurat</li>
          <li>Gunakan <strong>Permintaan Konten</strong> untuk tracking design/video yang sedang dikerjakan tim</li>
          <li>Cek <strong>KPI</strong> tiap akhir bulan untuk evaluasi performa platform</li>
          <li>Atur <strong>Target KPI</strong> di Settings setiap awal bulan</li>
        </ul>
      </div>
    </div>
  )
}
