# Passautopsy

Lab bedah password **100% client-side**: skor entropi, deteksi pola lemah (termasuk kata pasaran Indonesia), dan estimasi waktu brute-force MD5 vs bcrypt — semua dihitung di browser, tidak ada data yang keluar dari perangkat.

## Fitur

- **Analisis real-time**: panjang, charset terdeteksi, entropi mentah & disesuaikan (bit), label kekuatan (Sangat Lemah → Sangat Kuat)
- **Deteksi pola lemah**:
  - Keyboard walk (`qwerty`, `1q2w3e4r`, …)
  - Sekuens berurutan (`abc`, `123`, `cba`, …)
  - Repetisi karakter & blok (`aaa`, `abab`)
  - Leetspeak (`P4ssw0rd` tetap ketahuan)
  - Kata kamus Indonesia (~240 kata: `bismillah`, `sayang`, `cinta`, `indonesia`, …)
  - Nama umum Indonesia (~80 nama)
  - Tanggal lahir (`DDMMYYYY`, `YYYYMMDD`, `DDMMYY`, tahun 19xx/20xx)
  - Daftar password paling umum (entropi disesuaikan → 0)
- **Estimasi brute-force**: tabel MD5 (~10 miliar hash/detik) vs bcrypt (~10 hash/detik) dari entropi yang disesuaikan

## Cara pakai

Buka `index.html` di browser — tidak perlu build, tidak perlu server.

```bash
# atau serve lokal
python3 -m http.server 8000
# buka http://localhost:8000
```

## Tes

```bash
node tests/run.js   # 28 asersi logika, tanpa dependensi
node tests/ui.js    # 19 asersi interaksi UI sungguhan (butuh jsdom: npm i -D jsdom)
```

Mencakup regresi deteksi (keyboard walk, sekuens, repetisi, leetspeak, kamus, nama, tanggal, password umum) dan kewarasan estimasi waktu.

## Cara kerja (ringkas)

| Komponen | Metode |
|---|---|
| Entropi mentah | `panjang × log₂(ukuran charset terpakai)` |
| Entropi disesuaikan | entropi mentah − penalti per temuan pola (min. 0); penalti repetisi **berskala dengan panjang** (tiap karakter berulang di luar unit pertama ≈ 0 bit nyata) |
| Label kekuatan | <28 Sangat Lemah · <36 Lemah · <60 Sedang · <80 Kuat · ≥80 Sangat Kuat |
| Estimasi crack | `2^(bit−1) / hash-per-detik` (rata-rata kasus) |

Setiap temuan pola mengurangi entropi efektif karena pola = ruang pencarian yang jauh lebih kecil dari keyspace penuh.

Dua perilaku penalti diperketat pada audit 2026-10-19: fragmen keyboard walk yang tumpang tindih dihitung **sekali per region** (bukan per potongan 3–5 huruf), dan DDMMYY memakai **pivot 50** (`98` → 1998) sehingga tanggal lahir pra-2000 ikut terdeteksi.

## Struktur

```
passautopsy/
├── index.html   # UI
├── styles.css   # tema gelap, responsif
├── app.js       # seluruh logika analisis (tanpa dependensi)
└── tests/
    └── run.js   # uji regresi node (17 asersi)
```

`app.js` mengekspor `analyzePassword`, `crackTime`, `formatDuration`, `detectCharset` via `module.exports` saat dijalankan di Node — logikanya bisa diuji tanpa browser.

## Privasi

Input password tidak pernah dikirim ke mana pun. Tidak ada analytics, tidak ada request jaringan. Verifikasi sendiri: buka DevTools → tab Network, ketik password, tidak ada request keluar.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
