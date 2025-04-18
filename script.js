// --- Oyun Değişkenleri ---
let gleen; // Oyuncunun kontrol ettiği sepet nesnesi
let kargolar = []; // Ekranda düşen kargoları tutan dizi
let score = 0; // Oyuncunun puanı
let misses = 0; // Kaçırılan kargo sayısı (3 olunca oyun biter)
let giftMessage = ''; // 50 puana ulaşınca gösterilecek mesaj
let gameOver = false; // Oyunun bitip bitmediğini kontrol eden bayrak
let lives = 3; // Oyuncunun günlük deneme hakkı
let trendyolLogo, kyrosilLogo; // Logo resimleri için değişkenler

// p5.js'in oluşturduğu canvas'a erişmek için değişken
let gameInstanceCanvas;

// --- Oyun Ayarları ---
const normalKargoBoyutu = 35;
const bonusKargoBoyutu = 45; // <<<--- İSTEK 1: Bonus kargo boyutu artırıldı

// --- Yardımcı Fonksiyonlar ---

// localStorage'dan günlük hakları kontrol etme veya sıfırlama
function checkLives() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('gameDate');
  const storedLives = localStorage.getItem('lives');

  if (storedDate !== today || storedLives === null) {
    console.log('Günlük haklar sıfırlandı.');
    localStorage.setItem('gameDate', today);
    localStorage.setItem('lives', '3');
    return 3;
  }

  const currentLives = parseInt(storedLives);
  console.log('Kaydedilmiş haklar:', currentLives);
  return isNaN(currentLives) || currentLives < 0 ? 3 : currentLives;
}

// Kalan hak sayısını localStorage'a kaydetme
function updateStoredLives(newLives) {
    lives = newLives >= 0 ? newLives : 0;
    localStorage.setItem('lives', lives.toString());
    console.log('localStorage güncellendi. Kalan hak:', lives);
}

// --- p5.js Özel Fonksiyonları ---

// Oyun başlamadan önce yüklenmesi gerekenler
function preload() {
  try {
    trendyolLogo = loadImage('images.jpg');
    kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
    console.log('Logo resimleri yüklenmeye çalışıldı.');
  } catch (e) {
    console.error('Logo yükleme hatası:', e);
    trendyolLogo = null;
    kyrosilLogo = null;
  }
}

// Oyunun başlangıç ayarları
function setup() {
  gameInstanceCanvas = createCanvas(800, 600);
  gameInstanceCanvas.parent('gameCanvas');
  gleen = { x: width / 2 - 25, y: height - 60, w: 50, h: 15 };
  lives = checkLives();
  console.log('Setup: Başlangıç hakları:', lives);
  noLoop();
  console.log('Setup tamamlandı. Oyun "Başla" butonunu bekliyor.');
}

