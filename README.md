# Passautopsy

Lab bedah password **100% client-side**: skor entropi, deteksi pola lemah (termasuk kata pasaran Indonesia), dan estimasi waktu brute-force MD5 vs bcrypt — semua dihitung di browser, tidak ada data yang keluar dari perangkat.

## Fitur

- **Analisis real-time**: panjang, charset terdeteksi, entropi mentah & disesuaikan (bit), label kekuatan (Sangat Lemah → Sangat Kuat)
- **Deteksi pola lemah**:
  - Keyboard walk (`qwerty`, `1q2w3e4r`, …)
  - Sekuens berurutan (`abc`, `123`, `cba`, …)
  - Repetisi karakter & blok (`aaa`, `abab`)
  - Leetspeak (`P4ssw0rd` tetap ketahuan)
  - Kata kamus Indonesia (~180 kata: `bismillah`, `sayang`, `cinta`, `indonesia`, …)
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

## Cara kerja (ringkas)

| Komponen | Metode |
|---|---|
| Entropi mentah | `panjang × log₂(ukuran charset terpakai)` |
| Entropi disesuaikan | entropi mentah − penalti per temuan pola (min. 0) |
| Label kekuatan | <28 Sangat Lemah · <36 Lemah · <60 Sedang · <80 Kuat · ≥80 Sangat Kuat |
| Estimasi crack | `2^(bit−1) / hash-per-detik` (rata-rata kasus) |

Setiap temuan pola mengurangi entropi efektif karena pola = ruang pencarian yang jauh lebih kecil dari keyspace penuh.

## Struktur

```
passautopsy/
├── index.html   # UI
├── styles.css   # tema gelap, responsif
└── app.js       # seluruh logika analisis (tanpa dependensi)
```

`app.js` mengekspor `analyzePassword`, `crackTime`, `formatDuration`, `detectCharset` via `module.exports` saat dijalankan di Node — logikanya bisa diuji tanpa browser.

## Privasi

Input password tidak pernah dikirim ke mana pun. Tidak ada analytics, tidak ada request jaringan. Verifikasi sendiri: buka DevTools → tab Network, ketik password, tidak ada request keluar.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
