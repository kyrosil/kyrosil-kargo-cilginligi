// --- Oyun Değişkenleri, Ayarları, Ödüller, Metinler ---
// ... (Diğer değişkenler aynı) ...
let confettiFired = false;
const playerWidth = 45; // <<<--- Sepet Genişliği Azaltıldı
const playerHeight = 15;

// --- Ses Değişkenleri ---
// ... (Aynı) ...

// --- Oyun Ayarları ---
// ... (Aynı) ...

// --- Ödül Baremleri & Metinler ---
// ... (Aynı) ...

// --- Yardımcı Fonksiyonlar ---
// ... (checkLives, updateStoredLives, updateTexts, getReward, isValidEmail - Aynı) ...
function checkLives() { console.log("localStorage devre dışı. Haklar 3 olarak ayarlandı."); return 3; }
function updateStoredLives(newLives) { lives = newLives >= 0 ? newLives : 0; }
function updateTexts(lang) { /* ... öncekiyle aynı ... */ }
function getReward(finalScore, lang) { /* ... öncekiyle aynı ... */ }
function isValidEmail(email) { /* ... öncekiyle aynı ... */ }
// ... (findInactiveKargo, spawnKargoFromPool - Aynı) ...
function findInactiveKargo() { /* ... öncekiyle aynı ... */ }
function spawnKargoFromPool(minSpeed, maxSpeed) { /* ... öncekiyle aynı ... */ }


// --- Konfeti Fonksiyonu (GÜNCELLENDİ - Daha Efektli) ---
function triggerConfetti() {
    if (typeof confetti === 'function') {
        console.log("BOMBA GİBİ KONFETİ!");

        // Biraz daha fazla parçacık ve yayılım
        confetti({
            particleCount: 150, // Daha fazla
            spread: 90,       // Daha geniş açı
            origin: { y: 0.6 }
        });

        // Ekstra efektler (örneğin kenarlardan fırlatma)
        setTimeout(() => {
             // Sol kenardan yukarı doğru
             confetti({ particleCount: 100, angle: 60, spread: 75, origin: { x: 0.1, y: 0.7 } });
             // Sağ kenardan yukarı doğru
             confetti({ particleCount: 100, angle: 120, spread: 75, origin: { x: 0.9, y: 0.7 } });
        }, 150); // Hafif gecikmeyle

        // Veya havai fişek gibi:
        // confetti({ particleCount: 100, spread: 360, startVelocity: 30, ticks: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });

    } else {
        console.warn("Konfeti kütüphanesi yüklenemedi.");
    }
}

// --- Ses Yükleme ve p5.js Fonksiyonları ---
function soundLoaded() { /* ... öncekiyle aynı ... */ }
function soundLoadError(err) { /* ... öncekiyle aynı ... */ }
function soundLoadProgress(percent) { /* ... öncekiyle aynı ... */ }
function preload() { /* ... öncekiyle aynı ... */ }
function setup() {
    // ... (Canvas oluşturma - öncekiyle aynı) ...
     let canvasW, canvasH; let w = windowWidth; let h = windowHeight; if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; } else { isVertical = false; canvasW = 800; canvasH = 600; } gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas');

    // <<<--- Sepet başlangıç pozisyonu güncellendi (yeni genişlikle) ---
    let gleenY = canvasH - (isVertical ? 40 : 60);
    gleen = { x: canvasW / 2 - playerWidth / 2, y: gleenY, w: playerWidth, h: playerHeight }; // playerWidth kullanıldı

    // ... (Havuz oluşturma, dil butonları vb. - öncekiyle aynı) ...
    kargoPool = []; for (let i = 0; i < MAX_KARGOS; i++) { kargoPool.push({ active: false, x: 0, y: 0, w: 0, h: 0, speed: 0, isBonus: false }); } lives = checkLives(); console.log('Kurulum Bitti. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives, '(localStorage DEVRE DIŞI)'); document.getElementById('lang-tr').addEventListener('click', () => { playSound(clickSound); if (currentLang !== 'TR') { currentLang = 'TR'; updateTexts(currentLang); } }); document.getElementById('lang-en').addEventListener('click', () => { playSound(clickSound); if (currentLang !== 'EN') { currentLang = 'EN'; updateTexts(currentLang); } }); updateTexts(currentLang); noLoop();
}
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) { /* ... öncekiyle aynı ... */ }


