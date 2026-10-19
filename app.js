/* ============ data ============ */

const ID_WORDS = [
"password","admin","bismillah","assalamualaikum","waalaikumsalam","sayang","cinta",
"indonesia","jakarta","surabaya","bandung","medan","semarang","makassar","garuda",
"merdeka","pancasila","nusantara","selamat","pagi","sore","malam","kucing","anjing",
"motor","mobil","rumah","keluarga","berkah","alhamdulillah","subhanallah","masyaallah",
"aamiin","insyaallah","ramadhan","lebaran","mudik","jawa","sunda","batak","minang",
"bali","padang","aceh","papua","maluku","lampung","bogor","bekasi","depok","tangerang",
"malang","yogyakarta","jogja","solo","palembang","pontianak","manado","kendari",
"mataram","kupang","ambon","balikpapan","samarinda","cilegon","serang","karawang",
"cirebon","tegal","kudus","madiun","kediri","jember","blitar","tulungagung","ponorogo",
"magetan","nganjuk","bojonegoro","lamongan","mojokerto","pasuruan","probolinggo",
"banyuwangi","aku","kamu","anak","rindu","kasih","bunga","bintang","bulan","matahari",
"cantik","ganteng","kangen","pacar","mantap","kopi","nasi","sate","rendang","bakso",
"ayam","apel","mangga","pisang","durian","gunung","laut","pantai","hutan","langit",
"hujan","angin","api","air","uang","gaji","kerja","kantor","sekolah","kampus","guru",
"buku","meja","pintu","kamar","jalan","jembatan","pasar","toko","masjid","doa","hati",
"mimpi","harapan","cahaya","kuat","indah","baru","besar","kecil","panjang","tinggi",
"manis","hangat","dingin","bersih","sehat","kaya","rajin","pintar","baik","jujur",
"setia","sabar","ikhlas","syukur","rezeki","hidup","lahir","nikah","surga","malaikat",
"dokter","polisi","tentara","pilot","bos","bonus","libur","rapat","proyek","target",
"sukses","menang","juara","bola","renang","lari","musik","lagu","gitar","film",
"sinetron","drakor","anime","game","mobile","legend","sepakbola","basket","catur",
"kakek","nenek","ayah","ibu","bapak","mama","papa","abang","kakak","adik","suami",
"istri","cucu","tetangga","teman","sahabat","januari","februari","maret","april",
"mei","juni","juli","agustus","september","oktober","november","desember",
"senin","selasa","rabu","kamis","jumat","sabtu","minggu",
"dragon","monkey","master","superman","princess","welcome","football","iloveyou",
"letmein","trustno1","sunshine","shadow","michael","jennifer"
];

const ID_NAMES = [
"andi","budi","agus","dewi","rina","siti","putri","nina","ani","ana","fitri","sari",
"rudi","dono","indra","joko","bambang","hendra","yudi","rian","dian","tika","rani",
"maya","lia","rika","lina","desi","yuni","ratna","wulan","intan","ayu","mega","ratu",
"dara","nabila","zahra","farah","nadia","sarah","aisyah","fatimah","khadijah",
"muhammad","ahmad","rizky","fadli","ilham","dimas","bagas","bayu","galih","adit",
"rifki","wahyu","danang","eko","taufik","arif","farhan","hakim","irfan","kusuma",
"lestari","maharani","ningrum","utami","wijaya","santoso","saputra","pratama",
"ramadhan","setiawan","nugroho","hartono","susanto","gunawan","wibowo","kurnia",
"maulana","firmansyah"
];

const COMMON_PASSWORDS = [
"123456","password","123456789","qwerty","12345678","12345","1234567","1234567890",
"letmein","welcome","monkey","dragon","football","abc123","111111","123123","admin",
"admin123","qwerty123","1q2w3e4r","1qaz2wsx","password1","password123","p@ssw0rd",
"passw0rd","iloveyou","princess","sunshine","master","superman","qwertyuiop",
"000000","654321","123321","987654321","1q2w3e","qwe123","asd123","zxc123"
];

const KEYBOARD_ROWS = [
"qwertyuiop","asdfghjkl","zxcvbnm",
"0123456789","abcdefghijklmnopqrstuvwxyz"
];

