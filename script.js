// --- Oyun Değişkenleri ---
let gleen; let kargolar = []; let score = 0; let misses = 0;
let giftMessage = ''; // Eski hediye mesajı (belki kaldırılır veya kullanılır)
let gameOver = false; let lives = 3;
let trendyolLogo, kyrosilLogo;
let gameInstanceCanvas; let isVertical = false;
let currentLang = 'TR'; // Başlangıç dili
let confettiInterval; // Konfeti için
let finalScore = 0; // Oyun bittiğindeki skoru saklamak için

// --- Oyun Ayarları ---
const normalKargoBoyutu = 35;
const bonusKargoBoyutu = 55;
const canvasBackgroundColor = 248;
const playerColor = '#ff6200';

// --- Ödül Baremleri ---
const rewardTiers = {
    TR: [
        { score: 500, amount: "10000 TL" }, { score: 350, amount: "1000 TL" },
        { score: 250, amount: "500 TL" },  { score: 100, amount: "250 TL" },
        { score: 50, amount: "100 TL" },   { score: 0, amount: null } // Taban durum
    ],
    EN: [
        { score: 500, amount: "250 Euro" }, { score: 350, amount: "50 Euro" },
        { score: 250, amount: "30 Euro" },  { score: 100, amount: "15 Euro" },
        { score: 50, amount: "5 Euro" },    { score: 0, amount: null } // Taban durum
    ]
};

// --- Metinler ---
const texts = {
    TR: {
        gameTitle: "Trendyol Kargo Kapmaca",
        rewardTitle: "Ödül Baremleri (TL)",
        pointInfo: "Trendyol Logo: 1 Puan | Kyrosil Logo (Bonus): 5 Puan",
        europeNote: "", // TR için boş
        howToPlay: "Günde 3 hakla oyna, 3 kargo kaçırırsan oyun biter!",
        emailLabel: "Başlamak için E-posta Adresiniz:",
        emailPlaceholder: "Trendyol E-posta Adresiniz",
        emailError: "Lütfen geçerli bir e-posta adresi girin.",
        startBtn: "Başla",
        restartBtn: "Yeniden Başlat",
        // Ödül Listesi Metinleri (JS içinde oluşturulacak)
        // Oyun İçi
        scoreLabel: "Puan: ", missedLabel: "Kaçırılan: ", livesLabel: "Kalan Hak: ",
        // Oyun Sonu
        gameOverBase: "Oyun Bitti!", // Skoru ekle
        winMessagePart1: "TEBRİKLER! ", winMessagePart2: " PUAN TOPLAYARAK ", winMessagePart3: " HEDİYE ÇEKİ KAZANDINIZ!",
        winInstructions: "KODUNUZU ALMAK İÇİN giriş yaptığınız mail ile birlikte\ngiveaways@kyrosil.eu mail adresine ekran görüntüsü ile ulaşınız.\nOrtalama 20 dakika içerisinde otomatik teslim edilecektir.",
        noMoreLives: "Günlük 3 hakkın bitti! Yarın tekrar dene.",
        tryAgain: "Tekrar denemek için\n1 hakkını kullan."
    },
    EN: {
        gameTitle: "Trendyol Cargo Catch",
        rewardTitle: "Reward Tiers (EUR)",
        pointInfo: "Trendyol Logo: 1 Point | Kyrosil Logo (Bonus): 5 Points",
        europeNote: "IMPORTANT: Codes are valid for Trendyol Europe only. Cannot be used in Turkey.",
        howToPlay: "Play with 3 lives per day. Game over if you miss 3 packages!",
        emailLabel: "Your E-mail Address to Start:",
        emailPlaceholder: "Your Trendyol E-mail Address",
        emailError: "Please enter a valid e-mail address.",
        startBtn: "Start",
        restartBtn: "Restart",
        // Reward List Text (Generated in JS)
        // In-Game
        scoreLabel: "Score: ", missedLabel: "Missed: ", livesLabel: "Lives Left: ",
        // Game Over
        gameOverBase: "Game Over!", // Add score
        winMessagePart1: "CONGRATULATIONS! ", winMessagePart2: " POINTS EARNED YOU A ", winMessagePart3: " GIFT CODE!",
        winInstructions: "To receive your code, please contact giveaways@kyrosil.eu\nwith a screenshot using the email address you provided.\nDelivery is automated and takes approx. 20 minutes.",
        noMoreLives: "You've used your 3 lives for today! Try again tomorrow.",
        tryAgain: "Use 1 life to try again."
    }
};

