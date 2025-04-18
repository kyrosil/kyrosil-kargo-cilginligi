// --- Oyun Değişkenleri ---
// ... (Diğer değişkenler aynı) ...
let gleen; let kargoPool = []; const MAX_KARGOS = 60; let score = 0; let misses = 0;
let giftMessage = ''; let gameOver = false; let lives = 3;
let trendyolLogo, kyrosilLogo;
let gameInstanceCanvas; let isVertical = false; let currentLang = 'TR';
let confettiInterval; let finalScore = 0;

// <<<--- Ses Dosyaları İçin Değişkenler ---
let bgMusic, catchSound, missSound, gameOverSound, clickSound, winSound;
let soundsLoadedCount = 0; // Kaç sesin yüklendiğini saymak için
const totalSounds = 6; // Toplam yüklenecek ses sayısı
let isBgMusicPlaying = false;

// --- Oyun Ayarları ---
// ... (Aynı) ...
const normalKargoBoyutu = 35; const bonusKargoBoyutu = 55;
const canvasBackgroundColor = 248; const playerColor = '#ff6200';

// --- Ödül Baremleri & Metinler ---
// ... (Aynı) ...
const rewardTiers = { TR: [ { score: 500, amount: "10000 TL" }, { score: 350, amount: "1000 TL" }, { score: 250, amount: "500 TL" }, { score: 100, amount: "250 TL" }, { score: 50, amount: "100 TL" }, { score: 0, amount: null } ], EN: [ { score: 500, amount: "250 Euro" }, { score: 350, amount: "50 Euro" }, { score: 250, amount: "30 Euro" }, { score: 100, amount: "15 Euro" }, { score: 50, amount: "5 Euro" }, { score: 0, amount: null } ] };
const texts = { TR: { gameTitle: "Trendyol Kargo Kapmaca", rewardTitle: "Ödül Baremleri (TL)", pointInfo: "Trendyol Logo: 1 Puan | Kyrosil Logo (Bonus): 5 Puan", europeNote: "", howToPlay: "Günde 3 hakla oyna, 3 kargo kaçırırsan oyun biter!", emailLabel: "Başlamak için E-posta Adresiniz:", emailPlaceholder: "Trendyol E-posta Adresiniz", emailError: "Lütfen geçerli bir e-posta adresi girin.", startBtn: "Başla", restartBtn: "Yeniden Başlat", scoreLabel: "Puan: ", missedLabel: "Kaçırılan: ", livesLabel: "Kalan Hak: ", gameOverBase: "Oyun Bitti!", winMessagePart1: "TEBRİKLER! ", winMessagePart2: " PUAN TOPLAYARAK ", winMessagePart3: " HEDİYE ÇEKİ KAZANDINIZ!", winInstructions: "KODUNUZU ALMAK İÇİN giriş yaptığınız mail ile birlikte\ngiveaways@kyrosil.eu mail adresine ekran görüntüsü ile ulaşınız.\nOrtalama 20 dakika içerisinde otomatik teslim edilecektir.", noMoreLives: "Günlük 3 hakkın bitti! Yarın tekrar dene.", tryAgain: "Tekrar denemek için\n1 hakkını kullan." }, EN: { gameTitle: "Trendyol Cargo Catch", rewardTitle: "Reward Tiers (EUR)", pointInfo: "Trendyol Logo: 1 Point | Kyrosil Logo (Bonus): 5 Points", europeNote: "IMPORTANT: Codes are valid for Trendyol Europe only. Cannot be used in Turkey.", howToPlay: "Play with 3 lives per day. Game over if you miss 3 packages!", emailLabel: "Your E-mail Address to Start:", emailPlaceholder: "Your Trendyol E-mail Address", emailError: "Please enter a valid e-mail address.", startBtn: "Start", restartBtn: "Restart", scoreLabel: "Score: ", missedLabel: "Missed: ", livesLabel: "Lives Left: ", gameOverBase: "Game Over!", winMessagePart1: "CONGRATULATIONS! ", winMessagePart2: " POINTS EARNED YOU A ", winMessagePart3: " GIFT CODE!", winInstructions: "To receive your code, please contact giveaways@kyrosil.eu\nwith a screenshot using the email address you provided.\nDelivery is automated and takes approx. 20 minutes.", noMoreLives: "You've used your 3 lives for today! Try again tomorrow.", tryAgain: "Use 1 life to try again." } };