const LEET_MAP = { "@":"a","4":"a","3":"e","1":"i","!":"i","0":"o","5":"s","$":"s",
"7":"t","+":"t","9":"g","6":"g","8":"b","2":"z","#":"h" };

/* ============ analisis murni (tanpa DOM) ============ */

function detectCharset(pw) {
  const sets = [];
  let size = 0;
  if (/[a-z]/.test(pw)) { sets.push("a–z"); size += 26; }
  if (/[A-Z]/.test(pw)) { sets.push("A–Z"); size += 26; }
  if (/[0-9]/.test(pw)) { sets.push("0–9"); size += 10; }
  if (/[^a-zA-Z0-9]/.test(pw)) { sets.push("simbol"); size += 32; }
  return { sets, size };
}

function leetNormalize(s) {
  return s.toLowerCase().split("").map(c => LEET_MAP[c] || c).join("");
}

function usesLeet(s) {
  return Object.keys(LEET_MAP).some(c => s.includes(c));
}

function findKeyboardWalks(pw) {
  const low = pw.toLowerCase(), out = [];
  for (const row of KEYBOARD_ROWS) {
    for (const seq of [row, row.split("").reverse().join("")]) {
      for (let n = 5; n >= 3; n--) {
        for (let i = 0; i + n <= seq.length; i++) {
          const frag = seq.slice(i, i + n);
          if (low.includes(frag) && !out.some(o => o.frag === frag)) {
            out.push({ frag });
          }
        }
      }
    }
  }
  // Satu region walk hanya dihitung sekali: buang fragmen yang merupakan
  // substring dari fragmen lain yang lebih panjang ("qwert" & "qwer" dari
  // "qwerty" bukan dua temuan terpisah).
  const frags = out.map(o => o.frag).sort((a, b) => b.length - a.length);
  const kept = frags.filter((f, i) =>
    !frags.slice(0, i).some(longer => longer.includes(f)));
  return kept.slice(0, 5).map(frag => ({ frag }));
}

function findSequences(pw) {
  const out = [];
  for (let i = 0; i + 2 < pw.length; i++) {
    const a = pw.charCodeAt(i), b = pw.charCodeAt(i + 1), c = pw.charCodeAt(i + 2);
    const asc = b === a + 1 && c === b + 1, desc = b === a - 1 && c === b - 1;
    const sameClass =
      (a >= 48 && a <= 57 && b >= 48 && b <= 57 && c >= 48 && c <= 57) ||
      (a >= 65 && a <= 90 && b >= 65 && b <= 90 && c >= 65 && c <= 90) ||
      (a >= 97 && a <= 122 && b >= 97 && b <= 122 && c >= 97 && c <= 122);
    if ((asc || desc) && sameClass) {
      let j = i + 3;
      while (j < pw.length && pw.charCodeAt(j) === pw.charCodeAt(j - 1) + (asc ? 1 : -1)) j++;
      const frag = pw.slice(i, j);
      if (!out.some(o => frag.includes(o.frag) || o.frag.includes(frag))) out.push({ frag });
      i = j - 1;
    }
  }
  return out.slice(0, 5);
}

function findRepeats(pw) {
  const out = [];
  const m1 = pw.match(/(.)\1{2,}/g);
  if (m1) m1.slice(0, 5).forEach(f => out.push({ kind: "karakter berulang", frag: f }));
  const m2 = pw.match(/(.{2,4})\1{1,}/g);
  if (m2) m2.slice(0, 5).forEach(f => out.push({ kind: "blok berulang", frag: f }));
  return out.slice(0, 5);
}

function findDictionaryHits(pw) {
  const low = pw.toLowerCase(), norm = leetNormalize(pw), out = [];
  for (const w of ID_WORDS) {
    if (w.length < 4) continue;
    if (low.includes(w) || (usesLeet(pw) && norm.includes(w))) {
      const leet = usesLeet(pw) && !low.includes(w);
      out.push({ word: w, leet });
      if (out.length >= 6) break;
    }
  }
  return out;
}

