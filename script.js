// --- Oyun Değişkenleri, Ayarları, Ödüller, Metinler ---
// ... (Diğer kısımlar aynı) ...
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

// Dil metinlerini güncelleyen fonksiyon (DETAYLI LOG EKLENDİ)
function updateTexts(lang) {
    console.log(`[updateTexts] BAŞLADI - Dil: ${lang}`);
    try {
        const t = texts[lang];
        if (!t) {
            console.error(`[updateTexts] HATA: '${lang}' için metinler bulunamadı!`);
            return;
        }

        // Basit metin güncellemeleri
        document.getElementById('game-title').innerText = t.gameTitle;
        console.log("[updateTexts] game-title güncellendi.");
        document.getElementById('rewardTitle').innerText = t.rewardTitle;
        console.log("[updateTexts] rewardTitle güncellendi.");
        document.getElementById('pointInfo').innerText = t.pointInfo;
        console.log("[updateTexts] pointInfo güncellendi.");
        document.getElementById('howToPlay').innerText = t.howToPlay;
        console.log("[updateTexts] howToPlay güncellendi.");
        document.getElementById('emailLabel').innerText = t.emailLabel;
        console.log("[updateTexts] emailLabel güncellendi.");
        document.getElementById('emailInput').placeholder = t.emailPlaceholder;
        console.log("[updateTexts] emailInput placeholder güncellendi.");
        document.getElementById('startButton').innerText = t.startBtn;
        console.log("[updateTexts] startButton metni güncellendi.");
        document.getElementById('restartButton').innerText = t.restartBtn;
        console.log("[updateTexts] restartButton metni güncellendi.");
        document.getElementById('emailError').innerText = t.emailError;
        console.log("[updateTexts] emailError metni güncellendi.");

        // Ödül listesini oluşturma (Şüpheli Kısım)
        console.log("[updateTexts] Ödül listesi oluşturuluyor...");
        const rewardListEl = document.getElementById('rewardList');
        if (!rewardListEl) { console.error("[updateTexts] HATA: rewardList elementi bulunamadı!"); return; }
        rewardListEl.innerHTML = ''; // Önceki listeyi temizle

        const currentRewardTiers = rewardTiers[lang];
        if (!currentRewardTiers) { console.error(`[updateTexts] HATA: '${lang}' için ödül baremleri bulunamadı!`); return; }

        // try-catch içine alalım döngüyü
        try {
            currentRewardTiers.forEach((tier, index) => {
                console.log(`[updateTexts] Liste döngüsü ${index + 1}. eleman:`, tier);
                if (tier.amount) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`;
                    rewardListEl.appendChild(li);
                }
            });
            console.log("[updateTexts] Ödül listesi başarıyla oluşturuldu.");
        } catch (listError) {
            console.error("[updateTexts] HATA: Ödül listesi oluşturulurken hata oluştu!", listError);
        }


        // Avrupa notunu göster/gizle
        console.log("[updateTexts] Avrupa notu kontrol ediliyor...");
        const europeNoteEl = document.getElementById('europeNote');
        if (!europeNoteEl) { console.error("[updateTexts] HATA: europeNote elementi bulunamadı!"); return; }
        if (lang === 'EN' && t.europeNote) { europeNoteEl.innerText = t.europeNote; europeNoteEl.style.display = 'block'; }
        else { europeNoteEl.style.display = 'none'; }
        console.log("[updateTexts] Avrupa notu ayarlandı.");


        // Aktif buton stilini ayarla
        console.log("[updateTexts] Buton stilleri ayarlanıyor...");
        document.getElementById('lang-tr').classList.toggle('active', lang === 'TR');
        document.getElementById('lang-en').classList.toggle('active', lang === 'EN');
        document.documentElement.lang = lang.toLowerCase();
        console.log(`[updateTexts] BİTTİ - Dil: ${lang}`);

    } catch (error) {
        console.error(`[updateTexts] Genel HATA oluştu - Dil: ${lang}`, error);
    }
}


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
    console.log('[setup] Kurulum Bitti Log Öncesi. Haklar:', lives); // LOG

    // Dil butonlarına event listener ekle (LOG EKLENDİ)
    const langTRButton = document.getElementById('lang-tr');
    const langENButton = document.getElementById('lang-en');
    const emailInputForTouch = document.getElementById('emailInput');

    if (langTRButton) {
        langTRButton.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (document.activeElement !== langTRButton) langTRButton.focus();
             emailInputForTouch.blur();
            console.log("[Event] TR butonu TOUCHED. Mevcut Dil:", currentLang); // LOG
            playSound(clickSound);
            if (currentLang !== 'TR') {
                console.log("[Event] TR diline geçiliyor..."); // LOG
                currentLang = 'TR';
                updateTexts(currentLang);
                console.log("[Event] TR için updateTexts çağrıldı."); // LOG
            } else { console.log("[Event] Zaten TR'de."); } // LOG
        }, { passive: false });
         console.log("[setup] TR Buton Listener Eklendi."); // LOG
    } else { console.error("[setup] TR Dil butonu bulunamadı!"); }

    if (langENButton) {
        langENButton.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (document.activeElement !== langENButton) langENButton.focus();
             emailInputForTouch.blur();
            console.log("[Event] EN butonu TOUCHED. Mevcut Dil:", currentLang); // LOG
            playSound(clickSound);
            if (currentLang !== 'EN') {
                console.log("[Event] EN diline geçiliyor..."); // LOG
                currentLang = 'EN';
                updateTexts(currentLang);
                console.log("[Event] EN için updateTexts çağrıldı."); // LOG
            } else { console.log("[Event] Zaten EN'de."); } // LOG
        }, { passive: false });
         console.log("[setup] EN Buton Listener Eklendi."); // LOG
     } else { console.error("[setup] EN Dil butonu bulunamadı!"); }

    // Başlangıç metinlerini ayarla
    console.log("[setup] İlk updateTexts çağrılıyor..."); // LOG
    updateTexts(currentLang);
    console.log("[setup] İlk updateTexts çağrıldı."); // LOG

    gameInstanceCanvas.style('pointer-events', 'auto');
    noLoop();
    console.log("[setup] Kurulum Tamamlandı."); // LOG
}

function draw() { /* ... (öncekiyle aynı) ... */ }

function startGame() { // LOG EKLENDİ
    console.log("[startGame] Fonksiyonu çağrıldı.");
    playSound(clickSound);
    const emailInput = document.getElementById('emailInput');
    const emailError = document.getElementById('emailError');
    if (!emailInput || !emailError) { console.error("[startGame] Email elemanları bulunamadı!"); return; }
    const email = emailInput.value.trim();

    console.log("[startGame] Email kontrol ediliyor:", email);
    if (isValidEmail(email)) {
        console.log("[startGame] Email geçerli.");
        emailError.style.display = 'none';
        lives = checkLives();
        console.log("[startGame] Hak kontrol sonucu:", lives);
        if (lives > 0) {
            console.log("[startGame] Oyun başlatılıyor...");
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('restartButton').style.display = 'none';
            document.getElementById('message').style.display = 'none';
            resetGame();
            if (gameInstanceCanvas) { gameInstanceCanvas.style('pointer-events', 'auto'); }
            frameCount = 0;
            if (bgMusic && bgMusic.isLoaded() && !isBgMusicPlaying) { bgMusic.setVolume(0.3); bgMusic.loop(); isBgMusicPlaying = true; }
            else if (isBgMusicPlaying && bgMusic && !bgMusic.isPlaying()) { bgMusic.loop(); }
            loop();
            console.log('[startGame] Oyun başarıyla başlatıldı.');
        } else {
             console.log("[startGame] Hak bitti.");
             document.getElementById('message').innerText = texts[currentLang].noMoreLives;
             document.getElementById('message').style.display = 'block';
        }
    } else {
        console.log("[startGame] Email geçersiz.");
        emailError.style.display = 'block';
    }
}

function restartGame() { /* ... (öncekiyle aynı) ... */ }
function resetGame() { /* ... (öncekiyle aynı) ... */ }
function touchStarted() { /* ... öncekiyle aynı ... */ }
function touchMoved() { /* ... öncekiyle aynı ... */ }
function touchEnded() { /* ... öncekiyle aynı ... */ }
