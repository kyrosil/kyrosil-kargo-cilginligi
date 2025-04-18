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

// --- Oyun Ayarları ---
const normalKargoBoyutu = 35;
const bonusKargoBoyutu = 55;

// --- Yardımcı Fonksiyonlar ---
function checkLives() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('gameDate');
  const storedLives = localStorage.getItem('lives');
  // console.log("checkLives çalıştı. Tarih:", storedDate, "Hak:", storedLives); // LOG KALDIRILDI

  if (storedDate !== today || storedLives === null) {
    // console.log('Günlük haklar sıfırlandı (checkLives).'); // LOG KALDIRILDI
    localStorage.setItem('gameDate', today);
    localStorage.setItem('lives', '3');
    return 3;
  }

  const currentLives = parseInt(storedLives);
  // console.log('Kaydedilmiş hak bulundu (checkLives):', currentLives); // LOG KALDIRILDI
  return isNaN(currentLives) || currentLives < 0 ? 3 : currentLives;
}

function updateStoredLives(newLives) {
    // console.log("updateStoredLives çağrıldı. Önceki hak:", lives, "Yeni hak:", newLives); // LOG KALDIRILDI
    lives = newLives >= 0 ? newLives : 0;
    localStorage.setItem('lives', lives.toString());
    // console.log('localStorage güncellendi (updateStoredLives). Kalan hak:', lives); // LOG KALDIRILDI
}

// --- p5.js Özel Fonksiyonları ---
function preload() {
  try {
    trendyolLogo = loadImage('images.jpg');
    kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
    // console.log('Logo resimleri yüklenmeye çalışıldı.'); // LOG KALDIRILDI
  } catch (e) {
    console.error('Logo yükleme hatası:', e);
    trendyolLogo = null;
    kyrosilLogo = null;
  }
}

function setup() {
  gameInstanceCanvas = createCanvas(800, 600);
  gameInstanceCanvas.parent('gameCanvas');
  gleen = { x: width / 2 - 25, y: height - 60, w: 50, h: 15 };
  lives = checkLives();
  console.log('Oyun Kurulumu Tamamlandı. Başlangıç Hakları:', lives); // Sadece başlangıç logu kalsın
  noLoop();
}