function findNameHits(pw) {
  const low = pw.toLowerCase(), norm = leetNormalize(pw), out = [];
  for (const n of ID_NAMES) {
    if (n.length < 4) continue;
    if (low.includes(n) || norm.includes(n)) { out.push(n); if (out.length >= 4) break; }
  }
  return out;
}

function findDateHits(pw) {
  const out = [];
  const digits = pw.replace(/\D/g, "");
  const valid = (d, m, y) => d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1950 && y <= 2026;
  for (let i = 0; i + 8 <= digits.length; i++) {
    const s = digits.slice(i, i + 8);
    const d1 = +s.slice(0, 2), m1 = +s.slice(2, 4), y1 = +s.slice(4, 8);
    const y2 = +s.slice(0, 4), m2 = +s.slice(4, 6), d2 = +s.slice(6, 8);
    if (valid(d1, m1, y1)) out.push({ frag: s, fmt: "DDMMYYYY" });
    else if (valid(d2, m2, y2)) out.push({ frag: s, fmt: "YYYYMMDD" });
  }
  for (let i = 0; i + 6 <= digits.length; i++) {
    const s = digits.slice(i, i + 6);
    const d = +s.slice(0, 2), m = +s.slice(2, 4);
    // pivot 50: "98" -> 1998, "25" -> 2025 (tanggal lahir pra-2000 ikut kedeteksi)
    const yy = +s.slice(4, 6), y = yy >= 50 ? 1900 + yy : 2000 + yy;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1950 && y <= 2026 && !out.some(o => o.frag.includes(s) || s.includes(o.frag)))
      out.push({ frag: s, fmt: "DDMMYY" });
  }
  const ym = pw.match(/(19|20)\d{2}/g);
  if (ym) ym.slice(0, 3).forEach(y => { if (!out.some(o => o.frag.includes(y))) out.push({ frag: y, fmt: "tahun" }); });
  return out.slice(0, 4);
}

function analyzePassword(pw) {
  const findings = [];
  const cs = detectCharset(pw);
  const rawBits = pw.length === 0 || cs.size === 0 ? 0 : pw.length * Math.log2(cs.size);
  let penalty = 0;
  let exactCommon = false;

  if (pw.length > 0 && pw.length < 8)
    findings.push({ sev: "warning", text: `Terlalu pendek (${pw.length} karakter, minimum wajar 12).`, penalty: 10 }), penalty += 10;

  const norm = leetNormalize(pw).replace(/[^a-z]/g, "");
  if (COMMON_PASSWORDS.includes(pw.toLowerCase()) || COMMON_PASSWORDS.includes(norm)) {
    exactCommon = true;
    findings.push({ sev: "critical", text: "Termasuk daftar password paling umum di dunia — diasumsikan sudah bocor.", penalty: 0 });
  }

  for (const w of findKeyboardWalks(pw)) {
    findings.push({ sev: "warning", text: `Keyboard walk: "${w.frag}" (pola posisi tombol berurutan).`, penalty: 12 });
    penalty += 12;
  }
  for (const s of findSequences(pw)) {
    findings.push({ sev: "warning", text: `Sekuens berurutan: "${s.frag}".`, penalty: 8 });
    penalty += 8;
  }
  for (const r of findRepeats(pw)) {
    findings.push({ sev: "info", text: `Repetisi (${r.kind}): "${r.frag}".`, penalty: 6 });
    penalty += 6;
  }
  for (const h of findDictionaryHits(pw)) {
    findings.push({
      sev: h.leet ? "warning" : "critical",
      text: `Kata kamus: "${h.word}"${h.leet ? " (disamarkan leetspeak — tetap mudah ditebak)" : ""}.`,
      penalty: h.leet ? 14 : 22
    });
    penalty += h.leet ? 14 : 22;
  }
  for (const n of findNameHits(pw)) {
    findings.push({ sev: "warning", text: `Nama umum: "${n}" (mudah ditebak dari info pribadi).`, penalty: 12 });
    penalty += 12;
  }
  for (const d of findDateHits(pw)) {
    findings.push({ sev: "warning", text: `Pola tanggal: "${d.frag}" (${d.fmt} — kemungkinan tanggal lahir).`, penalty: 16 });
    penalty += 16;
  }

  let adjusted = Math.max(0, rawBits - penalty);
  if (exactCommon) adjusted = 0;

  const label =
    pw.length === 0 ? "—" :
    adjusted < 28 ? "Sangat Lemah" :
    adjusted < 36 ? "Lemah" :
    adjusted < 60 ? "Sedang" :
    adjusted < 80 ? "Kuat" : "Sangat Kuat";

  return { length: pw.length, charset: cs, rawBits, adjustedBits: adjusted, findings, label, penalty };
}

