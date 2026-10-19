/* Uji regresi passautopsy — node tests/run.js (tanpa dependensi) */
"use strict";
const assert = require("assert");
const { analyzePassword, crackTime, formatDuration } = require("../app.js");

const texts = pw => analyzePassword(pw).findings.map(f => f.text);
let n = 0;
const ok = (cond, name) => { n++; assert(cond, "GAGAL: " + name); console.log("ok", n + ":", name); };

// 1. keyboard walk: satu region dihitung sekali, bukan berlipat
{
  const w = texts("Qwerty!xZ4#9wW").filter(t => t.startsWith("Keyboard walk"))
    .map(t => t.match(/"([^"]+)"/)[1]);
  ok(w.length === 2, "walk 'qwerty' -> 2 temuan maksimal, dapat " + w.length);
  ok(w.includes("qwert") && w.includes("werty"), "fragmen maksimal dipertahankan");
  const sub = w.some((f, i) => w.some((g, j) => i !== j && g !== f && g.includes(f)));
  ok(!sub, "tidak ada fragmen yang substring dari temuan lain");
}

// 2. dua walk terpisah tetap dihitung dua-duanya
{
  const w = texts("qwertyPOIUYx9#kLm").filter(t => t.startsWith("Keyboard walk"));
  ok(w.length >= 2, "dua region walk terpisah tetap terdeteksi");
}

// 3. DDMMYY pra-2000 (pivot 50) kedeteksi
{
  const t = texts("lahir150898.").join("\n");
  ok(t.includes("150898") && t.includes("DDMMYY"), "DDMMYY 15-08-1998 kedeteksi");
}

// 4. DDMMYY 2000-an tetap kedeteksi (tidak regresi)
{
  const t = texts("pin150825.").join("\n");
  ok(t.includes("150825") && t.includes("DDMMYY"), "DDMMYY 15-08-2025 tetap kedeteksi");
}

// 5. password umum -> entropi disesuaikan 0
ok(analyzePassword("password123").adjustedBits === 0, "password umum -> 0 bit");

// 6. leetspeak kamus Indonesia tetap ketahuan
{
  const t = texts("s4y4ngK4mu.").join("\n");
  ok(t.includes("sayang") && t.includes("leetspeak"), "leetspeak 's4y4ng' -> kamus 'sayang'");
}

// 7. sekuens & repetisi
ok(texts("abcXYZ99.").some(t => t.includes("Sekuens")), "sekuens 'abc' kedeteksi");
ok(texts("aaabbb12.").some(t => t.includes("Repetisi")), "repetisi 'aaa' kedeteksi");

// 8. nama umum Indonesia
ok(texts("BudiSantoso1.").some(t => t.includes("budi") || t.includes("santoso")),
   "nama umum kedeteksi");

// 9. password kuat tanpa pola -> bersih
{
  const a = analyzePassword("k7#Qm2$vL9@nX4!");
  ok(a.findings.length === 0, "password acak 14 char tanpa temuan");
  ok(a.label === "Sangat Kuat", "label Sangat Kuat, dapat " + a.label);
}

// 10. password kosong
{
  const a = analyzePassword("");
  ok(a.label === "—" && a.adjustedBits === 0, "password kosong aman");
}

// 11. estimasi crack
ok(crackTime(0, 1e10) === "< 1 detik", "0 bit -> < 1 detik");
ok(formatDuration(90).includes("menit"), "90 detik -> menit");
ok(formatDuration(1e12).includes("tahun"), "1e12 detik -> tahun");

console.log("\n" + n + " asersi lolos.");
