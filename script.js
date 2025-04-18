// --- Oyun Değişkenleri ---
let gleen;
let kargolar = [];
let score = 0;
let misses = 0;
let giftMessage = '';
let gameOver = false;
let lives = 3;
let trendyolLogo, kyrosilLogo;
let gameInstanceCanvas;
let isVertical = false;

// --- Oyun Ayarları ---
const normalKargoBoyutu = 35;
const bonusKargoBoyutu = 55;

// --- Yardımcı Fonksiyonlar ---
function checkLives() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('gameDate');
  const storedLives = localStorage.getItem('lives');
  if (storedDate !== today || storedLives === null) {
    localStorage.setItem('gameDate', today);
    localStorage.setItem('lives', '3');
    return 3;
  }
  const currentLives = parseInt(storedLives);
  return isNaN(currentLives) || currentLives < 0 ? 3 : currentLives;
}
function updateStoredLives(newLives) {
    // Bu fonksiyon sadece hak sayısını günceller ve localStorage'a yazar
    lives = newLives >= 0 ? newLives : 0;
    localStorage.setItem('lives', lives.toString());
    console.log('Hak güncellendi (localStorage):', lives); // Bu log kalabilir
}

// --- p5.js Özel Fonksiyonları ---
function preload() {
  try {
    trendyolLogo = loadImage('images.jpg');
    kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
  } catch (e) { console.error('Logo yükleme hatası:', e); trendyolLogo = null; kyrosilLogo = null; }
}