function formatDuration(seconds) {
  if (!isFinite(seconds)) return "∞";
  if (seconds < 1) return "< 1 detik";
  const units = [
    [60, "detik"], [60, "menit"], [24, "jam"], [365.25, "hari"],
    [1000, "tahun"], [1000, "ribu tahun"], [1000, "juta tahun"], [1e15, "miliar tahun"]
  ];
  let v = seconds, u = "detik";
  for (const [f, name] of units) {
    if (v < f || name === "miliar tahun") { u = name; break; }
    v /= f;
  }
  const num = v >= 100 ? Math.round(v).toLocaleString("id-ID") : v.toFixed(v >= 10 ? 1 : 2).replace(".", ",");
  return `${num} ${u}`;
}

function crackTime(bits, ratePerSec) {
  if (bits <= 0) return formatDuration(0.001);
  return formatDuration(Math.pow(2, bits - 1) / ratePerSec);
}

/* ============ UI (browser saja) ============ */

if (typeof document !== "undefined") {
  const $ = id => document.getElementById(id);
  const pwEl = $("pw");

  function render() {
    const pw = pwEl.value;
    const a = analyzePassword(pw);

    $("stLen").textContent = a.length;
    $("stCharset").textContent = a.charset.sets.length ? a.charset.size : "—";
    $("stRaw").textContent = `${Math.round(a.rawBits)} bit`;
    $("stAdj").textContent = `${Math.round(a.adjustedBits)} bit`;

    const chips = $("charsetChips");
    chips.innerHTML = "";
    a.charset.sets.forEach(s => {
      const el = document.createElement("span");
      el.className = "chip";
      el.textContent = s;
      chips.appendChild(el);
    });

    const lbl = $("strengthLabel");
    lbl.textContent = a.label;
    lbl.className = "strength " + (
      a.label === "Sangat Lemah" ? "s1" : a.label === "Lemah" ? "s2" :
      a.label === "Sedang" ? "s3" : a.label === "Kuat" ? "s4" :
      a.label === "Sangat Kuat" ? "s5" : "");
    $("entropyBits").textContent = `${Math.round(a.adjustedBits)} bit`;
    $("meterFill").style.width = `${Math.min(100, a.adjustedBits)}%`;
    $("meterFill").className = lbl.className.replace("strength ", "");

    const fl = $("findings");
    fl.innerHTML = "";
    if (pw.length === 0) {
      fl.innerHTML = '<li class="empty">Ketik password untuk mulai membedah.</li>';
    } else if (a.findings.length === 0) {
      fl.innerHTML = '<li class="clean">✓ Tidak ada pola lemah terdeteksi. Bagus.</li>';
    } else {
      a.findings.forEach(f => {
        const li = document.createElement("li");
        li.className = f.sev;
        li.textContent = f.text;
        fl.appendChild(li);
      });
    }

    const body = $("crackBody");
    body.innerHTML = "";
    [
      ["MD5", "~10 miliar/detik", 1e10],
      ["bcrypt", "~10/detik", 10]
    ].forEach(([name, rate, rps]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><strong>${name}</strong></td><td>${rate}</td><td class="time">${crackTime(a.adjustedBits, rps)}</td>`;
      body.appendChild(tr);
    });
  }

  pwEl.addEventListener("input", render);
  $("toggle").addEventListener("click", () => {
    pwEl.type = pwEl.type === "password" ? "text" : "password";
  });
  $("clear").addEventListener("click", () => { pwEl.value = ""; render(); pwEl.focus(); });
  render();
}

if (typeof module !== "undefined") {
  module.exports = { analyzePassword, crackTime, formatDuration, detectCharset };
}
