// --- Oyun Değişkenleri, Ayarları, Ödüller, Metinler ---
// ... (Diğer değişkenler aynı) ...
let gleen; let kargoPool = []; const MAX_KARGOS = 60; let score = 0; let misses = 0;
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
function updateTexts(lang) { /* ... öncekiyle aynı ... */ }
function getReward(finalScore, lang) { /* ... öncekiyle aynı ... */ }
function isValidEmail(email) { /* ... öncekiyle aynı ... */ }
function triggerConfetti() { /* ... öncekiyle aynı ... */ }
function findInactiveKargo() { /* ... öncekiyle aynı ... */ }
function spawnKargoFromPool(minSpeed, maxSpeed) { /* ... öncekiyle aynı ... */ }
function soundLoaded() { /* ... öncekiyle aynı ... */ }
function soundLoadError(err) { /* ... öncekiyle aynı ... */ }
function soundLoadProgress(percent) { /* ... öncekiyle aynı ... */ }
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) { /* ... öncekiyle aynı ... */ }

// --- p5.js Özel Fonksiyonları ---
function preload() { /* ... öncekiyle aynı ... */ }

function setup() {
    // ... (Canvas oluşturma, gleen, havuz oluşturma - öncekiyle aynı) ...
    let canvasW, canvasH; let w = windowWidth; let h = windowHeight; if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; } else { isVertical = false; canvasW = 800; canvasH = 600; } gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas'); let gleenY = canvasH - (isVertical ? 40 : 60); gleen = { x: canvasW / 2 - playerWidth / 2, y: gleenY, w: playerWidth, h: playerHeight }; kargoPool = []; for (let i = 0; i < MAX_KARGOS; i++) { kargoPool.push({ active: false, x: 0, y: 0, w: 0, h: 0, speed: 0, isBonus: false }); }

    lives = checkLives();
    console.log('Kurulum Bitti. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives, '(localStorage DEVRE DIŞI)');

    // <<<--- Dil butonlarına event listener (touchstart ile GÜNCELLENDİ) ---
    const langTRButton = document.getElementById('lang-tr');
    const langENButton = document.getElementById('lang-en');
    const emailInputForTouch = document.getElementById('emailInput'); // Odak kaybetme için

    if (langTRButton) {
        langTRButton.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Varsayılan dokunma davranışını engelle
             // Odak başka yerdeyse butona odaklanmasını sağla (iOS için gerekebilir)
             if (document.activeElement !== langTRButton) langTRButton.focus();
             emailInputForTouch.blur(); // Email input odaklıysa odağı kaldır
            console.log("TR button TOUCHED. Mevcut Dil:", currentLang);
            playSound(clickSound);
            if (currentLang !== 'TR') {
                console.log("TR diline geçiliyor...");
                currentLang = 'TR';
                updateTexts(currentLang);
                console.log("TR için updateTexts çağrıldı.");
            } else {
                console.log("Zaten TR'de.");
            }
        }, { passive: false }); // preventDefault için passive: false gerekli
    } else { console.error("TR Dil butonu bulunamadı!"); }

    if (langENButton) {
        langENButton.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Varsayılan dokunma davranışını engelle
             if (document.activeElement !== langENButton) langENButton.focus();
             emailInputForTouch.blur();
            console.log("EN button TOUCHED. Mevcut Dil:", currentLang);
            playSound(clickSound);
            if (currentLang !== 'EN') {
                console.log("EN diline geçiliyor...");
                currentLang = 'EN';
                updateTexts(currentLang);
                console.log("EN için updateTexts çağrıldı.");
            } else {
                console.log("Zaten EN'de.");
            }
        }, { passive: false }); // preventDefault için passive: false gerekli
     } else { console.error("EN Dil butonu bulunamadı!"); }
    // --- Event Listener Güncellemesi Bitti ---

    updateTexts(currentLang); // Başlangıç metinleri
    gameInstanceCanvas.style('pointer-events', 'auto');
    noLoop();
}

function draw() { /* ... (öncekiyle aynı - Oyun sonu mesajı HTML'de, zorluk ayarı vs.) ... */
    background(canvasBackgroundColor); if (gameOver) { const reward = getReward(finalScore, currentLang); const t = texts[currentLang]; const messageEl = document.getElementById('message'); const restartButtonEl = document.getElementById('restartButton'); messageEl.style.display = 'none'; messageEl.className = ''; restartButtonEl.style.display = 'none'; if (reward && reward.amount) { messageEl.classList.add('winMessage'); messageEl.innerHTML = `<strong>${t.winMessagePart1}${finalScore}${t.winMessagePart2}${reward.amount}${t.winMessagePart3}</strong><br><br>${t.winInstructions}`; if (!confettiFired) { playSound(winSound, 0.6); triggerConfetti(); confettiFired = true; } } else { messageEl.classList.remove('winMessage'); messageEl.innerText = `${t.gameOverBase}\n${t.scoreLabel}${finalScore}`; messageEl.style.color = '#dc3545'; } if (lives <= 0) { let noLivesText = `<br><br><strong style="color: red; font-size: 1.1em;">${t.noMoreLives}</strong>`; if (!messageEl.innerHTML.includes(t.noMoreLives)) { messageEl.innerHTML += noLivesText; } } messageEl.style.display = 'block'; if (lives > 0) { restartButtonEl.style.display = 'block'; } if (gameInstanceCanvas) { gameInstanceCanvas.style('pointer-events', 'none'); } noLoop(); return; } fill(playerColor); noStroke(); rect(gleen.x, gleen.y, gleen.w, gleen.h, 5); gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w); let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7; if (score >= 50) { spawnRate = 35; minSpeed = 6; maxSpeed = 14; } else if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 12; } else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; } if (frameCount % spawnRate === 0 && lives > 0) { spawnKargoFromPool(minSpeed, maxSpeed); } for (let i = 0; i < kargoPool.length; i++) { let kargo = kargoPool[i]; if (!kargo.active) { continue; } let speedMultiplier = deltaTime / (1000 / 60); if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; } kargo.y += kargo.speed * speedMultiplier; push(); translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); imageMode(CENTER); if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); } else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); } else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); } pop(); if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) { score += kargo.isBonus ? 5 : 1; kargo.active = false; playSound(catchSound, 0.7); } else if (kargo.y > height + kargo.h) { let wasBonus = kargo.isBonus; kargo.active = false; if (!wasBonus) { misses += 1; playSound(missSound, 0.6); if (misses >= 3) { finalScore = score; gameOver = true; playSound(gameOverSound, 0.7); } } } } const t = texts[currentLang]; fill(50); textSize( isVertical ? 16 : 18 ); textAlign(LEFT, TOP); let textY = isVertical ? 15 : 20; let textOffset = isVertical ? 25 : 30; text(t.scoreLabel + score, 15, textY); text(t.missedLabel + misses + '/3', 15, textY + textOffset); text(t.livesLabel + lives, 15, textY + textOffset * 2);
 }
function startGame() { /* ... (öncekiyle aynı, pointer-events ayarı dahil) ... */ }
function restartGame() { /* ... (öncekiyle aynı, pointer-events ayarı dahil) ... */ }
function resetGame() { /* ... (öncekiyle aynı, pointer-events ayarı YOK) ... */ }
function touchStarted() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchMoved() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchEnded() { }
