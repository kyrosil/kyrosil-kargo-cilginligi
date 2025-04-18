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
function setText(elementId, textContent) { /* ... öncekiyle aynı ... */ }
function setPlaceholder(elementId, placeholderText) { /* ... öncekiyle aynı ... */ }
function updateTexts(lang) { /* ... öncekiyle aynı (sağlamlaştırılmış) ... */ }
function getReward(finalScore, lang) { /* ... öncekiyle aynı ... */ }

// E-posta kontrol fonksiyonu (DETAYLI LOG EKLENDİ)
function isValidEmail(email) {
    console.log(`[isValidEmail] Kontrol edilen email: "${email}"`); // 1. Gelen email'i yazdır
    const isTruthy = !!email; // email boş değilse veya null/undefined değilse true olur
    console.log(`[isValidEmail] >> Boş değil mi? (isTruthy): ${isTruthy}`); // 2. Boş olup olmadığını yazdır

    const hasAt = email ? email.includes('@') : false; // email varsa @ içeriyor mu?
    console.log(`[isValidEmail] >> '@' içeriyor mu? (hasAt): ${hasAt}`); // 3. @ kontrol sonucunu yazdır

    const hasDot = email ? email.includes('.') : false; // email varsa . içeriyor mu?
    console.log(`[isValidEmail] >> '.' içeriyor mu? (hasDot): ${hasDot}`); // 4. . kontrol sonucunu yazdır

    const result = isTruthy && hasAt && hasDot; // Sonucu hesapla
    console.log(`[isValidEmail] >> SONUÇ (Geçerli mi?): ${result}`); // 5. Final sonucu yazdır
    return result;
}

function triggerConfetti() { /* ... öncekiyle aynı ... */ }
function findInactiveKargo() { /* ... öncekiyle aynı ... */ }
function spawnKargoFromPool(minSpeed, maxSpeed) { /* ... öncekiyle aynı ... */ }
function soundLoaded() { /* ... öncekiyle aynı ... */ }
function soundLoadError(err) { /* ... öncekiyle aynı ... */ }
function soundLoadProgress(percent) { /* ... öncekiyle aynı ... */ }
function playSound(soundFile, volume = 0.5, rate = 1, pan = 0) { /* ... öncekiyle aynı ... */ }

// --- p5.js Özel Fonksiyonları ---
function preload() { /* ... öncekiyle aynı ... */ }
function setup() { /* ... öncekiyle aynı (sağlamlaştırılmış) ... */ }
function draw() { /* ... öncekiyle aynı ... */ }
function startGame() { /* ... öncekiyle aynı (sağlamlaştırılmış) ... */ }
function restartGame() { /* ... öncekiyle aynı ... */ }
function resetGame() { /* ... öncekiyle aynı ... */ }
function touchStarted() { /* ... (Yorumda) ... */ }
function touchMoved() { /* ... (Yorumda) ... */ }
function touchEnded() { /* ... (Yorumda) ... */ }