function draw() {
  background(200, 200, 255);

  if (gameOver) {
    // ... (Oyun Bitti ekranı - Değişiklik yok) ...
    fill(255, 0, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text('Oyun Bitti! Puan: ' + score, width / 2, height / 2 - 40);
    if (lives > 0) {
      document.getElementById('restartButton').style.display = 'block';
      textSize(20); fill(0);
      text('Tekrar denemek için 1 hakkını kullan.', width / 2, height / 2 + 20);
    } else {
      document.getElementById('message').style.display = 'block';
      document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
      document.getElementById('restartButton').style.display = 'none';
    }
    noLoop();
    return;
  }

  // Sepeti çiz ve hareket ettir
  fill(255, 102, 0);
  noStroke();
  rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);
  gleen.x = mouseX - gleen.w / 2;
  if (gleen.x < 0) gleen.x = 0;
  if (gleen.x > width - gleen.w) gleen.x = width - gleen.w;

  // Zorluk Ayarları
  let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
  if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; }
  else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }

  // Yeni kargo ekleme
  if (frameCount % spawnRate === 0 && lives > 0) {
    let isBonus = random(1) < 0.15;
    let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu;
    kargolar.push({
      x: random(10, width - (kargoSize + 10)),
      y: -(kargoSize + 10),
      w: kargoSize, h: kargoSize,
      speed: random(minSpeed, maxSpeed), // Bu hız artık "hedef hız" (60 FPS'teki)
      isBonus: isBonus
    });
  }

  // Kargoları yönet
  for (let i = kargolar.length - 1; i >= 0; i--) {
    let kargo = kargolar[i];

    // <<<--- HAREKETİ deltaTime İLE GÜNCELLE ---
    // kargo.speed: Hedeflenen hız (60 FPS'te saniyede speed * 60 piksel)
    // deltaTime: Önceki kareden geçen süre (ms)
    // (deltaTime / 1000): Geçen sürenin saniye cinsinden değeri
    // speed * (deltaTime / 1000) : Bu karede katetmesi gereken mesafe (saniyedeki hızına göre)
    // Ancak kargo.speed'i piksel/kare olarak tanımladık. Bu yüzden normalizasyon yapalım:
    // (1000 / 60) : 60 FPS'te bir karenin süresi (ms)
    // (deltaTime / (1000 / 60)) : Gerçek kare süresinin hedeflenen kare süresine oranı
    let speedMultiplier = deltaTime / (1000 / 60); // Hız çarpım faktörü
    if (isNaN(speedMultiplier) || speedMultiplier > 5) {
        speedMultiplier = 1; // Çok büyük deltaTime değerlerini veya NaN'ı engelle
    }
    kargo.y += kargo.speed * speedMultiplier; // Hareketi uygula
    // --- deltaTime Güncellemesi Bitti ---


    // Kargoyu çiz
    push();
    translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2);
    imageMode(CENTER);
    if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); }
    else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); }
    else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); }
    pop();

    // Çarpışma Kontrolü
    if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y )
    {
      score += kargo.isBonus ? 5 : 1;
      kargolar.splice(i, 1);
      if (score >= 50 && !giftMessage) {
        giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
        console.log('Hediye çeki kazanıldı!'); // Bu log kalabilir
      }
    }
    // Kargo kaçırma kontrolü
    else if (kargo.y > height + kargo.h) {
      let kacirilanKargo = kargolar.splice(i, 1)[0];
      if (!kacirilanKargo.isBonus) {
          misses += 1;
          if (misses >= 3) {
            console.log('3 kargo kaçırıldı, oyun bitti.'); // Bu log kalabilir
            gameOver = true;
            updateStoredLives(lives - 1);
          }
      }
    }
  } // Kargo döngüsü sonu

  // Bilgileri Ekrana Yazdır
  fill(0); textSize(20); textAlign(LEFT, TOP);
  text('Puan: ' + score, 15, 20);
  text('Kaçırılan: ' + misses + '/3', 15, 50);
  text('Kalan Hak: ' + lives, 15, 80);

  // Hediye mesajı
  if (giftMessage) {
    textAlign(CENTER, CENTER); textSize(28); fill(0, 150, 0);
    text(giftMessage, width / 2, height / 2);
  }
} // draw() fonksiyonu sonu

// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
function startGame() {
  // console.log("startGame çağrıldı."); // LOG KALDIRILDI
  lives = checkLives();
  // console.log("startGame: Hak kontrol sonucu:", lives); // LOG KALDIRILDI
  if (lives > 0) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    resetGame();
    frameCount = 0;
    loop();
    console.log('Oyun başlatıldı.'); // Bu log kalabilir
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
    // console.log('Haklar bittiği için oyun başlatılamadı (startGame).'); // LOG KALDIRILDI
  }
}

function restartGame() {
  // console.log("restartGame çağrıldı. Mevcut hak (azaltmadan önce):", lives); // LOG KALDIRILDI
  if (lives > 0) {
     updateStoredLives(lives - 1);
     // console.log("restartGame: Hak azaltıldı. Yeni hak:", lives); // LOG KALDIRILDI
     if (lives > 0) {
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        resetGame();
        frameCount = 0;
        loop();
        console.log('Oyun yeniden başlatıldı.'); // Bu log kalabilir
     } else {
        gameOver = true;
        console.log('Son hak kullanıldı, oyun bitti.'); // Bu log kalabilir
        redraw();
     }
  } else {
      // console.log('Hata: Hak yokken yeniden başlatmaya çalışıldı (restartGame).'); // LOG KALDIRILDI
      document.getElementById('restartButton').style.display = 'none';
  }
}

function resetGame() {
    score = 0;
    misses = 0;
    kargolar = [];
    giftMessage = '';
    gameOver = false;
    gleen.x = width / 2 - gleen.w / 2;
    // console.log("Oyun değişkenleri sıfırlandı (resetGame)."); // LOG KALDIRILDI
}