function setup() {
    let canvasW, canvasH;
    let w = windowWidth;
    let h = windowHeight;
    // console.log("Pencere Boyutları Algılandı:", w, "x", h);

    if (w < h && w < 600) {
        isVertical = true;
        // console.log("KOŞUL SAĞLANDI: Dikey Mod (Mobil) Algılandı.");
        canvasW = w * 0.95;
        canvasH = h * 0.80;
        // console.log("Dikey Canvas Boyutu Hesaplanıyor:", canvasW, "x", canvasH);
    } else {
        isVertical = false;
        // if (w >= h) { console.log("KOŞUL SAĞLANMADI: Ekran yatay (veya kare)."); }
        // if (w >= 600) { console.log("KOŞUL SAĞLANMADI: Ekran genişliği >= 600px."); }
        // console.log("Yatay Mod (PC/Tablet) Algılandı.");
        canvasW = 800;
        canvasH = 600;
        // console.log("Yatay Canvas Boyutu Ayarlandı:", canvasW, "x", canvasH);
    }

    gameInstanceCanvas = createCanvas(canvasW, canvasH);
    gameInstanceCanvas.parent('gameCanvas');

    let gleenWidth = 50;
    let gleenHeight = 15;
    let gleenY = canvasH - (isVertical ? 40 : 60);
    gleen = { x: canvasW / 2 - gleenWidth / 2, y: gleenY, w: gleenWidth, h: gleenHeight };

    lives = checkLives();
    console.log('Oyun Kurulumu Tamamlandı. Mod:', isVertical ? 'Dikey' : 'Yatay', 'Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives);
    noLoop();
}


function draw() {
    background(200, 200, 255);

    if (gameOver) {
        // ... (Oyun Bitti ekranı - Değişiklik yok) ...
        fill(255, 0, 0); textSize( isVertical ? 30 : 40 );
        textAlign(CENTER, CENTER);
        text('Oyun Bitti!\nPuan: ' + score, width / 2, height / 2 - (isVertical ? 30 : 40));
        if (lives > 0) { // Hala hak varsa (restart butonuna basmadan önce)
            document.getElementById('restartButton').style.display = 'block';
             textSize( isVertical ? 16 : 20 ); fill(0);
             text('Tekrar denemek için\n1 hakkını kullan.', width / 2, height / 2 + (isVertical ? 30 : 40));
        } else {
            document.getElementById('message').style.display = 'block';
            document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
            document.getElementById('restartButton').style.display = 'none';
        }
        noLoop(); return;
    }

    // --- Oyun Devam Ediyor ---
    fill(255, 102, 0); noStroke();
    rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);

    let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
    if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; }
    else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }

    if (frameCount % spawnRate === 0 && lives > 0) {
        let isBonus = random(1) < 0.15;
        let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu;
        kargolar.push({
            x: random(10, width - (kargoSize + 10)), y: -(kargoSize + 10),
            w: kargoSize, h: kargoSize, speed: random(minSpeed, maxSpeed), isBonus: isBonus
        });
    }

    for (let i = kargolar.length - 1; i >= 0; i--) {
        let kargo = kargolar[i];
        let speedMultiplier = deltaTime / (1000 / 60);
        if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; }
        kargo.y += kargo.speed * speedMultiplier;

        push();
        translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2);
        imageMode(CENTER);
        if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); }
        else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); }
        else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); }
        pop();

        if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) {
            score += kargo.isBonus ? 5 : 1;
            kargolar.splice(i, 1);
            if (score >= 50 && !giftMessage) {
                giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
                console.log('Hediye çeki kazanıldı!');
            }
        }
        else if (kargo.y > height + kargo.h) {
            let kacirilanKargo = kargolar.splice(i, 1)[0];
            if (!kacirilanKargo.isBonus) {
                misses += 1;
                if (misses >= 3) {
                    console.log('3 kargo kaçırıldı, oyun bitti (hak henüz düşmedi).'); // LOG GÜNCELLENDİ
                    gameOver = true;
                    // updateStoredLives(lives - 1); // <<<--- BU SATIR YORUM YAPILDI/SİLİNDİ!
                                                    // Hak düşürme işlemi artık sadece restartGame içinde.
                }
            }
        }
    }

    // Bilgileri Ekrana Yazdır
    fill(0); textSize( isVertical ? 16 : 20 );
    textAlign(LEFT, TOP);
    let textY = isVertical ? 15 : 20;
    let textOffset = isVertical ? 25 : 30;
    text('Puan: ' + score, 15, textY);
    text('Kaçırılan: ' + misses + '/3', 15, textY + textOffset);
    text('Kalan Hak: ' + lives, 15, textY + textOffset * 2); // O anki life değerini gösterir

    if (giftMessage) {
        textAlign(CENTER, CENTER); textSize( isVertical ? 22 : 28 ); fill(0, 150, 0);
        text(giftMessage, width / 2, height / 2);
    }
}
// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
function startGame() {
  lives = checkLives(); // Başlarken hakları kontrol et
  if (lives > 0) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    resetGame(); frameCount = 0; loop();
    console.log('Oyun başlatıldı.');
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
  }
}

function restartGame() {
  // Sadece bu fonksiyonda hak düşürülecek!
  if (lives > 0) { // Başlamadan önce hak var mı kontrol et
     updateStoredLives(lives - 1); // HAKKI BURADA DÜŞÜR VE KAYDET
     // Şimdi tekrar kontrol et, hak kaldı mı?
     if (lives > 0) { // Hak 0'a düşmediyse oyunu başlat
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        resetGame();
        frameCount = 0;
        loop();
        console.log('Oyun yeniden başlatıldı.');
     } else { // Hak 0 olduysa, oyunu bitir
        gameOver = true;
        console.log('Son hak kullanıldı, oyun bitti.');
        redraw(); // Oyun bitti ekranını çizdir
     }
  } else {
       // Hak yoksa zaten bu butona basılamamalı ama güvenlik kontrolü
       console.error("Hata: Hak yokken yeniden başlatma denendi!");
  }
}

function resetGame() {
    score = 0; misses = 0; kargolar = []; giftMessage = ''; gameOver = false;
    if (gleen) { gleen.x = width / 2 - gleen.w / 2; gleen.y = height - (isVertical ? 40 : 60); }
    // console.log("Oyun değişkenleri sıfırlandı."); // İstersen bu log kalabilir
}