// Oyunun her karesinde sürekli çalışan çizim ve mantık fonksiyonu
function draw() {
  background(200, 200, 255);

  // --- Oyun Bitti Durumu ---
  if (gameOver) {
    fill(255, 0, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text('Oyun Bitti! Puan: ' + score, width / 2, height / 2 - 40);

    if (lives > 0) {
      document.getElementById('restartButton').style.display = 'block';
      textSize(20);
      fill(0);
      text('Tekrar denemek için 1 hakkını kullan.', width / 2, height / 2 + 20);
    }
    else {
      document.getElementById('message').style.display = 'block';
      document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
      document.getElementById('restartButton').style.display = 'none';
    }
    noLoop();
    console.log('Oyun bitti çizimi yapıldı. Puan:', score, 'Kalan Haklar:', lives);
    return;
  }

  // --- Oyun Aktif Durumu ---

  // Sepeti çiz
  fill(255, 102, 0);
  noStroke();
  rect(gleen.x, gleen.y, gleen.w, gleen.h, 5);

  // Sepeti fare ile hareket ettir
  gleen.x = mouseX - gleen.w / 2;
  if (gleen.x < 0) gleen.x = 0;
  if (gleen.x > width - gleen.w) gleen.x = width - gleen.w;


  // --- İSTEK 2: Artan Zorluk Ayarları ---
  let spawnRate = 50; // Varsayılan: 50 karede bir kargo
  let minSpeed = 3;   // Varsayılan min hız
  let maxSpeed = 7;   // Varsayılan max hız

  if (score >= 30) { // 30 puan ve üzeri
      spawnRate = 40; // Daha sık (40 karede bir)
      minSpeed = 5;
      maxSpeed = 11; // Daha hızlı
      console.log("Zorluk: Seviye 3");
  } else if (score >= 15) { // 15-29 puan arası
      spawnRate = 45; // Biraz daha sık (45 karede bir)
      minSpeed = 4;
      maxSpeed = 9; // Biraz daha hızlı
      console.log("Zorluk: Seviye 2");
  } else {
      // 0-14 puan: Başlangıç seviyesi (yukarıdaki varsayılanlar kullanılır)
       console.log("Zorluk: Seviye 1");
  }
  // --- Zorluk Ayarları Bitişi ---


  // Belirli aralıklarla yeni kargo ekle (dinamik spawnRate'e göre)
  if (frameCount % spawnRate === 0 && lives > 0) {
    let isBonus = random(1) < 0.15; // %15 bonus ihtimali

    // <<<--- İSTEK 1: Kargo boyutunu bonus olup olmamasına göre ayarla
    let kargoSize = isBonus ? bonusKargoBoyutu : normalKargoBoyutu;

    kargolar.push({
      x: random(10, width - (kargoSize + 10)), // Kargo boyutuna göre x pozisyonu
      y: -(kargoSize + 10), // Kargo boyutuna göre y pozisyonu
      w: kargoSize, // Boyut ata
      h: kargoSize, // Boyut ata
      // <<<--- İSTEK 2: Hızı dinamik aralığa göre ata
      speed: random(minSpeed, maxSpeed),
      isBonus: isBonus
    });
  }

  // Kargoları yönet (düşürme, çizme, çarpışma kontrolü)
  for (let i = kargolar.length - 1; i >= 0; i--) {
    let kargo = kargolar[i];
    kargo.y += kargo.speed; // Kargoyu hareket ettir

    // Kargoyu çiz
    push();
    translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2);
    imageMode(CENTER);

    // <<<--- İSTEK 1: Çizerken kargo nesnesindeki w/h kullanılır (boyut zaten ayarlandı)
    if (kargo.isBonus && kyrosilLogo) {
      image(kyrosilLogo, 0, 0, kargo.w, kargo.h);
    } else if (!kargo.isBonus && trendyolLogo) {
      image(trendyolLogo, 0, 0, kargo.w, kargo.h);
    } else {
      // Logo yoksa varsayılan çizim
      rectMode(CENTER);
      fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19));
      rect(0, 0, kargo.w * 0.8, kargo.h * 0.8);
    }
    pop();

    // Çarpışma Kontrolü
    if (
      gleen.x < kargo.x + kargo.w &&
      gleen.x + gleen.w > kargo.x &&
      gleen.y < kargo.y + kargo.h &&
      gleen.y + gleen.h > kargo.y
    ) {
      score += kargo.isBonus ? 5 : 1; // Puan ekle
      kargolar.splice(i, 1); // Kargoyu sil
      console.log('Kargo yakalandı! Puan:', score);

      // Hediye çeki kontrolü
      if (score >= 50 && !giftMessage) {
        giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
        console.log('Hediye çeki kazanıldı!');
        // İPUCU: İstersen burada oyunu durdurabilirsin: noLoop();
      }
    }
    // Kargo ekran dışına çıktı mı?
    else if (kargo.y > height + kargo.h) {
      let kacirilanKargo = kargolar.splice(i, 1)[0]; // Kargoyu sil ve al

      // Sadece normal kargo kaçırılınca hak düşür
      if (!kacirilanKargo.isBonus) {
          misses += 1;
          console.log('Normal kargo kaçırıldı! Kaçırılan:', misses);
          if (misses >= 3) {
            gameOver = true;
            updateStoredLives(lives - 1);
            console.log('3 kargo kaçırıldı, oyun bitti. Kalan hak:', lives);
          }
      } else {
          console.log('Bonus kargo kaçırıldı (hak etkilenmedi).');
      }
    }
  } // Kargo döngüsü sonu

  // Bilgileri Ekrana Yazdır
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text('Puan: ' + score, 15, 20);
  text('Kaçırılan: ' + misses + '/3', 15, 50);
  text('Kalan Hak: ' + lives, 15, 80);

  // Hediye mesajı varsa göster
  if (giftMessage) {
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(0, 150, 0);
    text(giftMessage, width / 2, height / 2);
  }
} // draw() fonksiyonu sonu


// --- HTML Butonlarından Çağrılan Fonksiyonlar ---

// Oyunu Başlatma
function startGame() {
  lives = checkLives();
  if (lives > 0) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('message').style.display = 'none';

    resetGame(); // Oyunu sıfırla
    frameCount = 0; // Kare sayacını sıfırla (zorluk seviyesi ve ilk kargo için önemli)
    loop(); // Oyun döngüsünü başlat
    console.log('Oyun başlatıldı. Hak:', lives);
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
    console.log('Haklar bittiği için oyun başlatılamadı.');
  }
}

// Oyunu Yeniden Başlatma
function restartGame() {
  console.log("Yeniden başlat butonuna tıklandı. Mevcut hak:", lives);
  if (lives > 0) {
     updateStoredLives(lives - 1); // Hakkı azalt ve kaydet

     if (lives > 0) { // Hala hak varsa
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        resetGame();
        frameCount = 0; // Kare sayacını sıfırla
        loop();
        console.log('Oyun yeniden başlatıldı. Kalan haklar:', lives);
     }
     else { // Son hak kullanıldıysa
        gameOver = true;
        console.log('Son hak kullanıldı, oyun bitti.');
        redraw(); // Oyun bitti ekranını hemen çizdir
     }
  } else {
      console.log('Hata: Hak yokken yeniden başlatmaya çalışıldı.');
      document.getElementById('restartButton').style.display = 'none';
  }
}

// Oyun değişkenlerini sıfırlayan fonksiyon
function resetGame() {
    score = 0;
    misses = 0;
    kargolar = [];
    giftMessage = '';
    gameOver = false;
    gleen.x = width / 2 - gleen.w / 2; // Sepeti ortaya al
    // misses = 0; zaten yukarıda yapılıyor.
    console.log("Oyun değişkenleri sıfırlandı.");
}