// --- Yardımcı Fonksiyonlar ---
function checkLives() { /* ... (öncekiyle aynı) ... */
    const today = new Date().toDateString(); const storedDate = localStorage.getItem('gameDate'); const storedLives = localStorage.getItem('lives');
    if (storedDate !== today || storedLives === null) { localStorage.setItem('gameDate', today); localStorage.setItem('lives', '3'); return 3; }
    const currentLives = parseInt(storedLives); return isNaN(currentLives) || currentLives < 0 ? 3 : currentLives;
}
function updateStoredLives(newLives) { /* ... (öncekiyle aynı, log hariç) ... */
    lives = newLives >= 0 ? newLives : 0; localStorage.setItem('lives', lives.toString());
    // console.log('Hak güncellendi (localStorage):', lives);
}

// Dil metinlerini güncelleyen fonksiyon
function updateTexts(lang) {
    const t = texts[lang];
    document.getElementById('game-title').innerText = t.gameTitle;
    document.getElementById('rewardTitle').innerText = t.rewardTitle;
    document.getElementById('pointInfo').innerText = t.pointInfo;
    document.getElementById('howToPlay').innerText = t.howToPlay;
    document.getElementById('emailLabel').innerText = t.emailLabel;
    document.getElementById('emailInput').placeholder = t.emailPlaceholder;
    document.getElementById('startButton').innerText = t.startBtn;
    document.getElementById('restartButton').innerText = t.restartBtn;
    document.getElementById('emailError').innerText = t.emailError; // Hata mesajı metni

    // Ödül listesini oluştur
    const rewardListEl = document.getElementById('rewardList');
    rewardListEl.innerHTML = ''; // Önceki listeyi temizle
    rewardTiers[lang].forEach(tier => {
        if (tier.amount) { // Sadece null olmayanları göster
            const li = document.createElement('li');
            // Örnek: <strong>50 Puan:</strong> <span>100 TL</span>
            li.innerHTML = `<strong>${tier.score} Puan:</strong> <span>${tier.amount}</span>`;
            rewardListEl.appendChild(li);
        }
    });

    // Avrupa notunu göster/gizle
    const europeNoteEl = document.getElementById('europeNote');
    if (lang === 'EN' && t.europeNote) {
        europeNoteEl.innerText = t.europeNote;
        europeNoteEl.style.display = 'block';
    } else {
        europeNoteEl.style.display = 'none';
    }

    // Aktif buton stilini ayarla
    document.getElementById('lang-tr').classList.toggle('active', lang === 'TR');
    document.getElementById('lang-en').classList.toggle('active', lang === 'EN');

    // HTML lang özelliğini güncelle (ekran okuyucular için iyi olabilir)
    document.documentElement.lang = lang.toLowerCase();
}

// Skora göre ödülü bulan fonksiyon
function getReward(finalScore, lang) {
    const tiers = rewardTiers[lang];
    for (const tier of tiers) {
        if (finalScore >= tier.score) {
            return tier.amount ? { amount: tier.amount, score: tier.score } : null; // Kazanılan miktarı ve hangi barem olduğunu döndür
        }
    }
    return null; // Hiçbir bareme ulaşılamadıysa
}

// Basit e-posta format kontrolü
function isValidEmail(email) {
    // Çok basit kontrol: @ var mı ve . var mı? Yeterince iyi "göstermelik" için.
    return email && email.includes('@') && email.includes('.');
}

// --- Konfeti Fonksiyonu (Placeholder veya Kütüphane ile) ---
function triggerConfetti() {
    console.log("Konfeti Patlatılıyor!"); // Placeholder
    // Gerçek kütüphane kullanımı (eğer eklenirse):
    // if (typeof confetti === 'function') {
    //     confetti({
    //         particleCount: 150,
    //         spread: 90,
    //         origin: { y: 0.6 }
    //     });
    // }
}