// --- Yardımcı Fonksiyonlar ---
function checkLives() { console.log("localStorage devre dışı. Haklar 3 olarak ayarlandı."); return 3; }
function updateStoredLives(newLives) { lives = newLives >= 0 ? newLives : 0; /* localStorage devre dışı */ }
function updateTexts(lang) { /* ... öncekiyle aynı ... */ const t = texts[lang]; document.getElementById('game-title').innerText = t.gameTitle; document.getElementById('rewardTitle').innerText = t.rewardTitle; document.getElementById('pointInfo').innerText = t.pointInfo; document.getElementById('howToPlay').innerText = t.howToPlay; document.getElementById('emailLabel').innerText = t.emailLabel; document.getElementById('emailInput').placeholder = t.emailPlaceholder; document.getElementById('startButton').innerText = t.startBtn; document.getElementById('restartButton').innerText = t.restartBtn; document.getElementById('emailError').innerText = t.emailError; const rewardListEl = document.getElementById('rewardList'); rewardListEl.innerHTML = ''; rewardTiers[lang].forEach(tier => { if (tier.amount) { const li = document.createElement('li'); li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`; rewardListEl.appendChild(li); } }); const europeNoteEl = document.getElementById('europeNote'); if (lang === 'EN' && t.europeNote) { europeNoteEl.innerText = t.europeNote; europeNoteEl.style.display = 'block'; } else { europeNoteEl.style.display = 'none'; } document.getElementById('lang-tr').classList.toggle('active', lang === 'TR'); document.getElementById('lang-en').classList.toggle('active', lang === 'EN'); document.documentElement.lang = lang.toLowerCase(); }
function getReward(finalScore, lang) { /* ... öncekiyle aynı ... */ const tiers = rewardTiers[lang]; for (const tier of tiers) { if (finalScore >= tier.score) { return tier.amount ? { amount: tier.amount, score: tier.score } : null; } } return null; }
function isValidEmail(email) { /* ... öncekiyle aynı ... */ return email && email.includes('@') && email.includes('.'); }
function triggerConfetti() { console.log("Konfeti!"); /* ... öncekiyle aynı ... */ }
function findInactiveKargo() { /* ... öncekiyle aynı ... */ for (let i = 0; i < kargoPool.length; i++) { if (!kargoPool[i].active) { return kargoPool[i]; } } return null; }
function spawnKargoFromPool(minSpeed, maxSpeed) { /* ... öncekiyle aynı ... */ let kargo = findInactiveKargo(); if (kargo) { let isBonus = random(1) < 0.15; let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu; kargo.active = true; kargo.isBonus = isBonus; kargo.w = kargoSize; kargo.h = kargoSize; kargo.x = random(10, width - (kargoSize + 10)); kargo.y = -(kargoSize + 10); kargo.speed = random(minSpeed, maxSpeed); } }

// Ses yükleme geri bildirim fonksiyonları
function soundLoaded() {
    soundsLoadedCount++;
    console.log("Ses yüklendi (" + soundsLoadedCount + "/" + totalSounds + ")");
    if (soundsLoadedCount === totalSounds) {
        console.log("Tüm ses dosyaları başarıyla yüklendi!");
        // İstersen burada başlangıç butonunu aktif hale getirebilirsin
        // document.getElementById('startButton').disabled = false;
    }
}
function soundLoadError(err) {
    console.error("Ses dosyası yüklenirken hata:", err);
    // Hata durumunda belki kullanıcıya bilgi verilebilir
}
function soundLoadProgress(percent) {
    // console.log("Ses yükleniyor:", percent); // Çok fazla log üretebilir
}


// --- p5.js Özel Fonksiyonları ---

function preload() {
    // Görselleri yükle
    try {
        trendyolLogo = loadImage('images.jpg');
        kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
    } catch (e) { console.error('Logo yükleme hatası:', e); trendyolLogo = null; kyrosilLogo = null; }

    // Ses Dosyalarını Yükle (ANA DİZİNDEN)
    try {
        soundFormats('mp3', 'wav'); // .ogg varsa onu da ekle
        console.log("Ses dosyaları yükleniyor (Ana Dizin)...");

        // <<<--- 'sounds/' ön eki kaldırıldı ---
        bgMusic = loadSound('Trendyol Yolla Şarkı Sözleri.mp3', soundLoaded, soundLoadError, soundLoadProgress);
        catchSound = loadSound('collect-points-190037.mp3', soundLoaded, soundLoadError, soundLoadProgress);
        missSound = loadSound('pickup-sound-82314.mp3', soundLoaded, soundLoadError, soundLoadProgress); // Bu dosya adı doğru mu? (3. ses için)
        gameOverSound = loadSound('game-over-arcade-6435.mp3', soundLoaded, soundLoadError, soundLoadProgress);
        clickSound = loadSound('Tık Sesi Efekti.mp3', soundLoaded, soundLoadError, soundLoadProgress);
        winSound = loadSound('you-win-sequence-2-183949.mp3', soundLoaded, soundLoadError, soundLoadProgress);
        // --- Yollar Güncellendi ---

    } catch (e) {
        console.error("Ses yükleme başlatılırken hata oluştu:", e);
        bgMusic = catchSound = missSound = gameOverSound = clickSound = winSound = null;
    }
}

function setup() {
    // ... (Canvas oluşturma, gleen, havuz oluşturma - öncekiyle aynı) ...
    let canvasW, canvasH; let w = windowWidth; let h = windowHeight; if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; } else { isVertical = false; canvasW = 800; canvasH = 600; } gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas'); let gleenWidth = 50; let gleenHeight = 15; let gleenY = canvasH - (isVertical ? 40 : 60); gleen = { x: canvasW / 2 - gleenWidth / 2, y: gleenY, w: gleenWidth, h: gleenHeight }; kargoPool = []; for (let i = 0; i < MAX_KARGOS; i++) { kargoPool.push({ active: false, x: 0, y: 0, w: 0, h: 0, speed: 0, isBonus: false }); }

    lives = checkLives();
    console.log('Kurulum Bitti. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives, '(localStorage DEVRE DIŞI)');

    // Dil butonları ve başlangıç metinleri
    document.getElementById('lang-tr').addEventListener('click', () => { playSound(clickSound); if (currentLang !== 'TR') { currentLang = 'TR'; updateTexts(currentLang); } });
    document.getElementById('lang-en').addEventListener('click', () => { playSound(clickSound); if (currentLang !== 'EN') { currentLang = 'EN'; updateTexts(currentLang); } });
    updateTexts(currentLang);

    // Başlangıçta butonu belki sesler yüklenene kadar pasif yap
    // document.getElementById('startButton').disabled = true; // Eğer seslerin yüklenmesini beklemek istersen

    noLoop();
}

// Ses çalma fonksiyonu (hata kontrolü ile)
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) {
    // Tarayıcı AudioContext'i için kullanıcı etkileşimi gerekebilir.
    // p5.sound bunu kısmen yönetir ama emin olmak için kontrol edelim.
    if (getAudioContext().state !== 'running') {
        // console.warn("AudioContext çalışmıyor. Kullanıcı etkileşimi bekleniyor olabilir.");
        // userStartAudio(); // Gerekirse kullanıcıya bir başlatma butonu sunulabilir.
        // Şimdilik yine de çalmayı deneyelim.
    }

    if (soundFile && soundFile.isLoaded()) { // Ses yüklenmişse çal
        soundFile.setVolume(volume);
        soundFile.rate(rate);
        // soundFile.pan(pan); // Stereo etkisi için (opsiyonel)
        soundFile.play();
    } else {
        // console.log("Ses dosyası henüz yüklenmedi veya yüklenemedi.");
    }
}

function draw() {
    background(canvasBackgroundColor);

    if (gameOver) {
        // --- Oyun Bitti Ekranı ---
        const reward = getReward(finalScore, currentLang); const t = texts[currentLang]; const messageEl = document.getElementById('message'); messageEl.innerHTML = ''; messageEl.className = '';
        if (reward && reward.amount) { // Ödül kazanıldıysa
            messageEl.classList.add('winMessage');
            messageEl.innerHTML = `<strong>${t.winMessagePart1}${finalScore}${t.winMessagePart2}${reward.amount}${t.winMessagePart3}</strong><br><br>${t.winInstructions}`;
            if (!confettiInterval) { // Sadece bir kere çalıştır
                 playSound(winSound, 0.6); // <<<--- Kazanma Sesi
                 triggerConfetti(); // Konfeti
                 confettiInterval = true; // Basit bir bayrak, interval kullanmıyoruz şimdilik
            }
        } else { // Ödül kazanılamadıysa
            messageEl.classList.remove('winMessage');
            messageEl.innerText = `${t.gameOverBase} ${finalScore}`;
             // gameOverSound'u burada çalabiliriz (sadece bir kere)
             // Ancak gameOver bayrağı zaten true, noLoop çalışıyor. Belki de oyunu bitiren yerde çalmak daha iyi.
        }
        messageEl.style.display = 'block';

        // Yeniden başlatma butonu veya hak bitti mesajı
        if (lives > 0) { document.getElementById('restartButton').style.display = 'block'; }
        else {
             document.getElementById('restartButton').style.display = 'none';
             let noLivesEl = document.getElementById('noLivesMessage');
             let noLivesText = `<br><br><strong style="color: red;">${t.noMoreLives}</strong>`;
             if (!noLivesEl) { messageEl.innerHTML += noLivesText; }
             else { noLivesEl.innerHTML = noLivesText; noLivesEl.style.display = 'block'; }
             // Hak bittiğinde game over sesi çalabiliriz (eğer ödül sesi çalmadıysa)
             // if (!(reward && reward.amount) && !gameOverSoundPlayed) { ... } // Daha karmaşık hale geliyor
        }
        noLoop(); return;
    }

    // --- Oyun Devam Ediyor ---
    fill(playerColor); noStroke(); rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);
    let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7; if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; } else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }
    if (frameCount % spawnRate === 0 && lives > 0) { spawnKargoFromPool(minSpeed, maxSpeed); }

    // Kargoları yönet
    for (let i = 0; i < kargoPool.length; i++) {
        let kargo = kargoPool[i];
        if (!kargo.active) { continue; }
        let speedMultiplier = deltaTime / (1000 / 60); if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; }
        kargo.y += kargo.speed * speedMultiplier;
        push(); translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); imageMode(CENTER); if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); } else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); } else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); } pop();

        if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) {
            score += kargo.isBonus ? 5 : 1;
            kargo.active = false;
            playSound(catchSound, 0.7); // <<<--- Yakalama Sesi
        }
        else if (kargo.y > height + kargo.h) {
            let wasBonus = kargo.isBonus;
            kargo.active = false;
            if (!wasBonus) {
                misses += 1;
                playSound(missSound, 0.6); // <<<--- Kaçırma Sesi
                if (misses >= 3) {
                    finalScore = score; gameOver = true;
                    playSound(gameOverSound, 0.7); // <<<--- Oyun Bitti Sesi (3 kaçınca)
                }
            }
        }
    }

    // Bilgileri Ekrana Yazdır
    const t = texts[currentLang]; fill(50); textSize( isVertical ? 16 : 18 ); textAlign(LEFT, TOP); let textY = isVertical ? 15 : 20; let textOffset = isVertical ? 25 : 30; text(t.scoreLabel + score, 15, textY); text(t.missedLabel + misses + '/3', 15, textY + textOffset); text(t.livesLabel + lives, 15, textY + textOffset * 2);
}

// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
function startGame() {
    playSound(clickSound); // <<<--- Tıklama Sesi
    const emailInput = document.getElementById('emailInput'); const emailError = document.getElementById('emailError'); const email = emailInput.value.trim();
    if (isValidEmail(email)) {
        emailError.style.display = 'none'; lives = checkLives();
        if (lives > 0) {
            document.getElementById('startScreen').style.display = 'none'; document.getElementById('gameCanvas').style.display = 'block'; document.getElementById('restartButton').style.display = 'none'; document.getElementById('message').style.display = 'none';
            resetGame(); frameCount = 0;

            // Arka plan müziğini başlat (eğer çalmıyorsa)
            if (bgMusic && bgMusic.isLoaded() && !isBgMusicPlaying) {
                bgMusic.setVolume(0.3); // Sesi biraz kısık başlatalım
                bgMusic.loop();
                isBgMusicPlaying = true;
            } else if (isBgMusicPlaying && bgMusic && !bgMusic.isPlaying()) {
                 // Eğer durmuşsa tekrar başlat (nadiren olabilir)
                 bgMusic.loop();
            }

            loop(); console.log('Oyun başlatıldı.');
        } else { document.getElementById('message').innerText = texts[currentLang].noMoreLives; document.getElementById('message').style.display = 'block'; }
    } else { emailError.style.display = 'block'; }
 }

function restartGame() {
    playSound(clickSound); // <<<--- Tıklama Sesi
    if (lives > 0) {
       updateStoredLives(lives - 1);
       if (lives > 0) {
          document.getElementById('restartButton').style.display = 'none'; document.getElementById('message').style.display = 'none'; if(confettiInterval) { clearInterval(confettiInterval); confettiInterval = null;}
          resetGame(); frameCount = 0;
          // Müzik çalıyorsa devam etsin, çalmıyorsa başlat (nadiren)
          if (bgMusic && bgMusic.isLoaded() && !isBgMusicPlaying) { bgMusic.loop(); isBgMusicPlaying = true; }
          else if (isBgMusicPlaying && bgMusic && !bgMusic.isPlaying()){ bgMusic.loop(); }
          loop(); console.log('Oyun yeniden başlatıldı.');
       } else {
          finalScore = score; gameOver = true;
          playSound(gameOverSound, 0.7); // <<<--- Oyun Bitti Sesi (Son hak kullanılınca)
          console.log('Son hak kullanıldı, oyun bitti.'); redraw();
       }
    }
}

function resetGame() {
    score = 0; misses = 0; giftMessage = ''; gameOver = false; finalScore = 0;
    for (let i = 0; i < kargoPool.length; i++) { kargoPool[i].active = false; }
    if (gleen) { gleen.x = width / 2 - gleen.w / 2; gleen.y = height - (isVertical ? 40 : 60); }
    document.getElementById('message').style.display = 'none'; document.getElementById('restartButton').style.display = 'none';
    if(confettiInterval) { clearInterval(confettiInterval); confettiInterval = null;}
    // Müziği durdurma seçeneği: İstersen oyun bitince/sıfırlanınca müziği durdurabiliriz.
    // if (bgMusic && isBgMusicPlaying) {
    //     bgMusic.stop();
    //     isBgMusicPlaying = false;
    // }
}

// --- Dokunma Fonksiyonları ---
function touchStarted() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchMoved() { if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) { return false; } }
function touchEnded() { }
