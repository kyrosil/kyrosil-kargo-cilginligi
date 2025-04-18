// --- Oyun Değişkenleri, Ayarları, Ödüller, Metinler ---
let gleen; let kargoPool = []; const MAX_KARGOS = 60;
let score = 0; let misses = 0;
let giftMessage = ''; let gameOver = false; let lives = 3;
let trendyolLogo, kyrosilLogo;
let gameInstanceCanvas; let isVertical = false; let currentLang = 'TR';
let confettiInterval; let finalScore = 0; let confettiFired = false;
const playerWidth = 45; const playerHeight = 15;
const normalKargoBoyutu = 35; const bonusKargoBoyutu = 55;
const canvasBackgroundColor = 248; const playerColor = '#ff6200';
const rewardTiers = { TR: [ { score: 500, amount: "10000 TL" }, { score: 350, amount: "1000 TL" }, { score: 250, amount: "500 TL" }, { score: 100, amount: "250 TL" }, { score: 50, amount: "100 TL" }, { score: 0, amount: null } ], EN: [ { score: 500, amount: "250 Euro" }, { score: 350, amount: "50 Euro" }, { score: 250, amount: "30 Euro" }, { score: 100, amount: "15 Euro" }, { score: 50, amount: "5 Euro" }, { score: 0, amount: null } ] };
const texts = { TR: { gameTitle: "Trendyol Kargo Kapmaca", rewardTitle: "Ödül Baremleri (TL)", pointInfo: "Trendyol Logo: 1 Puan | Kyrosil Logo (Bonus): 5 Puan", europeNote: "", howToPlay: "Günde 3 hakla oyna, 3 kargo kaçırırsan oyun biter!", emailLabel: "Başlamak için E-posta Adresiniz:", emailPlaceholder: "Trendyol E-posta Adresiniz", emailError: "Lütfen geçerli bir e-posta adresi girin.", startBtn: "Başla", restartBtn: "Yeniden Başlat", scoreLabel: "Puan: ", missedLabel: "Kaçırılan: ", livesLabel: "Kalan Hak: ", gameOverBase: "Oyun Bitti!", winMessagePart1: "TEBRİKLER! ", winMessagePart2: " PUAN TOPLAYARAK ", winMessagePart3: " HEDİYE ÇEKİ KAZANDINIZ!", winInstructions: "KODUNUZU ALMAK İÇİN giriş yaptığınız mail ile birlikte\ngiveaways@kyrosil.eu mail adresine ekran görüntüsü ile ulaşınız.\nOrtalama 20 dakika içerisinde otomatik teslim edilecektir.", noMoreLives: "Günlük 3 hakkın bitti! Yarın tekrar dene.", tryAgain: "Tekrar denemek için\n1 hakkını kullan." }, EN: { gameTitle: "Trendyol Cargo Catch", rewardTitle: "Reward Tiers (EUR)", pointInfo: "Trendyol Logo: 1 Point | Kyrosil Logo (Bonus): 5 Points", europeNote: "IMPORTANT: Codes are valid for Trendyol Europe only. Cannot be used in Turkey.", howToPlay: "Play with 3 lives per day. Game over if you miss 3 packages!", emailLabel: "Your E-mail Address to Start:", emailPlaceholder: "Your Trendyol E-mail Address", emailError: "Please enter a valid e-mail address.", startBtn: "Start", restartBtn: "Restart", scoreLabel: "Score: ", missedLabel: "Missed: ", livesLabel: "Lives Left: ", gameOverBase: "Game Over!", winMessagePart1: "CONGRATULATIONS! ", winMessagePart2: " POINTS EARNED YOU A ", winMessagePart3: " GIFT CODE!", winInstructions: "To receive your code, please contact giveaways@kyrosil.eu\nwith a screenshot using the email address you provided.\nDelivery is automated and takes approx. 20 minutes.", noMoreLives: "You've used your 3 lives for today! Try again tomorrow.", tryAgain: "Use 1 life to try again." } };
let bgMusic, catchSound, missSound, gameOverSound, clickSound, winSound;
let soundsLoadedCount = 0; const totalSounds = 6; let isBgMusicPlaying = false;

