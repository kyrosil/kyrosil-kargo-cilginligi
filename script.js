// --- Oyun Değişkenleri ---
let gleen; // Oyuncunun kontrol ettiği sepet nesnesi
let kargolar = []; // Ekranda düşen kargoları tutan dizi
let score = 0; // Oyuncunun puanı
let misses = 0; // Kaçırılan kargo sayısı (3 olunca oyun biter)
let giftMessage = ''; // 50 puana ulaşınca gösterilecek mesaj
let gameOver = false; // Oyunun bitip bitmediğini kontrol eden bayrak
let lives = 3; // Oyuncunun günlük deneme hakkı
let trendyolLogo, kyrosilLogo; // Logo resimleri için değişkenler
let gameInstanceCanvas;
let isVertical = false; // Oyunun dikey modda olup olmadığını tutacak bayrak

// --- Oyun Ayarları ---
const normalKargoBoyutu = 35;
const bonusKargoBoyutu = 55;
const canvasBackgroundColor = 248; // <<<--- Canvas arka plan rengi (Açık Gri)
const playerColor = '#ff6200'; // <<<--- Oyuncu rengi (Trendyol Turuncusu)

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
    console.log('Hak güncellendi (localStorage):', lives);
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
    if (w < h && w < 600) {
        isVertical = true;
        canvasW = w * 0.95;
        canvasH = h * 0.80; // Basit yükseklik
    } else {
        isVertical = false;
        canvasW = 800;
        canvasH = 600;
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
    background(canvasBackgroundColor); // <<<--- Canvas arka plan rengi kullanıldı

    if (gameOver) {
        fill(255, 0, 0); textSize( isVertical ? 30 : 40 );
        textAlign(CENTER, CENTER);
        text('Oyun Bitti!\nPuan: ' + score, width / 2, height / 2 - (isVertical ? 30 : 40));
        if (lives > 0) {
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

    // Sepeti çiz
    fill(playerColor); // <<<--- Oyuncu rengi kullanıldı
    noStroke();
    rect(gleen.x, gleen.y, gleen.w, gleen.h, 5); // Köşeleri hafif yuvarlak

    // Sepeti hareket ettir
    gleen.x = constrain(mouseX - gleen.w / 2, 0, width - gleen.w);

    // Zorluk Ayarları
    let spawnRate = 50; let minSpeed = 3; let maxSpeed = 7;
    if (score >= 30) { spawnRate = 40; minSpeed = 5; maxSpeed = 11; }
    else if (score >= 15) { spawnRate = 45; minSpeed = 4; maxSpeed = 9; }

    // Yeni kargo ekleme
    if (frameCount % spawnRate === 0 && lives > 0) {
        let isBonus = random(1) < 0.15;
        let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu;
        kargolar.push({
            x: random(10, width - (kargoSize + 10)), y: -(kargoSize + 10),
            w: kargoSize, h: kargoSize, speed: random(minSpeed, maxSpeed), isBonus: isBonus
        });
    }

    // Kargoları yönet
    for (let i = kargolar.length - 1; i >= 0; i--) {
        let kargo = kargolar[i];
        let speedMultiplier = deltaTime / (1000 / 60);
        if (isNaN(speedMultiplier) || speedMultiplier <= 0 || speedMultiplier > 5) { speedMultiplier = 1; }
        kargo.y += kargo.speed * speedMultiplier;

        // Kargoyu çiz
        push();
        translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2);
        imageMode(CENTER);
        if (kargo.isBonus && kyrosilLogo) { image(kyrosilLogo, 0, 0, kargo.w, kargo.h); }
        else if (!kargo.isBonus && trendyolLogo) { image(trendyolLogo, 0, 0, kargo.w, kargo.h); }
        else { rectMode(CENTER); fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); }
        pop();

        // Çarpışma Kontrolü
        if ( gleen.x < kargo.x + kargo.w && gleen.x + gleen.w > kargo.x && gleen.y < kargo.y + kargo.h && gleen.y + gleen.h > kargo.y ) {
            score += kargo.isBonus ? 5 : 1;
            kargolar.splice(i, 1);
            if (score >= 50 && !giftMessage) {
                giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
                console.log('Hediye çeki kazanıldı!');
            }
        }
        // Kargo kaçırma kontrolü
        else if (kargo.y > height + kargo.h) {
            let kacirilanKargo = kargolar.splice(i, 1)[0];
            if (!kacirilanKargo.isBonus) {
                misses += 1;
                if (misses >= 3) {
                    console.log('3 kargo kaçırıldı, oyun bitti (hak henüz düşmedi).');
                    gameOver = true;
                    // Hak düşürme burada yok, sadece restart'ta
                }
            }
        }
    }

    // Bilgileri Ekrana Yazdır
    fill(50); // Yazı rengini biraz koyulaştırdım
    textSize( isVertical ? 16 : 18 ); // Boyutu hafif ayarladım
    textAlign(LEFT, TOP);
    let textY = isVertical ? 15 : 20;
    let textOffset = isVertical ? 25 : 30;
    // Yazılara hafif gölge? (İsteğe bağlı)
    // drawingContext.shadowOffsetX = 1;
    // drawingContext.shadowOffsetY = 1;
    // drawingContext.shadowBlur = 2;
    // drawingContext.shadowColor = 'rgba(0,0,0,0.3)';
    text('Puan: ' + score, 15, textY);
    text('Kaçırılan: ' + misses + '/3', 15, textY + textOffset);
    text('Kalan Hak: ' + lives, 15, textY + textOffset * 2);
    // Gölgeyi sıfırla
    // drawingContext.shadowOffsetX = 0;
    // drawingContext.shadowOffsetY = 0;
    // drawingContext.shadowBlur = 0;


    // Hediye mesajı
    if (giftMessage) {
        textAlign(CENTER, CENTER); textSize( isVertical ? 22 : 28 ); fill(0, 150, 0);
        text(giftMessage, width / 2, height / 2);
    }
} // draw() fonksiyonu sonu

// --- HTML Butonlarından Çağrılan Fonksiyonlar ---
// (startGame, restartGame, resetGame aynı kalıyor)
function startGame() {
  lives = checkLives();
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
  if (lives > 0) {
     updateStoredLives(lives - 1);
     if (lives > 0) {
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        resetGame(); frameCount = 0; loop();
        console.log('Oyun yeniden başlatıldı.');
     } else {
        gameOver = true; console.log('Son hak kullanıldı, oyun bitti.'); redraw();
     }
  }
}
function resetGame() {
    score = 0; misses = 0; kargolar = []; giftMessage = ''; gameOver = false;
    if (gleen) { gleen.x = width / 2 - gleen.w / 2; gleen.y = height - (isVertical ? 40 : 60); }
    // console.log("Oyun değişkenleri sıfırlandı.");
}
