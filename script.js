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
let isVertical = false; // Oyunun dikey modda olup olmadığını tutacak bayrak

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
    lives = newLives >= 0 ? newLives : 0;
    localStorage.setItem('lives', lives.toString());
}

// --- p5.js Özel Fonksiyonları ---
function preload() {
  try {
    trendyolLogo = loadImage('images.jpg');
    kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
  } catch (e) {
    console.error('Logo yükleme hatası:', e);
    trendyolLogo = null; kyrosilLogo = null;
  }
}

function setup() {
    let canvasW, canvasH;

    // <<<--- Mobil Dikey / PC Yatay Algılama ---
    // Genişlik yükseklikten küçük VE genişlik belirli bir pikselden küçükse mobil dikey kabul et
    if (windowWidth < windowHeight && windowWidth < 768) {
        isVertical = true;
        console.log("Dikey Mod (Mobil) Algılandı.");
        // Ekran genişliğinin %95'ini al
        canvasW = windowWidth * 0.95;
        // 9:16 oranına göre yüksekliği hesapla
        canvasH = canvasW * (16 / 9);
        // Hesaplanan yükseklik, ekranın %85'ini geçmesin (tarayıcı arayüzü vb. için pay bırak)
        canvasH = min(canvasH, windowHeight * 0.85);
    } else {
        isVertical = false;
        console.log("Yatay Mod (PC/Tablet) Algılandı.");
        // Şimdilik sabit PC boyutu
        canvasW = 800;
        canvasH = 600;
        // Alternatif: Yatay ekranı doldur
        // canvasW = windowWidth * 0.9;
        // canvasH = canvasW * (9 / 16);
        // canvasH = min(canvasH, windowHeight * 0.9);
    }
    // --- Algılama Bitti ---

    gameInstanceCanvas = createCanvas(canvasW, canvasH);
    gameInstanceCanvas.parent('gameCanvas'); // Canvas'ı HTML'deki div'e yerleştir

    // Oyuncu (sepet) başlangıç konumu - canvas boyutuna göre ayarla
    let gleenWidth = 50; // Sepet genişliği (bunu da dinamik yapabiliriz ileride)
    let gleenHeight = 15; // Sepet yüksekliği
    // Dikey ekranda biraz daha aşağıda başlasın
    let gleenY = canvasH - (isVertical ? 40 : 60);
    gleen = { x: canvasW / 2 - gleenWidth / 2, y: gleenY, w: gleenWidth, h: gleenHeight };

    lives = checkLives();
    console.log('Oyun Kurulumu Tamamlandı. Boyut:', round(canvasW), 'x', round(canvasH), 'Haklar:', lives);
    noLoop(); // Oyun döngüsünü başlatma, startGame bekleyecek
}


