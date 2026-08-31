# sisy — Developer Brief

**Dari:** Fine
**Tujuan:** Mengubah dua mockup (landing page + app dashboard) menjadi website yang benar-benar bisa dipakai, di atas backend Motion (https://github.com/x-cookie/motion).
**Lampiran:** `sisy-landing.jsx` (landing, final design), `sisy-app.jsx` (dashboard, final design). Keduanya adalah *referensi visual dan interaksi* — bukan production code. Struktur komponen, token warna, copy, dan behavior-nya diikuti; implementasinya ditulis ulang dengan pola production di bawah.

---

## 1. Gambaran besar

Motion adalah task manager Python: CLI + TUI + REST API (FastAPI) + WebSocket, storage SQLite, **tanpa web UI**. Kita membangun web front-end bernama **sisy** di atasnya.

Ada tiga bagian kerja:

1. **Deploy backend** — server Motion jalan di internet dengan data persisten.
2. **Landing page** — halaman marketing statis (port dari `sisy-landing.jsx`).
3. **Web app** — dashboard yang konsumsi REST API + WebSocket Motion (port dari `sisy-app.jsx`).

**Keputusan yang sudah diambil:** fase pertama ini adalah **single-user** — instance pribadi yang bisa diakses dari mana saja. Motion memang didesain single-user (satu API key global, tidak ada konsep akun). Multi-user = fase 2, di luar scope brief ini. Jangan mencoba menambahkan auth per-user sekarang.

---

## 2. Arsitektur

```
Browser
  │
  ├── / (landing)            → Next.js, static
  ├── /app/*  (dashboard)    → Next.js, client components
  │        │
  │        └── fetch /api/motion/*  ──► Next.js Route Handler (proxy)
  │                                        │  + header X-API-Key dari env
  │                                        ▼
  │                                  Motion server (FastAPI)
  │                                  Docker, SQLite di volume persisten
  └── WebSocket /api/motion/ws  ──► (lihat catatan WS di §5)
```

**Prinsip terpenting: API key TIDAK PERNAH sampai ke browser.** Semua request dari client lewat route handler Next.js yang menempelkan key dari environment variable server. Kalau key ada di bundle JS client, siapa pun bisa baca dan tulis seluruh task — anggap ini bug kritis.

### Stack

- Next.js 14+ (App Router), TypeScript, Tailwind — stack standar kita.
- TanStack Query untuk data fetching/cache.
- Framer Motion (`motion/react`) untuk animasi landing — mockup pakai CSS murni dan itu boleh dipertahankan, tapi Framer lebih maintainable untuk sequence hero.
- Deploy front-end: Vercel.
- Deploy backend: **Fly.io** (butuh persistent volume untuk SQLite + long-running process + WebSocket — tiga hal yang Vercel tidak bisa). Alternatif setara: VPS + docker compose + Caddy. Pilih yang kamu paling nyaman maintain.

---

## 3. Fase 0 — Deploy backend Motion (estimasi: setengah hari)

1. Clone repo Motion. Repo sudah punya `Dockerfile` dan `docker-compose.yaml`.
2. Deploy ke Fly.io:
   - Buat app + volume persisten, mount ke path tempat Motion menyimpan file SQLite (cek config/env Motion untuk lokasi DB — ada di dokumentasi repo).
   - Set API key via secret.
   - Health check ke endpoint API-nya.
3. Verifikasi dari luar: `curl` list tasks dengan header API key → 200; tanpa key → 401.
4. Verifikasi WebSocket bisa connect dari luar (pakai `wscat` atau sejenisnya).
5. Catat base URL — jadi `MOTION_API_URL` di env front-end.

**Acceptance:** server restart tidak menghilangkan data (test: buat task, restart machine, task masih ada). Ini membuktikan volume-nya benar.

⚠️ Baca `docs/API.md` di repo Motion sebelum mulai Fase 2 — daftar endpoint, shape response, dan protokol WebSocket semuanya di sana. Jangan menebak endpoint dari mockup; sample data di mockup itu karangan.

---

## 4. Fase 1 — Scaffold + Landing (estimasi: 1–2 hari)

### Setup

- `create-next-app` dengan TypeScript + Tailwind.
- Pindahkan design tokens: kedua file mockup punya objek `T = {...}` di bagian atas (warna, font stack). Jadikan CSS variables di `globals.css` + extend di `tailwind.config`. **Satu sumber kebenaran** — landing dan app harus baca token yang sama.
- Fonts: mockup pakai stack sistem (Palatino/Georgia + system sans + mono). Untuk produksi ganti via `next/font`:
  - Serif display: **Fraunces** (atau Instrument Serif)
  - Sans: **Inter**
  - Mono: **JetBrains Mono**

### Landing (`/`)

Port `sisy-landing.jsx` apa adanya secara visual. Komponen-komponennya:

| Bagian | Catatan implementasi |
|---|---|
| Boulder scroll-progress | Scroll listener → posisi + rotasi dot. Client component kecil, `passive: true`. |
| Hero + mask reveal | Line-mask reveal per baris headline. Konten harus tetap terbaca tanpa JS (jangan render `opacity:0` di server). |
| Pemandangan bukit (Scene) | SVG inline, parallax dari scrollY. `pointer-events: none`, `aria-hidden`. |
| Ring carousel 3D | 12 kartu, rotasi kanan→kiri 44s, pause on hover, `backface-visibility: hidden`. Kartu berisi mini-UI dengan `setInterval` (timer, schedule) → wajib `"use client"`. |
| Marquee | CSS infinite scroll, konten diduplikasi 2×, mask gradient di tepi. |
| Feature rows | 3 baris berselang-seling, reveal dari kiri/kanan via IntersectionObserver (atau Framer `whileInView`). |
| Typed terminal | Baris muncul bertahap saat in-view. |
| CTA malam (SceneNight) | SVG statis + bintang berkedip. |

**Wajib:** semua animasi respect `prefers-reduced-motion` (sudah dicontohkan di mockup — pertahankan). Lighthouse performance ≥ 90 mobile.

**SEO:** metadata + OG image, dan seluruh copy ter-render di HTML awal (SSG). Landing tidak boleh butuh JS untuk menampilkan teks.

**Acceptance:** landing live di Vercel, visual match dengan mockup di Chrome + Safari + mobile, reduced-motion berfungsi, CTA mengarah ke `/app`.

---

## 5. Fase 2 — Web app (estimasi: 3–5 hari)

Port `sisy-app.jsx` menjadi app hidup di `/app`. Ini bagian terbesar.

### 5.1 Proxy layer

Route handler `app/api/motion/[...path]/route.ts`:

- Forward method, path, query, body ke `MOTION_API_URL`.
- Tambah header API key dari `process.env.MOTION_API_KEY`.
- **Whitelist path** yang boleh diproxy (hanya endpoint yang app pakai) — jangan open proxy.
- Karena app ini single-user tapi URL-nya publik, **lindungi `/app` dan proxy-nya** dengan satu lapis auth sederhana: satu shared password via middleware (cookie session) atau Basic Auth. Tanpa ini, siapa pun yang menemukan URL bisa lihat dan edit semua task. Cukup sederhana — ini instance pribadi — tapi wajib ada.

### 5.2 WebSocket

Route handler Vercel tidak bisa proxy WebSocket dengan mulus. Dua opsi, pilih #1 kecuali ada blocker:

1. **Direct WS ke backend** dengan token pendek: client minta token/URL WS dari route handler (setelah lolos auth), lalu connect langsung ke server Motion. Cek dulu bagaimana Motion meng-auth koneksi WS-nya (query param? header?) di `docs/API.md`.
2. **Fallback polling**: TanStack Query `refetchInterval` 5 detik. Kurang elegan tapi cukup untuk v1. Jangan biarkan WebSocket memblokir rilis.

Behavior yang diharapkan: task diubah dari CLI → muncul di web tanpa refresh (atau maksimal 5 detik jika polling). Reconnect dengan exponential backoff kalau koneksi putus, dengan indikator "server connected/disconnected" di sidebar (sudah ada di mockup).

### 5.3 Halaman & komponen

Struktur mengikuti mockup:

- **Layout**: sidebar (Tasks/Gantt/Time + ⌘K + status koneksi) — di mockup tab, di production jadikan **routes** (`/app`, `/app/gantt`, `/app/time`) supaya bisa di-bookmark.
- **ScheduleStrip**: timeline hari ini dari hasil optimizer, garis NOW, bar actual-time di bawah tiap blok. Data start/duration blok berasal dari API — pastikan mapping field-nya benar setelah baca API.md.
- **TaskTable**: kolom PRI / ID / TASK / STATUS / PLANNED / ACTUAL / DUE, checkbox toggle done (optimistic update + rollback on error), klik baris → drawer.
- **Drawer detail**: metadata, dependency list, notes. Notes di Motion adalah markdown → render dengan `react-markdown`, dan buat editable (textarea + save) kalau API-nya mendukung update notes.
- **Gantt**: bar per task lintas hari + garis dependency. Versi mockup (div absolut) cukup, tidak perlu library.
- **Time**: daftar planned vs actual dengan bar rasio.
- **Optimize**: dropdown algoritma + tombol → panggil endpoint optimize → animasikan blok ScheduleStrip ke posisi baru (transition `left`, seperti mockup) → toast hasil.
- **Command palette (⌘K)**: gunakan `cmdk`. Minimal: add task, optimize, navigasi antar halaman, start/stop timer.
- **Add task**: mockup tidak punya form add — tambahkan (dari palette dan tombol "+"): title, priority, planned time, due, dependencies. Field mengikuti apa yang API terima.

### 5.4 Data layer

- Satu modul `lib/motion.ts` berisi typed client untuk semua endpoint (types ditulis manual dari API.md, atau generate dari OpenAPI schema FastAPI kalau tersedia di `/openapi.json` — cek, FastAPI biasanya expose ini).
- TanStack Query: query keys per resource, invalidate setelah mutation, optimistic update untuk toggle status dan timer.
- Error state yang jelas: server down → banner + retry, bukan blank screen.

**Acceptance Fase 2:**
- Login sederhana → lihat task list nyata dari server.
- CRUD task, toggle done, start/stop timer — semua tersimpan di server (verifikasi lewat CLI Motion).
- Optimize mengubah jadwal dan tampilannya beranimasi.
- Perubahan dari CLI muncul di web tanpa refresh (≤ 5 detik).
- ⌘K berfungsi. Keyboard: Esc tutup drawer/palette (sudah di mockup).
- Mobile: sidebar collapse ke ikon, drawer jadi overlay (breakpoint sudah dicontohkan di mockup).

---

## 6. Fase 3 — Polish & rilis (estimasi: 1 hari)

- Rebrand kosmetik: nama "sisy" + prefix ID `SY-` hanya di layer tampilan; jangan fork/rename internal Motion kecuali terpaksa.
- Favicon + OG image (boulder oranye di atas garis — konsisten dengan scroll-progress).
- Error tracking (Sentry) di front-end, uptime monitor ke backend.
- Smoke test terakhir: matikan server Motion → app menampilkan state disconnected dengan baik, tidak crash.

---

## 7. Environment variables

| Var | Di mana | Isi |
|---|---|---|
| `MOTION_API_URL` | Vercel (server-only) | Base URL backend Fly.io |
| `MOTION_API_KEY` | Vercel (server-only) | API key Motion. Jangan pernah `NEXT_PUBLIC_`. |
| `APP_PASSWORD` / secret session | Vercel (server-only) | Untuk gate `/app` |

---

## 8. Di luar scope (jangan dikerjakan sekarang)

- Multi-user / akun / isolasi data — butuh modifikasi motion-core, fase 2 terpisah.
- Drag-to-reschedule di ScheduleStrip (legend mockup menyebutnya; untuk v1 cukup klik → detail).
- Notifikasi, mobile app, integrasi kalender.

## 9. Urutan pengerjaan & komunikasi

Fase 0 → 1 → 2 → 3, total estimasi kasar **6–9 hari kerja**. Setelah Fase 0 selesai, kirim aku base URL + hasil curl. Setelah Fase 1, deploy preview Vercel untuk review visual sebelum lanjut. Kalau ada perbedaan antara mockup dan kenyataan API (pasti ada), keputusan default: **ikuti API, sesuaikan UI**, dan catat perbedaannya biar kita review bareng.
