# Content Ops — Hallo Bunda Internal Tool

Tool internal untuk monitoring, kalender konten (dengan AI brief generator), evaluasi mingguan, dan permintaan konten (design/video). Data performa diinput manual setiap minggu (tidak pakai API platform). Protected dengan login shared password untuk tim.

## Struktur

```
root/       Express API + PostgreSQL + Auth (JWT) — root level
frontend/   React (Vite) + Recharts
```

## Setup Lokal

### 1. Backend (Root)

```bash
npm install
cp .env.example .env
```

Isi `.env`:
- `DATABASE_URL` — connection string PostgreSQL (lokal atau Railway)
- `DEEPSEEK_API_KEY` — API key dari platform.deepseek.com
- `JWT_SECRET` — string random panjang, untuk signing token login
- `APP_PASSWORD` — password yang dipakai tim untuk login ke tool ini
- `FRONTEND_URL` — http://localhost:5173 untuk dev

Jalankan schema database:
```bash
psql $DATABASE_URL -f schema.sql
```

Jalankan server:
```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka http://localhost:5173 — akan diarahkan ke halaman login. Masukkan `APP_PASSWORD` yang sama dengan di backend `.env`.

## Deploy ke Railway

### Backend (Root Level)
1. Buat project baru di Railway (atau gunakan yg sudah ada), connect ke repo GitHub ini
2. Backend auto-terdeteksi karena `package.json` di root repo
3. Add plugin **PostgreSQL** — Railway otomatis isi `DATABASE_URL`
4. Buka tab PostgreSQL → Query, paste isi `schema.sql`, jalankan sekali
5. Tambah environment variables:
   - `DEEPSEEK_API_KEY`
   - `JWT_SECRET` (random string, jangan dipakai ulang dari contoh)
   - `APP_PASSWORD` (password tim, ganti dari default)
   - `FRONTEND_URL` (isi setelah frontend deploy, untuk CORS)
6. Railway auto-detect `npm start`

### Frontend
1. Buat service baru di project yang sama, root directory `/frontend`
2. Set environment variable `VITE_API_URL` ke URL backend Railway (contoh: `https://xxx.up.railway.app/api`)
3. Build command: `npm run build`, start command bisa pakai `npx serve dist` atau static hosting Railway

Setelah frontend punya domain, update `FRONTEND_URL` di backend supaya CORS tidak block.

## Auth

- Satu password shared untuk seluruh tim (bukan akun per-orang). Cocok untuk tim kecil internal, **tidak cocok** kalau butuh audit "siapa input data apa" secara individual.
- Token disimpan di `localStorage` browser, berlaku 7 hari, lalu harus login ulang.
- Kalau password ter-leak, ganti `APP_PASSWORD` di Railway — semua sesi lama otomatis tetap valid sampai expired (token tidak auto-revoke). Untuk revoke paksa, ganti juga `JWT_SECRET`.

## Workflow Mingguan (Monitoring)

1. Setiap minggu (misal Jumat), buka tab **Monitoring**
2. Pilih minggu di selector (format ISO week, contoh 2026-W26)
3. Klik **+ Input Data** untuk setiap postingan yang mau dicatat — input manual views/likes/comments/shares
4. Salah input? Klik **Edit** langsung di baris yang sama, tidak perlu hapus dan input ulang
5. Data otomatis muncul di **Evaluasi** untuk dibandingkan antar minggu

## Catatan Penting

- **Input manual, bukan real-time.** Data valid sampai input minggu berikutnya. Jangan treat ini sebagai live dashboard.
- **AI Brief Generator** pakai DeepSeek API — setiap generate = 1 API call berbayar. Cek usage di platform.deepseek.com kalau biaya naik.
- **Jangan commit file `.env`** ke git — sudah di `.gitignore`, tapi cek manual sebelum push pertama kali.
- **Kalau API key DeepSeek pernah ter-paste di tempat publik (chat, dokumen, screenshot)**, regenerate key baru di dashboard DeepSeek dan update `.env` — jangan terus pakai key yang sudah pernah terekspos.
