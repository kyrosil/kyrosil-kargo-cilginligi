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

// Elementin varlığını kontrol edip metin atayan yardımcı fonksiyon
function setText(elementId, textContent) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = textContent;
        // console.log(`[setText] ID: ${elementId} güncellendi.`); // İstersen logları açabilirsin
    } else {
        console.error(`[setText] HATA: Element bulunamadı! ID: ${elementId}`);
    }
}
// Elementin varlığını kontrol edip placeholder atayan yardımcı fonksiyon
function setPlaceholder(elementId, placeholderText) {
    const element = document.getElementById(elementId);
    if (element) {
        element.placeholder = placeholderText;
        // console.log(`[setPlaceholder] ID: ${elementId} güncellendi.`);
    } else {
        console.error(`[setPlaceholder] HATA: Element bulunamadı! ID: ${elementId}`);
    }
}

// Dil metinlerini güncelleyen fonksiyon (SAĞLAMLAŞTIRILDI)
function updateTexts(lang) {
    console.log(`[updateTexts] BAŞLADI - Dil: ${lang}`);
    try {
        const t = texts[lang];
        if (!t) { throw new Error(`'${lang}' için metinler bulunamadı!`); } // Hata fırlat

        // Yardımcı fonksiyonlarla metinleri ata
        setText('game-title', t.gameTitle);
        setText('rewardTitle', t.rewardTitle);
        setText('pointInfo', t.pointInfo);
        setText('howToPlay', t.howToPlay);
        setText('emailLabel', t.emailLabel);
        setPlaceholder('emailInput', t.emailPlaceholder); // input için placeholder
        setText('startButton', t.startBtn);
        setText('restartButton', t.restartBtn);
        setText('emailError', t.emailError);

        // Ödül listesini oluşturma (try-catch içinde)
        console.log("[updateTexts] Ödül listesi oluşturuluyor...");
        const rewardListEl = document.getElementById('rewardList');
        if (!rewardListEl) { throw new Error("rewardList elementi bulunamadı!"); }
        rewardListEl.innerHTML = '';
        const currentRewardTiers = rewardTiers[lang];
        if (!currentRewardTiers) { throw new Error(`'${lang}' için ödül baremleri bulunamadı!`); }

        try {
            currentRewardTiers.forEach((tier, index) => {
                if (tier.amount) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`;
                    rewardListEl.appendChild(li);
                }
            });
            console.log("[updateTexts] Ödül listesi başarıyla oluşturuldu.");
        } catch (listError) {
            console.error("[updateTexts] HATA: Ödül listesi oluşturulurken hata oluştu!", listError);
            // Hata olsa bile devam etmeyi deneyebiliriz veya burada durabiliriz. Şimdilik devam etsin.
        }

        // Avrupa notunu göster/gizle
        console.log("[updateTexts] Avrupa notu kontrol ediliyor...");
        const europeNoteEl = document.getElementById('europeNote');
        if (!europeNoteEl) { throw new Error("europeNote elementi bulunamadı!"); }
        if (lang === 'EN' && t.europeNote) { europeNoteEl.innerText = t.europeNote; europeNoteEl.style.display = 'block'; }
        else { europeNoteEl.style.display = 'none'; }
        console.log("[updateTexts] Avrupa notu ayarlandı.");

        // Aktif buton stilini ayarla
        console.log("[updateTexts] Buton stilleri ayarlanıyor...");
         const btnTR = document.getElementById('lang-tr');
         const btnEN = document.getElementById('lang-en');
         if (btnTR) btnTR.classList.toggle('active', lang === 'TR'); else console.error("TR Butonu bulunamadı!");
         if (btnEN) btnEN.classList.toggle('active', lang === 'EN'); else console.error("EN Butonu bulunamadı!");

        document.documentElement.lang = lang.toLowerCase();
        console.log(`[updateTexts] BİTTİ - Dil: ${lang}`);

    } catch (error) {
        // Eğer try bloğu içinde bir hata olursa burada yakalanır ve konsola yazdırılır.
        console.error(`[updateTexts] GENEL HATA oluştu - Dil: ${lang}`, error);
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
    console.log("[setup] Başladı...");
    try { // Setup'ı da try-catch içine alalım
        let canvasW, canvasH; let w = windowWidth; let h = windowHeight;
        if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; }
        else { isVertical = false; canvasW = 800; canvasH = 600; }
        gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas');
        let gleenY = canvasH - (isVertical ? 40 : 60);
        gleen = { x: canvasW / 2 - playerWidth / 2, y: gleenY, w: playerWidth, h: playerHeight };
        kargoPool = []; for (let i = 0; i < MAX_KARGOS; i++) { kargoPool.push({ active: false, x: 0, y: 0, w: 0, h: 0, speed: 0, isBonus: false }); }
        lives = checkLives();
        console.log('[setup] Kurulum Bitti Log Öncesi. Haklar:', lives);

        // Dil butonlarına event listener ekle ('click' kullanılıyor)
        const langTRButton = document.getElementById('lang-tr');
        const langENButton = document.getElementById('lang-en');
        const emailInputForTouch = document.getElementById('emailInput'); // Bu artık start içinde lazım

        if (langTRButton) {
            langTRButton.addEventListener('click', () => {
                console.log("[Event] TR button CLICKED.");
                playSound(clickSound);
                if (currentLang !== 'TR') { currentLang = 'TR'; updateTexts(currentLang); }
            });
            console.log("[setup] TR Buton Listener Eklendi (click).");
        } else { console.error("[setup] TR Dil butonu bulunamadı!"); }

        if (langENButton) {
            langENButton.addEventListener('click', () => {
                console.log("[Event] EN button CLICKED.");
                playSound(clickSound);
                if (currentLang !== 'EN') { currentLang = 'EN'; updateTexts(currentLang); }
            });
            console.log("[setup] EN Buton Listener Eklendi (click).");
        } else { console.error("[setup] EN Dil butonu bulunamadı!"); }

        console.log("[setup] İlk updateTexts çağrılıyor...");
        updateTexts(currentLang);
        console.log("[setup] İlk updateTexts çağrıldıktan sonra.");

        if(gameInstanceCanvas) gameInstanceCanvas.style('pointer-events', 'auto'); else console.error("gameInstanceCanvas bulunamadı!");
        noLoop();
        console.log("[setup] Kurulum Tamamlandı."); // Bu log görünmeli
    } catch (setupError) {
        console.error("[setup] KURULUM SIRASINDA KRİTİK HATA!", setupError);
    }
}

function draw() { /* ... (öncekiyle aynı) ... */ }

function startGame() {
    console.log("[startGame] Fonksiyonu çağrıldı."); // İlk log
    try { // startGame'i de try-catch içine alalım
        playSound(clickSound); // Ses çalmayı dene
        const emailInput = document.getElementById('emailInput');
        const emailError = document.getElementById('emailError');
        const startScreen = document.getElementById('startScreen');
        const gameCanvas = document.getElementById('gameCanvas');
        const restartButton = document.getElementById('restartButton');
        const messageDiv = document.getElementById('message'); // message div'ini al

        // Element kontrolleri
        if (!emailInput || !emailError || !startScreen || !gameCanvas || !restartButton || !messageDiv) {
            console.error("[startGame] Gerekli HTML elementlerinden biri veya birkaçı bulunamadı!");
            return; // Element yoksa devam etme
        }

        const email = emailInput.value.trim();
        console.log("[startGame] Email kontrol ediliyor:", email);

        if (isValidEmail(email)) {
            console.log("[startGame] Email geçerli.");
            emailError.style.display = 'none';
            lives = checkLives();
            console.log("[startGame] Hak kontrol sonucu:", lives);
            if (lives > 0) {
                console.log("[startGame] Oyun başlatılıyor...");
                startScreen.style.display = 'none';
                gameCanvas.style.display = 'block'; // Canvas'ı göster
                restartButton.style.display = 'none';
                messageDiv.style.display = 'none'; // Mesaj div'ini gizle
                resetGame();
                if (gameInstanceCanvas) { gameInstanceCanvas.style('pointer-events', 'auto'); }
                frameCount = 0;
                if (bgMusic && bgMusic.isLoaded() && !isBgMusicPlaying) { bgMusic.setVolume(0.3); bgMusic.loop(); isBgMusicPlaying = true; }
                else if (isBgMusicPlaying && bgMusic && !bgMusic.isPlaying()) { bgMusic.loop(); }
                loop(); // Oyun döngüsünü başlat
                console.log('[startGame] Oyun başarıyla başlatıldı.');
            } else {
                 console.log("[startGame] Hak bitti.");
                 messageDiv.innerText = texts[currentLang].noMoreLives;
                 messageDiv.style.display = 'block';
                 // Başlat butonunu tekrar gizle veya pasif yap? Şimdilik kalsın.
            }
        } else {
            console.log("[startGame] Email geçersiz.");
            emailError.style.display = 'block';
        }
    } catch (startError) {
        console.error("[startGame] HATA oluştu!", startError);
    }
}

function restartGame() { /* ... (öncekiyle aynı) ... */ }
function resetGame() { /* ... (öncekiyle aynı) ... */ }
function touchStarted() { /* ... (Yorumda) ... */ }
function touchMoved() { /* ... (Yorumda) ... */ }
function touchEnded() { /* ... (Yorumda) ... */ }
