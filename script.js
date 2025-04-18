// --- Oyun Değişkenleri, Ayarları, Ödüller, Metinler ---
// ... (Diğer kısımlar aynı) ...
let gleen; let kargoPool = []; const MAX_KARGOS = 60; let score = 0; let misses = 0;
let giftMessage = ''; let gameOver = false; let lives = 3; // Başlangıçta 3 ama checkLives belirliyor
let trendyolLogo, kyrosilLogo;
let gameInstanceCanvas; let isVertical = false; let currentLang = 'TR';
let confettiInterval = null; let finalScore = 0; let confettiFired = false;
const playerWidth = 45; const playerHeight = 15;
const normalKargoBoyutu = 35; const bonusKargoBoyutu = 55;
const canvasBackgroundColor = 248; const playerColor = '#ff6200';
const rewardTiers = { TR: [ { score: 500, amount: "10000 TL" }, { score: 350, amount: "1000 TL" }, { score: 250, amount: "500 TL" }, { score: 100, amount: "250 TL" }, { score: 50, amount: "100 TL" }, { score: 0, amount: null } ], EN: [ { score: 500, amount: "250 Euro" }, { score: 350, amount: "50 Euro" }, { score: 250, amount: "30 Euro" }, { score: 100, amount: "15 Euro" }, { score: 50, amount: "5 Euro" }, { score: 0, amount: null } ] };
const texts = { TR: { gameTitle: "Trendyol Kargo Kapmaca", rewardTitle: "Ödül Baremleri (TL)", pointInfo: "Trendyol Logo: 1 Puan | Kyrosil Logo (Bonus): 5 Puan", europeNote: "", howToPlay: "Günde 3 hakla oyna, 3 kargo kaçırırsan oyun biter!", emailLabel: "Başlamak için E-posta Adresiniz:", emailPlaceholder: "Trendyol E-posta Adresiniz", emailError: "Lütfen geçerli bir e-posta adresi girin.", startBtn: "Başla", restartBtn: "Yeniden Başlat", scoreLabel: "Puan: ", missedLabel: "Kaçırılan: ", livesLabel: "Kalan Hak: ", gameOverBase: "Oyun Bitti!", winMessagePart1: "TEBRİKLER! ", winMessagePart2: " PUAN TOPLAYARAK ", winMessagePart3: " HEDİYE ÇEKİ KAZANDINIZ!", winInstructions: "KODUNUZU ALMAK İÇİN giriş yaptığınız mail ile birlikte\ngiveaways@kyrosil.eu mail adresine ekran görüntüsü ile ulaşınız.\nOrtalama 20 dakika içerisinde otomatik teslim edilecektir.", noMoreLives: "Günlük 3 hakkın bitti! Yarın tekrar dene.", tryAgain: "Tekrar denemek için\n1 hakkını kullan." }, EN: { gameTitle: "Trendyol Cargo Catch", rewardTitle: "Reward Tiers (EUR)", pointInfo: "Trendyol Logo: 1 Point | Kyrosil Logo (Bonus): 5 Points", europeNote: "IMPORTANT: Codes are valid for Trendyol Europe only. Cannot be used in Turkey.", howToPlay: "Play with 3 lives per day. Game over if you miss 3 packages!", emailLabel: "Your E-mail Address to Start:", emailPlaceholder: "Your Trendyol E-mail Address", emailError: "Please enter a valid e-mail address.", startBtn: "Start", restartBtn: "Restart", scoreLabel: "Score: ", missedLabel: "Missed: ", livesLabel: "Lives Left: ", gameOverBase: "Game Over!", winMessagePart1: "CONGRATULATIONS! ", winMessagePart2: " POINTS EARNED YOU A ", winMessagePart3: " GIFT CODE!", winInstructions: "To receive your code, please contact giveaways@kyrosil.eu\nwith a screenshot using the email address you provided.\nDelivery is automated and takes approx. 20 minutes.", noMoreLives: "You've used your 3 lives for today! Try again tomorrow.", tryAgain: "Use 1 life to try again." } };
let bgMusic, catchSound, missSound, gameOverSound, clickSound, winSound;
let soundsLoadedCount = 0; const totalSounds = 6; let isBgMusicPlaying = false;