// --- Yardımcı Fonksiyonlar ---
function checkLives() { console.log("localStorage devre dışı. Haklar 3 olarak ayarlandı."); return 3; }
function updateStoredLives(newLives) { lives = newLives >= 0 ? newLives : 0; }
function updateTexts(lang) { const t = texts[lang]; if (!t) { console.error(`Metinler bulunamadı: ${lang}`); return; } try { document.getElementById('game-title').innerText = t.gameTitle; document.getElementById('rewardTitle').innerText = t.rewardTitle; document.getElementById('pointInfo').innerText = t.pointInfo; document.getElementById('howToPlay').innerText = t.howToPlay; document.getElementById('emailLabel').innerText = t.emailLabel; document.getElementById('emailInput').placeholder = t.emailPlaceholder; document.getElementById('startButton').innerText = t.startBtn; document.getElementById('restartButton').innerText = t.restartBtn; document.getElementById('emailError').innerText = t.emailError; const rewardListEl = document.getElementById('rewardList'); rewardListEl.innerHTML = ''; const currentRewardTiers = rewardTiers[lang]; currentRewardTiers.forEach(tier => { if (tier.amount) { const li = document.createElement('li'); li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`; rewardListEl.appendChild(li); } }); const europeNoteEl = document.getElementById('europeNote'); if (lang === 'EN' && t.europeNote) { europeNoteEl.innerText = t.europeNote; europeNoteEl.style.display = 'block'; } else { europeNoteEl.style.display = 'none'; } document.getElementById('lang-tr').classList.toggle('active', lang === 'TR'); document.getElementById('lang-en').classList.toggle('active', lang === 'EN'); document.documentElement.lang = lang.toLowerCase(); } catch (e) { console.error("updateTexts hatası:", e); }}
function getReward(finalScore, lang) { const tiers = rewardTiers[lang]; for (const tier of tiers) { if (finalScore >= tier.score) { return tier.amount ? { amount: tier.amount, score: tier.score } : null; } } return null; }
function isValidEmail(email) { return email && email.includes('@') && email.includes('.'); }
function triggerConfetti() { if (typeof confetti === 'function') { console.log("Konfeti!"); confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); setTimeout(() => { confetti({ particleCount: 100, angle: 60, spread: 75, origin: { x: 0.1, y: 0.7 } }); confetti({ particleCount: 100, angle: 120, spread: 75, origin: { x: 0.9, y: 0.7 } }); }, 150); } else { console.warn("Konfeti kütüphanesi yüklenemedi."); } }
function findInactiveKargo() { for (let i = 0; i < kargoPool.length; i++) { if (!kargoPool[i].active) { return kargoPool[i]; } } return null; }
function spawnKargoFromPool(minSpeed, maxSpeed) { let kargo = findInactiveKargo(); if (kargo) { let isBonus = random(1) < 0.15; let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu; kargo.active = true; kargo.isBonus = isBonus; kargo.w = kargoSize; kargo.h = kargoSize; kargo.x = random(10, width - (kargoSize + 10)); kargo.y = -(kargoSize + 10); kargo.speed = random(minSpeed, maxSpeed); } }
function soundLoaded() { soundsLoadedCount++; console.log("Ses yüklendi (" + soundsLoadedCount + "/" + totalSounds + ")"); if (soundsLoadedCount === totalSounds) { console.log("Tüm ses dosyaları başarıyla yüklendi!"); } }
function soundLoadError(err) { console.error("Ses dosyası yüklenirken hata:", err); }
function soundLoadProgress(percent) { }
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) { if (getAudioContext().state !== 'running') {} if (soundFile && soundFile.isLoaded()) { soundFile.setVolume(volume); soundFile.rate(rate); soundFile.play(); } }

// --- p5.js Özel Fonksiyonları ---
function preload() { /* ... öncekiyle aynı ... */ }
function setup() {
    // ... (Canvas oluşturma, gleen, havuz oluşturma - öncekiyle aynı) ...
     let canvasW, canvasH; let w = windowWidth; let h = windowHeight; if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; } else { isVertical = false; canvasW = 800; canvasH = 600; } gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas'); let gleenY = canvasH - (isVertical ? 40 : 60); gleen = { x: canvasW / 2 - playerWidth / 2, y: gleenY, w: playerWidth, h: playerHeight }; kargoPool = []; for (let i = 0; i < MAX_KARGOS; i++) { kargoPool.push({ active: false, x: 0, y: 0, w: 0, h: 0, speed: 0, isBonus: false }); }

    lives = checkLives();
    console.log('Kurulum Bitti. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives, '(localStorage DEVRE DIŞI)');

    // Dil butonlarına olay dinleyici ('click' kullanılıyor)
    const langTRButton = document.getElementById('lang-tr');
    const langENButton = document.getElementById('lang-en');

    if (langTRButton) {
        langTRButton.addEventListener('click', () => { // <<<--- 'click' kullanılıyor
            console.log("[Event] TR button CLICKED.");
            playSound(clickSound);
            if (currentLang !== 'TR') { currentLang = 'TR'; updateTexts(currentLang); }
        });
         console.log("[setup] TR Buton Listener Eklendi (click).");
    } else { console.error("[setup] TR Dil butonu bulunamadı!"); }

    if (langENButton) {
        langENButton.addEventListener('click', () => { // <<<--- 'click' kullanılıyor
            console.log("[Event] EN button CLICKED.");
            playSound(clickSound);
            if (currentLang !== 'EN') { currentLang = 'EN'; updateTexts(currentLang); }
        });
         console.log("[setup] EN Buton Listener Eklendi (click).");
     } else { console.error("[setup] EN Dil butonu bulunamadı!"); }

    updateTexts(currentLang);
    gameInstanceCanvas.style('pointer-events', 'auto');
    noLoop();
    console.log("[setup] Kurulum Tamamlandı.");
}

function draw() { /* ... (öncekiyle aynı) ... */ }
function startGame() { /* ... (öncekiyle aynı) ... */ }
function restartGame() { /* ... (öncekiyle aynı) ... */ }
function resetGame() { /* ... (öncekiyle aynı) ... */ }

// --- Dokunma Fonksiyonları (ŞİMDİLİK DEVRE DIŞI) ---
/* // <<<--- Bu fonksiyonlar komple yoruma alındı
function touchStarted() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
     // console.log("Canvas içinde dokunma başladı (engellendi).");
     return false; // Varsayılanı engelle
  }
   // console.log("Canvas DIŞINDA dokunma başladı (engellenmedi).");
}

function touchMoved() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
     // console.log("Canvas içinde parmak hareket etti (engellendi).");
     return false; // Varsayılanı engelle (Kaydırma için en önemlisi)
  }
   // console.log("Canvas DIŞINDA parmak hareket etti (engellenmedi).");
}

function touchEnded() {
    // console.log("Dokunma bitti.");
}
*/ // <<<--- Yorum Bitişi
// --- DOKUNMA FONKSİYONLARI BİTTİ ---
