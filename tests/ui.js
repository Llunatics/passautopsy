/* Uji interaksi UI passautopsy via jsdom: ketik password -> render DOM,
   klik toggle & clear. BUKAN cek statis. */
"use strict";
const assert = require("assert");
const path = require("path");
let JSDOM;
try {
  ({ JSDOM } = require("jsdom"));
} catch (e) {
  console.error("Butuh jsdom untuk uji UI: jalankan `npm i -D jsdom` dulu.");
  process.exit(2);
}

(async () => {
  const root = path.resolve(__dirname, "..");
  const file = "file://" + path.join(root, "index.html");
  const dom = await JSDOM.fromFile(path.join(root, "index.html"), {
    url: file, runScripts: "dangerously", resources: "usable"
  });
  await new Promise(res => {
    if (dom.window.document.readyState === "complete") return res();
    dom.window.addEventListener("load", res);
    setTimeout(res, 3000);
  });
  const { document } = dom.window;
  const $ = id => document.getElementById(id);
  let n = 0;
  const ok = (c, name) => { n++; assert(c, "GAGAL UI: " + name); console.log("ok", n + ":", name); };

  const type = pw => {
    $("pw").value = pw;
    $("pw").dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  };

  // 1. ketik password lemah -> label + temuan muncul
  type("Kucing123");
  ok($("strengthLabel").textContent === "Sangat Lemah", "label Sangat Lemah, dapat " + $("strengthLabel").textContent);
  ok($("stLen").textContent === "9", "stLen 9");
  ok($("entropyBits").textContent.includes("bit"), "entropyBits terisi");
  ok($("findings").children.length >= 2, "temuan >= 2, dapat " + $("findings").children.length);
  ok($("crackBody").children.length === 2, "tabel crack 2 baris (MD5 + bcrypt)");
  ok($("crackBody").textContent.includes("MD5") && $("crackBody").textContent.includes("bcrypt"), "baris MD5/bcrypt ada");
  ok($("charsetChips").children.length === 3, "chip charset 3 (a-z, A-Z, 0-9)");

  // 2. ketik password kuat -> bersih
  type("k7#Qm2$vL9@nX4!");
  ok($("strengthLabel").textContent === "Sangat Kuat", "label Sangat Kuat");
  ok($("findings").textContent.includes("Tidak ada pola lemah"), "pesan bersih muncul");
  ok(parseFloat($("meterFill").style.width) > 90, "meter hampir penuh, dapat " + $("meterFill").style.width);

  // 3. password umum -> 0 bit + temuan critical
  type("password123");
  ok($("stAdj").textContent === "0 bit", "entropi disesuaikan 0 bit");
  ok($("findings").querySelector(".critical") !== null, "temuan critical ada");

  // 4. XSS: password berisi tag script tidak dieksekusi / tidak jadi HTML
  type("<img src=x onerror=alert(1)>\"test");
  const liCount = $("findings").querySelectorAll("script").length;
  ok(liCount === 0, "tidak ada <script> ter-inject di findings");
  ok(!$("findings").innerHTML.includes("<img"), "payload tidak jadi elemen HTML");

  // 5. toggle show/hide
  ok($("pw").type === "password", "awal type=password");
  $("toggle").click();
  ok($("pw").type === "text", "toggle -> text");
  $("toggle").click();
  ok($("pw").type === "password", "toggle lagi -> password");

  // 6. clear
  $("clear").click();
  ok($("pw").value === "" && $("strengthLabel").textContent === "—", "clear mengosongkan + label —");
  ok($("findings").textContent.includes("Ketik password"), "pesan kosong muncul");

  console.log("\n" + n + " asersi UI lolos.");
})().catch(e => { console.error(e); process.exit(1); });