// --- p5.js Özel Fonksiyonları ---
function preload() { /* ... (öncekiyle aynı) ... */
     try { trendyolLogo = loadImage('images.jpg'); kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png'); } catch (e) { console.error('Logo yükleme hatası:', e); trendyolLogo = null; kyrosilLogo = null; }
}

function setup() { /* ... (öncekiyle aynı boyutlandırma) ... */
    let canvasW, canvasH; let w = windowWidth; let h = windowHeight;
    if (w < h && w < 600) { isVertical = true; canvasW = w * 0.95; canvasH = h * 0.80; }
    else { isVertical = false; canvasW = 800; canvasH = 600; }
    gameInstanceCanvas = createCanvas(canvasW, canvasH); gameInstanceCanvas.parent('gameCanvas');
    let gleenWidth = 50; let gleenHeight = 15; let gleenY = canvasH - (isVertical ? 40 : 60);
    gleen = { x: canvasW / 2 - gleenWidth / 2, y: gleenY, w: gleenWidth, h: gleenHeight };
    lives = checkLives();
    console.log('Kurulum Bitti. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives);

    // Dil butonlarına event listener ekle
    document.getElementById('lang-tr').addEventListener('click', () => {
        if (currentLang !== 'TR') { currentLang = 'TR'; updateTexts(currentLang); }
    });
    document.getElementById('lang-en').addEventListener('click', () => {
        if (currentLang !== 'EN') { currentLang = 'EN'; updateTexts(currentLang); }
    });

    // Başlangıç metinlerini ayarla
    updateTexts(currentLang);

    noLoop(); // Oyun döngüsünü başlatma
}


function draw() {
    background(canvasBackgroundColor);

    if (gameOver) {
        // --- Oyun Bitti Ekranı (YENİ) ---
        const reward = getReward(finalScore, currentLang); // Skora göre ödülü al
        const t = texts[currentLang]; // Mevcut dilin metinlerini al
        const messageEl = document.getElementById('message'); // Mesaj alanı

        messageEl.innerHTML = ''; // Önceki mesajı temizle
        messageEl.className = ''; // Önceki sınıfları temizle

        if (reward && reward.amount) { // Ödül kazanıldıysa
            messageEl.classList.add('winMessage'); // Kazanma stili uygula
            messageEl.innerHTML = `
                <strong>${t.winMessagePart1}${finalScore}${t.winMessagePart2}${reward.amount}${t.winMessagePart3}</strong>
                <br><br>
                ${t.winInstructions}
            `;
             // Konfetiyi sadece bir kere patlat
             if (!confettiInterval) { // Eğer interval zaten çalışmıyorsa
                 triggerConfetti();
                 // İstersen birkaç saniye boyunca patlatabilirsin:
                 // confettiInterval = setInterval(triggerConfetti, 800);
                 // setTimeout(() => { clearInterval(confettiInterval); confettiInterval = null; }, 4000); // 4 saniye sonra durdur
             }

        } else { // Ödül kazanılamadıysa
             messageEl.classList.remove('winMessage'); // Normal mesaj stili (kırmızı)
             messageEl.innerText = `${t.gameOverBase} ${finalScore}`;
        }
        messageEl.style.display = 'block'; // Mesajı göster

        // Yeniden başlatma butonu veya hak bitti mesajı
        if (lives > 0) {
            document.getElementById('restartButton').style.display = 'block';
            // Yeniden başlatma butonunun altındaki küçük mesaj (opsiyonel)
            // let tryAgainEl = document.getElementById('tryAgainMessage'); // HTML'e eklemek gerekir
            // if (tryAgainEl) tryAgainEl.innerText = t.tryAgain;
        } else {
            document.getElementById('restartButton').style.display = 'none';
            let noLivesEl = document.getElementById('noLivesMessage'); // HTML'e eklemek gerekir
            if (!noLivesEl) { // Eğer yoksa ana mesaj alanına ekle
                 messageEl.innerHTML += `<br><br><strong style="color: red;">${t.noMoreLives}</strong>`;
            } else {
                 noLivesEl.innerText = t.noMoreLives;
                 noLivesEl.style.display = 'block';
            }
        }

        noLoop(); return;
    }

    // --- Oyun Devam Ediyor ---
    // ... (Sepet çizimi, hareket, zorluk, kargo ekleme - öncekiyle aynı) ...
    fill(playerColor); noStroke(); rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);
    let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
    if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; } else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }
    if (frameCount % spawnRate === 0 && lives > 0) { let isBonus = random(1) < 0.15; let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu; kargolar.push({ x: random(10, width - (kargoSize + 10)), y: -(kargoSize + 10), w: kargoSize, h: kargoSize, speed: random(minSpeed, maxSpeed), isBonus: isBonus }); }

    // Kargoları yönet
    for (let i = kargolar.length - 1; i >= 0; i--) {
        let kargo = kargolar[i];
        let speedMultiplier = deltaTime / (1000 / 60);
        if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; }
        kargo.y += kargo.speed * speedMultiplier;

        push(); translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); imageMode(CENTER);
        if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); }
        else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); }
        else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); }
        pop();

        if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) {
            score += kargo.isBonus ? 5 : 1; kargolar.splice(i, 1);
            // Hediye çeki kazanma kontrolü (eski giftMessage kaldırılabilir veya anlık efekt için tutulabilir)
            // if (score >= 50 && !giftMessage) { giftMessage = ... }
        }
        else if (kargo.y > height + kargo.h) {
            let kacirilanKargo = kargolar.splice(i, 1)[0];
            if (!kacirilanKargo.isBonus) {
                misses += 1;
                if (misses >= 3) {
                    // console.log('3 kargo kaçırıldı, oyun bitti.');
                    finalScore = score; // <<<--- Oyun bittiğindeki skoru sakla
                    gameOver = true; // Hak düşürme yok
                }
            }
        }
    }

    // Bilgileri Ekrana Yazdır (Dil desteği eklendi)
    const t = texts[currentLang];
    fill(50); textSize( isVertical ? 16 : 18 ); textAlign(LEFT, TOP);
    let textY = isVertical ? 15 : 20; let textOffset = isVertical ? 25 : 30;
    text(t.scoreLabel + score, 15, textY);
    text(t.missedLabel + misses + '/3', 15, textY + textOffset);
    text(t.livesLabel + lives, 15, textY + textOffset * 2);

    // Eski hediye mesajı yerine yeni sistem var
    // if (giftMessage) { ... }

} // draw() fonksiyonu sonu


// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
function startGame() {
    const emailInput = document.getElementById('emailInput');
    const emailError = document.getElementById('emailError');
    const email = emailInput.value.trim(); // Değeri al ve boşlukları temizle

    if (isValidEmail(email)) { // E-posta geçerliyse
        emailError.style.display = 'none'; // Hata mesajını gizle
        lives = checkLives();
        if (lives > 0) {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('restartButton').style.display = 'none';
            document.getElementById('message').style.display = 'none'; // Genel mesaj alanını gizle
            resetGame();
            frameCount = 0;
            loop();
            console.log('Oyun başlatıldı.');
        } else { // Hak yoksa
            document.getElementById('message').innerText = texts[currentLang].noMoreLives;
            document.getElementById('message').style.display = 'block';
        }
    } else { // E-posta geçerli değilse
        emailError.style.display = 'block'; // Hata mesajını göster
    }
}

function restartGame() {
    if (lives > 0) {
       updateStoredLives(lives - 1); // Hak düşür
       if (lives > 0) { // Hak kaldıysa
          document.getElementById('restartButton').style.display = 'none';
          document.getElementById('message').style.display = 'none'; // Önceki mesajı gizle
           if(confettiInterval) { clearInterval(confettiInterval); confettiInterval = null;} // Konfetiyi durdur
          resetGame();
          frameCount = 0;
          loop();
          console.log('Oyun yeniden başlatıldı.');
       } else { // Son hak kullanıldıysa
          finalScore = score; // Skoru kaydet
          gameOver = true;
          console.log('Son hak kullanıldı, oyun bitti.');
          redraw(); // Oyun bitti ekranını çizdir
       }
    }
}

function resetGame() {
    score = 0; misses = 0; kargolar = []; giftMessage = ''; gameOver = false; finalScore = 0;
    if (gleen) { gleen.x = width / 2 - gleen.w / 2; gleen.y = height - (isVertical ? 40 : 60); }
    // Önceki oyun sonu mesajını ve konfetiyi temizle
    document.getElementById('message').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none'; // Restart butonu da gizlensin
    if(confettiInterval) { clearInterval(confettiInterval); confettiInterval = null;}
    // console.log("Oyun değişkenleri sıfırlandı.");
}