function draw() {
    // p5.js 'width' ve 'height' değişkenleri artık setup'ta oluşturulan canvas boyutunu verir.
    // Bu yüzden çizim ve koordinat mantığının çoğu aynı kalabilir.

    background(200, 200, 255); // Arka plan

    if (gameOver) {
        // --- Oyun Bitti Ekranı ---
        fill(255, 0, 0); textSize( isVertical ? 30 : 40 ); // Dikeyde yazıyı küçült
        textAlign(CENTER, CENTER);
        text('Oyun Bitti!\nPuan: ' + score, width / 2, height / 2 - (isVertical ? 30 : 40)); // Puanı alta al

        if (lives > 0) {
            document.getElementById('restartButton').style.display = 'block';
             textSize( isVertical ? 16 : 20 ); fill(0);
             text('Tekrar denemek için\n1 hakkını kullan.', width / 2, height / 2 + (isVertical ? 30 : 40));
        } else {
            document.getElementById('message').style.display = 'block';
            document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
            document.getElementById('restartButton').style.display = 'none';
        }
        noLoop(); return; // Çizimi durdur ve fonksiyondan çık
    }

    // --- Oyun Devam Ediyor ---

    // Sepeti çiz
    fill(255, 102, 0); noStroke();
    rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);

    // Sepeti hareket ettir (mouseX her iki mod için de çalışır, dokunmatik için sonra bakarız)
    // constrain: Değerin min ve max arasında kalmasını sağlar
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);

    // Zorluk Ayarları (Mevcut haliyle kalabilir)
    let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
    if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; }
    else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }

    // Yeni kargo ekleme (Mevcut haliyle kalabilir)
    if (frameCount % spawnRate === 0 && lives > 0) {
        let isBonus = random(1) < 0.15;
        let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu;
        // Kargonun canvas dışına taşmasını önle (width artık dinamik)
        kargolar.push({
            x: random(10, width - (kargoSize + 10)),
            y: -(kargoSize + 10),
            w: kargoSize, h: kargoSize,
            speed: random(minSpeed, maxSpeed),
            isBonus: isBonus
        });
    }

    // Kargoları yönet (Hareket, Çizim, Kontrol)
    for (let i = kargolar.length - 1; i >= 0; i--) {
        let kargo = kargolar[i];

        // Hareketi deltaTime ile güncelle (FPS'ten bağımsız)
        let speedMultiplier = deltaTime / (1000 / 60);
        if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) {
            speedMultiplier = 1; // Geçersiz değerleri düzelt
        }
        kargo.y += kargo.speed * speedMultiplier;

        // Kargoyu çiz
        push();
        translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2);
        imageMode(CENTER);
        if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); }
        else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); }
        else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); }
        pop();

        // Çarpışma Kontrolü (Mevcut haliyle çalışır)
        if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) {
            score += kargo.isBonus ? 5 : 1;
            kargolar.splice(i, 1);
            if (score >= 50 && !giftMessage) {
                giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
                console.log('Hediye çeki kazanıldı!');
            }
        }
        // Kargo kaçırma kontrolü (height artık dinamik)
        else if (kargo.y > height + kargo.h) {
            let kacirilanKargo = kargolar.splice(i, 1)[0];
            if (!kacirilanKargo.isBonus) {
                misses += 1;
                if (misses >= 3) {
                    console.log('3 kargo kaçırıldı, oyun bitti.');
                    gameOver = true;
                    updateStoredLives(lives - 1);
                }
            }
        }
    } // Kargo döngüsü sonu

    // Bilgileri Ekrana Yazdır (Sol üste hizalı)
    fill(0); textSize( isVertical ? 16 : 20 ); // Dikeyde yazıyı küçült
    textAlign(LEFT, TOP);
    let textY = isVertical ? 15 : 20; // Dikeyde biraz daha yukarıdan başla
    let textOffset = isVertical ? 25 : 30; // Satır aralığını ayarla
    text('Puan: ' + score, 15, textY);
    text('Kaçırılan: ' + misses + '/3', 15, textY + textOffset);
    text('Kalan Hak: ' + lives, 15, textY + textOffset * 2);

    // Hediye mesajı (Ortalı)
    if (giftMessage) {
        textAlign(CENTER, CENTER); textSize( isVertical ? 22 : 28 ); fill(0, 150, 0);
        text(giftMessage, width / 2, height / 2);
    }
} // draw() fonksiyonu sonu


// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
// (Bu fonksiyonlarda değişiklik gerekmiyor)
function startGame() {
  lives = checkLives();
  if (lives > 0) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block'; // Canvas'ı göster
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    resetGame();
    frameCount = 0;
    loop(); // Oyun döngüsünü başlat
    console.log('Oyun başlatıldı.');
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
  }
}

function restartGame() {
  if (lives > 0) {
     updateStoredLives(lives - 1);
     if (lives > 0) {
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        resetGame();
        frameCount = 0;
        loop();
        console.log('Oyun yeniden başlatıldı.');
     } else {
        gameOver = true;
        console.log('Son hak kullanıldı, oyun bitti.');
        redraw();
     }
  }
}

function resetGame() {
    score = 0;
    misses = 0;
    kargolar = [];
    giftMessage = '';
    gameOver = false;
    // Sepet x pozisyonunu sıfırla (eğer canvas boyutu değişmişse diye)
    if (gleen) { // gleen tanımlıysa
       gleen.x = width / 2 - gleen.w / 2;
       // Y pozisyonunu da sıfırlamak gerekebilir, setup'taki gibi
       gleen.y = height - (isVertical ? 40 : 60);
    }
    console.log("Oyun değişkenleri sıfırlandı.");
}

// Ekran boyutu değiştiğinde canvas'ı yeniden boyutlandırmak için (İsteğe Bağlı Geliştirme)
// function windowResized() {
//   console.log("Ekran boyutu değişti!");
//   // Burada setup() fonksiyonunu tekrar çağırarak veya
//   // resizeCanvas() kullanarak canvas'ı yeniden boyutlandırabiliriz.
//   // Ancak bu, oyunun durumunu sıfırlayabilir veya karmaşıklık ekleyebilir.
//   // Şimdilik devre dışı bırakalım.
//   // setup(); // Tekrar setup çağırarak yeniden boyutlandır ve sıfırla
// }