// --- Yardımcı Fonksiyonlar ---
function checkLives() { console.log("localStorage devre dışı. Haklar 3 olarak ayarlandı."); return 3; }
function updateStoredLives(newLives) { lives = newLives >= 0 ? newLives : 0; console.log("[updateStoredLives] Hak güncellendi (değişken):", lives); } // Log eklendi
function setText(elementId, textContent) { const element = document.getElementById(elementId); if (element) { element.innerText = textContent; } else { console.error(`[setText] HATA: Element bulunamadı! ID: ${elementId}`); } }
function setPlaceholder(elementId, placeholderText) { const element = document.getElementById(elementId); if (element) { element.placeholder = placeholderText; } else { console.error(`[setPlaceholder] HATA: Element bulunamadı! ID: ${elementId}`); } }
function updateTexts(lang) { try { const t = texts[lang]; if (!t) throw new Error(`'${lang}' için metinler bulunamadı!`); setText('game-title', t.gameTitle); setText('rewardTitle', t.rewardTitle); setText('pointInfo', t.pointInfo); setText('howToPlay', t.howToPlay); setText('emailLabel', t.emailLabel); setPlaceholder('emailInput', t.emailPlaceholder); setText('startButton', t.startBtn); setText('restartButton', t.restartBtn); setText('emailError', t.emailError); const rewardListEl = document.getElementById('rewardList'); if (!rewardListEl) throw new Error("rewardList elementi bulunamadı!"); rewardListEl.innerHTML = ''; const currentRewardTiers = rewardTiers[lang]; if (!currentRewardTiers) throw new Error(`'${lang}' için ödül baremleri bulunamadı!`); try { currentRewardTiers.forEach((tier) => { if (tier.amount) { const li = document.createElement('li'); li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`; rewardListEl.appendChild(li); } }); } catch (listError) { console.error("Ödül listesi oluşturma hatası!", listError); } const europeNoteEl = document.getElementById('europeNote'); if (!europeNoteEl) throw new Error("europeNote elementi bulunamadı!"); if (lang === 'EN' && t.europeNote) { europeNoteEl.innerText = t.europeNote; europeNoteEl.style.display = 'block'; } else { europeNoteEl.style.display = 'none'; } const btnTR = document.getElementById('lang-tr'); const btnEN = document.getElementById('lang-en'); if (btnTR) btnTR.classList.toggle('active', lang === 'TR'); else console.error("TR Butonu bulunamadı!"); if (btnEN) btnEN.classList.toggle('active', lang === 'EN'); else console.error("EN Butonu bulunamadı!"); document.documentElement.lang = lang.toLowerCase(); console.log(`[updateTexts] Tamamlandı - Dil: ${lang}`); } catch (error) { console.error(`[updateTexts] GENEL HATA - Dil: ${lang}`, error); } }
function getReward(finalScore, lang) { const tiers = rewardTiers[lang]; for (const tier of tiers) { if (finalScore >= tier.score && tier.score > 0) { return tier.amount ? { amount: tier.amount, score: tier.score } : null; } } return null; }
function isValidEmail(email) { console.log(`[isValidEmail] Kontrol: "${email}"`); if (!email) return false; const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; const isValid = emailRegex.test(email); console.log(`[isValidEmail] Regex Sonuç: ${isValid}`); return isValid; }
function triggerConfetti() { if (typeof confetti === 'function') { console.log("Konfeti!"); confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); setTimeout(() => { confetti({ particleCount: 100, angle: 60, spread: 75, origin: { x: 0.1, y: 0.7 } }); confetti({ particleCount: 100, angle: 120, spread: 75, origin: { x: 0.9, y: 0.7 } }); }, 150); } else { console.warn("Konfeti kütüphanesi yüklenemedi."); } }
function findInactiveKargo() { for (let i = 0; i < kargoPool.length; i++) { if (!kargoPool[i].active) { return kargoPool[i]; } } return null; }
function spawnKargoFromPool(minSpeed, maxSpeed) { let kargo = findInactiveKargo(); if (kargo) { let isBonus = random(1) < 0.15; let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu; kargo.active = true; kargo.isBonus = isBonus; kargo.w = kargoSize; kargo.h = kargoSize; kargo.x = random(10, width - (kargoSize + 10)); kargo.y = -(kargoSize + 10); kargo.speed = random(minSpeed, maxSpeed); } }
function soundLoaded() { soundsLoadedCount++; /* console.log("Ses yüklendi..."); */ if (soundsLoadedCount === totalSounds) { console.log("Tüm ses dosyaları başarıyla yüklendi!"); } }
function soundLoadError(err) { console.error("Ses dosyası yüklenirken hata:", err); }
function soundLoadProgress(percent) { }
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) { if (getAudioContext().state !== 'running') {} if (soundFile && soundFile.isLoaded()) { soundFile.setVolume(volume); soundFile.rate(rate); soundFile.play(); } }

// --- p5.js Özel Fonksiyonları ---
function preload() { /* ... öncekiyle aynı ... */ }
function setup() { /* ... öncekiyle aynı ... */ }

function draw() {
    try {
        background(canvasBackgroundColor);
        if (gameOver) {
             // --- OYUN BİTTİ EKRANI ---
             const reward = getReward(finalScore, currentLang); const t = texts[currentLang]; const messageEl = document.getElementById('message'); const restartButtonEl = document.getElementById('restartButton'); messageEl.style.display = 'none'; messageEl.className = ''; restartButtonEl.style.display = 'none';
             if (reward && reward.amount) { /* Kazanma mesajı canvas'ta */ fill(0, 0, 0, 150); rect(0, 0, width, height); let boxW = width * 0.8; let boxH = height * 0.6; let boxX = (width - boxW) / 2; let boxY = (height - boxH) / 2; stroke(200); fill(250); rect(boxX, boxY, boxW, boxH, 10); textAlign(CENTER, CENTER); textSize(isVertical ? 20 : 28); fill('#155724'); let messageText = `${t.winMessagePart1}${finalScore}${t.winMessagePart2}${reward.amount}${t.winMessagePart3}`; text(messageText, boxX + 20, boxY + 20, boxW - 40, boxH * 0.5 - 30); textSize(isVertical ? 12 : 14); fill(80); text(t.winInstructions, boxX + 20, boxY + boxH * 0.5 , boxW - 40, boxH * 0.5 - 30); if (!confettiFired) { playSound(winSound, 0.6); triggerConfetti(); confettiFired = true; } }
             else { /* Kaybetme mesajı HTML'de */ messageEl.innerText = `${t.gameOverBase}\n${t.scoreLabel}${finalScore}`; messageEl.style.color = '#dc3545'; messageEl.style.display = 'block'; }
             if (lives <= 0) { /* Hak bitti mesajı HTML'de */ let noLivesText = `<br><br><strong style="color: red; font-size: 1.1em;">${t.noMoreLives}</strong>`; if (!messageEl.innerHTML.includes(t.noMoreLives)) { messageEl.innerHTML += noLivesText; } messageEl.style.display = 'block'; }
             if (lives > 0) { /* Yeniden başlat butonu HTML'de */ restartButtonEl.style.display = 'block'; }
             if (gameInstanceCanvas) { gameInstanceCanvas.style('pointer-events', 'none'); } noLoop(); return;
         } // --- Oyun Bitti Bitiş ---

        // --- Oyun Devam Ediyor ---
        fill(playerColor); noStroke(); rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);
        gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);

        // <<<--- ZORLUK AYARLARI (GÜNCELLENDİ) ---
        let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
        if (score >= 50) { // Seviye 4
            spawnRate = 35; minSpeed = 6; maxSpeed = 15; // Max hız daha da arttı
        } else if (score >= 30) { // Seviye 3
            spawnRate = 40; minSpeed = 5; maxSpeed = 13; // Max hız arttı
        } else if (score >= 15) { // Seviye 2
            spawnRate = 45; minSpeed = 4; maxSpeed = 10; // Max hız hafif arttı
        } // 0-14: Base seviye
        // --- Zorluk Bitti ---

        if (frameCount % spawnRate === 0 && lives > 0) { spawnKargoFromPool(minSpeed, maxSpeed); }
        for (let i = 0; i < kargoPool.length; i++) { let kargo = kargoPool[i]; if (!kargo.active) { continue; } let speedMultiplier = deltaTime / (1000 / 60); if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; } kargo.y += kargo.speed * speedMultiplier; push(); translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); imageMode(CENTER); if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); } else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); } else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); } pop(); if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) { score += kargo.isBonus ? 5 : 1; kargo.active = false; playSound(catchSound, 0.7); } else if (kargo.y > height + kargo.h) { let wasBonus = kargo.isBonus; kargo.active = false; if (!wasBonus) { misses += 1; playSound(missSound, 0.6); if (misses >= 3) { finalScore = score; gameOver = true; playSound(gameOverSound, 0.7); } } } }
        const t = texts[currentLang]; fill(50); textSize( isVertical ? 16 : 18 ); textAlign(LEFT, TOP); let textY = isVertical ? 15 : 20; let textOffset = isVertical ? 25 : 30; text(t.scoreLabel + score, 15, textY); text(t.missedLabel + misses + '/3', 15, textY + textOffset); text(t.livesLabel + lives, 15, textY + textOffset * 2);

    } catch (drawError) { console.error("Draw fonksiyonunda HATA:", drawError); noLoop(); }
}


function startGame() { /* ... (öncekiyle aynı) ... */ }

// Restart Game (LOG EKLENDİ)
function restartGame() {
    console.log("[restartGame] Başladı. Mevcut hak:", lives); // LOG 1
    playSound(clickSound);
    if (lives > 0) {
       updateStoredLives(lives - 1); // Hak düşürülüyor ve loglanıyor
       console.log("[restartGame] Hak düşürüldü. Yeni hak:", lives); // LOG 2
       if (lives > 0) { // Hak kaldıysa
          console.log("[restartGame] Hak kaldı, oyun sıfırlanıyor ve başlatılıyor..."); // LOG 3
          document.getElementById('restartButton').style.display = 'none';
          document.getElementById('message').style.display = 'none';
          resetGame(); // Sıfırlama fonksiyonunu çağır
          if (gameInstanceCanvas) { gameInstanceCanvas.style('pointer-events', 'auto'); }
          frameCount = 0;
          if (bgMusic && bgMusic.isLoaded() && !isBgMusicPlaying) { bgMusic.loop(); isBgMusicPlaying = true; }
          else if (isBgMusicPlaying && bgMusic && !bgMusic.isPlaying()){ bgMusic.loop(); }
          loop(); // Oyun döngüsünü başlat
          console.log('[restartGame] Oyun başarıyla yeniden başlatıldı.'); // LOG 4
       } else { // Son hak kullanıldıysa
          console.log('[restartGame] Son hak kullanıldı, oyun bitiyor.'); // LOG 5
          finalScore = score; // Skoru kaydet (zaten olmalı ama garanti)
          gameOver = true;
          playSound(gameOverSound, 0.7);
          redraw(); // Oyun bitti ekranını çizdir
       }
    } else {
        console.error("[restartGame] Hata: Hak yokken yeniden başlatma denendi!"); // LOG 6
    }
}

// Reset Game (LOG EKLENDİ)
function resetGame() {
    console.log("[resetGame] Başladı."); // LOG A
    score = 0; misses = 0; gameOver = false; finalScore = 0; confettiFired = false;
    for (let i = 0; i < kargoPool.length; i++) { kargoPool[i].active = false; }
    if (gleen) { gleen.w = playerWidth; gleen.x = width / 2 - gleen.w / 2; gleen.y = height - (isVertical ? 40 : 60); }
    document.getElementById('message').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    console.log("[resetGame] Bitti."); // LOG B
}


// --- Dokunma Fonksiyonları (Kaydırma Engelleme - AKTİF ve DÜZENLİ) ---
function touchStarted(event) {
  if (gameInstanceCanvas && event && event.target === gameInstanceCanvas.elt) { return false; } return true;
}
function touchMoved(event) {
  if (gameInstanceCanvas && event && event.target === gameInstanceCanvas.elt) { return false; } return true;
}
function touchEnded() { return true; }
// --- Dokunma Fonksiyonları Bitti ---