function draw() {
    background(canvasBackgroundColor);

    if (gameOver) {
        // --- OYUN BİTTİ EKRANI (Mesaj Yeri Güncellendi) ---
        const reward = getReward(finalScore, currentLang);
        const t = texts[currentLang];
        const messageEl = document.getElementById('message'); // HTML mesaj alanı

        messageEl.style.display = 'none'; // Önce HTML mesajını gizle
        messageEl.className = ''; // Stilleri sıfırla

        if (reward && reward.amount) { // ÖDÜL KAZANILDIYSA (Canvas'a Çiz)
            // 1. Karartma efekti
            fill(0, 0, 0, 150); rect(0, 0, width, height);
            // 2. Mesaj Kutusu
            let boxW = width * 0.8; let boxH = height * 0.6; let boxX = (width - boxW) / 2; let boxY = (height - boxH) / 2;
            stroke(200); fill(250); rect(boxX, boxY, boxW, boxH, 10);
            // 3. Mesaj Metni
            textAlign(CENTER, CENTER); textSize(isVertical ? 20 : 28); fill('#155724');
            let messageText = `${t.winMessagePart1}${finalScore}${t.winMessagePart2}${reward.amount}${t.winMessagePart3}`;
            text(messageText, boxX + 20, boxY + 20, boxW - 40, boxH * 0.5 - 30);
            // 4. Talimatlar
            textSize(isVertical ? 12 : 14); fill(80);
            text(t.winInstructions, boxX + 20, boxY + boxH * 0.5 , boxW - 40, boxH * 0.5 - 30);

            if (!confettiFired) { // Sadece bir kere
                 playSound(winSound, 0.6);
                 triggerConfetti(); // Geliştirilmiş konfeti
                 confettiFired = true;
            }

        } else { // ÖDÜL KAZANILAMADIYSA (HTML Mesaj Alanına Yaz)
            messageEl.innerText = `${t.gameOverBase}\n${t.scoreLabel}${finalScore}`;
            messageEl.style.color = '#dc3545'; // Kırmızı renk verelim
            messageEl.style.display = 'block'; // Göster
        }

        // Yeniden başlatma butonu veya Hak Bitti mesajı (HTML'de)
        if (lives > 0) {
            document.getElementById('restartButton').style.display = 'block';
        } else {
            document.getElementById('restartButton').style.display = 'none';
            // Hak bitti mesajını da HTML mesaj alanına ekleyelim (kaybetme mesajının altına)
            let finalMsg = messageEl.innerText; // Önceki mesajı al
             if (!finalMsg.includes(t.noMoreLives)) { // Eğer zaten eklenmemişse
                  messageEl.innerHTML += `<br><br><strong style="color: red; font-size: 1.1em;">${t.noMoreLives}</strong>`;
             }
             messageEl.style.display = 'block'; // Gösterildiğinden emin ol
        }

        noLoop(); return; // --- OYUN BİTTİ EKRANI BİTTİ ---
    }

    // --- Oyun Devam Ediyor ---
    // Sepeti çiz (Yeni genişlikle)
    fill(playerColor); noStroke();
    rect(gleen.x, gleen.y, gleen.w, gleen.h, 5); // gleen.w kullanılıyor, setup'ta ayarlandı

    // Sepeti hareket ettir
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);

    // <<<--- ZORLUK AYARLARI GÜNCELLENDİ ---
    let spawnRate = 50; // Base spawn rate
    let minSpeed = 3;   // Base min speed
    let maxSpeed = 7;   // Base max speed

    if (score >= 50) { // Seviye 4 (Yeni)
        spawnRate = 35; // Daha sık
        minSpeed = 6;   // Min hız arttı
        maxSpeed = 14;  // Max hız daha fazla arttı
    } else if (score >= 30) { // Seviye 3
        spawnRate = 40; // Daha sık
        minSpeed = 5;
        maxSpeed = 12;  // Max hız arttı
    } else if (score >= 15) { // Seviye 2
        spawnRate = 45;
        minSpeed = 4;
        maxSpeed = 9;   // Aynı kaldı
    } // 0-14: Base seviye
    // --- Zorluk Ayarları Bitti ---

    // Yeni kargo ekleme
    if (frameCount % spawnRate === 0 && lives > 0) {
        spawnKargoFromPool(minSpeed, maxSpeed);
    }

    // Kargoları yönet (Object pooling ile)
    for (let i = 0; i < kargoPool.length; i++) {
        let kargo = kargoPool[i];
        if (!kargo.active) { continue; }
        // ... (Hareket, çizim, çarpışma, kaçırma - öncekiyle aynı) ...
         let speedMultiplier = deltaTime / (1000 / 60); if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; } kargo.y += kargo.speed * speedMultiplier; push(); translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); imageMode(CENTER); if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); } else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); } else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); } pop(); if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) { score += kargo.isBonus ? 5 : 1; kargo.active = false; playSound(catchSound, 0.7); } else if (kargo.y > height + kargo.h) { let wasBonus = kargo.isBonus; kargo.active = false; if (!wasBonus) { misses += 1; playSound(missSound, 0.6); if (misses >= 3) { finalScore = score; gameOver = true; playSound(gameOverSound, 0.7); } } }
    }

    // Bilgileri Ekrana Yazdır
    // ... (öncekiyle aynı) ...
     const t = texts[currentLang]; fill(50); textSize( isVertical ? 16 : 18 ); textAlign(LEFT, TOP); let textY = isVertical ? 15 : 20; let textOffset = isVertical ? 25 : 30; text(t.scoreLabel + score, 15, textY); text(t.missedLabel + misses + '/3', 15, textY + textOffset); text(t.livesLabel + lives, 15, textY + textOffset * 2);

} // draw() Sonu

// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
function startGame() { /* ... (öncekiyle aynı) ... */ }
function restartGame() { /* ... (öncekiyle aynı) ... */ }
function resetGame() {
    // ... (öncekiyle aynı sıfırlama işlemleri) ...
    score = 0; misses = 0; gameOver = false; finalScore = 0;
    confettiFired = false; // <<<--- Konfeti bayrağını sıfırla
    for (let i = 0; i < kargoPool.length; i++) { kargoPool[i].active = false; }
    if (gleen) {
        gleen.w = playerWidth; // Genişliği tekrar ayarla (opsiyonel ama garanti)
        gleen.x = width / 2 - gleen.w / 2;
        gleen.y = height - (isVertical ? 40 : 60);
    }
    document.getElementById('message').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
}

// --- Dokunma Fonksiyonları ---
// ... (Aynı) ...
function touchStarted() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchMoved() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchEnded() { }
