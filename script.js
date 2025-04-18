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

// --- Yardımcı Fonksiyonlar ---

// localStorage'dan günlük hakları kontrol etme veya sıfırlama
function checkLives() {
  const today = new Date().toDateString(); // Bugünün tarihi (örn: "Fri Apr 18 2025")
  const storedDate = localStorage.getItem('gameDate'); // Kaydedilmiş tarih
  const storedLives = localStorage.getItem('lives'); // Kaydedilmiş hak sayısı (string)

  // Eğer kaydedilmiş tarih bugün değilse veya hiç kayıt yoksa hakları sıfırla
  if (storedDate !== today || storedLives === null) {
    console.log('Günlük haklar sıfırlandı.');
    localStorage.setItem('gameDate', today); // Bugünü kaydet
    localStorage.setItem('lives', '3'); // 3 hakkı kaydet (string olarak)
    return 3; // 3 hak döndür
  }

  // Kayıt varsa, string'i sayıya çevir
  const currentLives = parseInt(storedLives);
  console.log('Kaydedilmiş haklar:', currentLives);
  // Eğer çevirme başarısız olursa (NaN) veya geçersizse 3 döndür, değilse mevcut hakkı döndür
  return isNaN(currentLives) || currentLives < 0 ? 3 : currentLives;
}

// Kalan hak sayısını localStorage'a kaydetme
function updateStoredLives(newLives) {
    lives = newLives >= 0 ? newLives : 0; // Hak sayısı 0'ın altına inmesin
    localStorage.setItem('lives', lives.toString()); // String olarak kaydet
    console.log('localStorage güncellendi. Kalan hak:', lives);
}

// --- p5.js Özel Fonksiyonları ---

// Oyun başlamadan önce yüklenmesi gerekenler (resimler vb.)
function preload() {
  try {
    // Resim dosyalarının index.html ile aynı yerde olduğunu varsayıyoruz
    trendyolLogo = loadImage('images.jpg');
    kyrosilLogo = loadImage('cropped-adsiz_tasarim-removebg-preview-1.png');
    console.log('Logo resimleri yüklenmeye çalışıldı.');
  } catch (e) {
    console.error('Logo yükleme hatası:', e);
    // Hata olursa logolar null kalır, draw() içinde kontrol edilir
    trendyolLogo = null;
    kyrosilLogo = null;
  }
}

// Oyunun başlangıç ayarları (sadece bir kere çalışır)
function setup() {
  // Oyun alanını (canvas) oluştur ve HTML'deki yerine yerleştir
  gameInstanceCanvas = createCanvas(800, 600);
  gameInstanceCanvas.parent('gameCanvas'); // ID'si 'gameCanvas' olan div'in içine koy

  // Sepetin başlangıç konumu ve boyutları
  gleen = { x: width / 2 - 25, y: height - 60, w: 50, h: 15 }; // Sepet görünümü için y ve h ayarlandı

  // Başlangıçta hakları kontrol et
  lives = checkLives();
  console.log('Setup: Başlangıç hakları:', lives);

  // Oyun döngüsünü (draw fonksiyonunu) başlangıçta durdur
  noLoop();
  console.log('Setup tamamlandı. Oyun "Başla" butonunu bekliyor.');
}

// Oyunun her karesinde sürekli çalışan çizim ve mantık fonksiyonu
function draw() {
  // Arka planı her karede temizle
  background(200, 200, 255); // Açık mavi tonu

  // --- Oyun Bitti Durumu ---
  if (gameOver) {
    // Oyun bitti mesajını göster
    fill(255, 0, 0); // Kırmızı renk
    textSize(40);
    textAlign(CENTER, CENTER); // Yazıyı ortala
    text('Oyun Bitti! Puan: ' + score, width / 2, height / 2 - 40);

    // Eğer hala deneme hakkı varsa Yeniden Başlat butonunu göster
    if (lives > 0) {
      document.getElementById('restartButton').style.display = 'block';
      textSize(20); // Daha küçük font
      fill(0); // Siyah renk
      text('Tekrar denemek için 1 hakkını kullan.', width / 2, height / 2 + 20);
    }
    // Eğer hak bittiyse mesaj göster
    else {
      document.getElementById('message').style.display = 'block';
      document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
      document.getElementById('restartButton').style.display = 'none'; // Butonu gizle
    }
    noLoop(); // Oyun bittiğinde draw döngüsünü durdur
    console.log('Oyun bitti çizimi yapıldı. Puan:', score, 'Kalan Haklar:', lives);
    return; // Fonksiyonun geri kalanını çalıştırma
  }

  // --- Oyun Aktif Durumu ---

  // Sepeti (gleen) çiz - Turuncu dikdörtgen
  fill(255, 102, 0); // Trendyol turuncusu
  noStroke(); // Kenar çizgisi olmasın
  rect(gleen.x, gleen.y, gleen.w, gleen.h, 5); // Köşeleri hafif yuvarlak

  // Sepeti fare ile yatayda hareket ettir
  gleen.x = mouseX - gleen.w / 2; // Farenin ortasına hizala
  // Sepetin canvas sınırları dışına çıkmasını engelle
  if (gleen.x < 0) gleen.x = 0;
  if (gleen.x > width - gleen.w) gleen.x = width - gleen.w;

  // Belirli aralıklarla yeni kargo ekle (hak varsa)
  // frameCount: Oyun başladığından beri geçen kare sayısı
  // % 60: Yaklaşık saniyede bir kargo (60 FPS varsayımıyla)
  if (frameCount % 50 === 0 && lives > 0) { // Biraz hızlandıralım (50 karede bir)
    let isBonus = random(1) < 0.15; // %15 ihtimalle bonus kargo
    kargolar.push({
      x: random(10, width - 40), // Kenarlara çok yakın düşmesin
      y: -40, // Ekranın biraz üstünden başlasın
      w: 35, // Kargo boyutu
      h: 35,
      speed: random(3, 7), // Kargo düşme hızı (daha dengeli)
      isBonus: isBonus
    });
  }

  // Kargoları yönet (düşürme, çizme, çarpışma kontrolü)
  // Diziyi sondan başa doğru kontrol etmek, eleman silerken sorun yaşanmasını önler
  for (let i = kargolar.length - 1; i >= 0; i--) {
    let kargo = kargolar[i];

    // Kargoyu aşağı hareket ettir
    kargo.y += kargo.speed;

    // Kargoyu çiz (logo varsa logo, yoksa renkli kare)
    push(); // Mevcut çizim ayarlarını kaydet
    translate(kargo.x + kargo.w / 2, kargo.y + kargo.h / 2); // Kargo merkezine taşı
    // rotate(kargo.y * 0.01); // İsteğe bağlı: Düşerken hafif dönme efekti
    imageMode(CENTER); // Resmi merkezden hizala

    if (kargo.isBonus && kyrosilLogo) {
      image(kyrosilLogo, 0, 0, kargo.w, kargo.h);
    } else if (!kargo.isBonus && trendyolLogo) {
      image(trendyolLogo, 0, 0, kargo.w, kargo.h);
    } else {
      // Logolar yüklenemezse veya hata olursa varsayılan kare çiz
      rectMode(CENTER);
      fill(kargo.isBonus ? color(255, 215, 0) : color(139, 69, 19)); // Altın sarısı / Kahverengi
      rect(0, 0, kargo.w * 0.8, kargo.h * 0.8); // Logodan biraz küçük
    }
    pop(); // Kaydedilmiş çizim ayarlarına geri dön

    // Çarpışma Kontrolü: Sepet kargoyu yakaladı mı?
    // Basit dikdörtgen çarpışma kontrolü
    if (
      gleen.x < kargo.x + kargo.w &&       // Sepetin sol kenarı < Kargonun sağ kenarı
      gleen.x + gleen.w > kargo.x &&   // Sepetin sağ kenarı > Kargonun sol kenarı
      gleen.y < kargo.y + kargo.h &&       // Sepetin üst kenarı < Kargonun alt kenarı
      gleen.y + gleen.h > kargo.y        // Sepetin alt kenarı > Kargonun üst kenarı
    ) {
      score += kargo.isBonus ? 5 : 1; // Puan ekle (bonus 5, normal 1)
      kargolar.splice(i, 1); // Yakalanan kargoyu diziden sil
      console.log('Kargo yakalandı! Puan:', score);

      // Hediye çeki kazanma kontrolü (sadece bir kere mesaj ver)
      if (score >= 50 && !giftMessage) {
        giftMessage = 'Tebrikler! 50 TL Trendyol Hediye Çeki Kazandın!';
        console.log('Hediye çeki kazanıldı!');
        // İPUCU: Burada oyunu durdurabilir veya zorlaştırabilirsiniz.
        // Örneğin: noLoop(); veya kargoların hızını artırabilirsiniz.
      }
    }
    // Kargo ekranın altından çıktı mı? (Kaçırıldı)
    else if (kargo.y > height + kargo.h) { // Kargo tamamen çıkınca say
      let kacirilanKargo = kargolar.splice(i, 1)[0]; // Kaçırılan kargoyu al ve sil

      // Sadece normal kargolar kaçırılınca hak düşür
      if (!kacirilanKargo.isBonus) {
          misses += 1;
          console.log('Normal kargo kaçırıldı! Kaçırılan:', misses);
          // Eğer 3 kargo kaçırıldıysa oyunu bitir
          if (misses >= 3) {
            gameOver = true;
            updateStoredLives(lives - 1); // Hakkı azalt ve kaydet
            console.log('3 kargo kaçırıldı, oyun bitti. Kalan hak:', lives);
            // Oyun bitti ekranı bir sonraki draw() döngüsünde gösterilecek
          }
      } else {
          console.log('Bonus kargo kaçırıldı (hak etkilenmedi).');
      }
    }
  } // Kargo döngüsü sonu

  // --- Bilgileri Ekrana Yazdırma ---
  fill(0); // Yazı rengi siyah
  textSize(20);
  textAlign(LEFT, TOP); // Hizalama sol üst köşe
  text('Puan: ' + score, 15, 20);
  text('Kaçırılan: ' + misses + '/3', 15, 50);
  text('Kalan Hak: ' + lives, 15, 80); // Güncel hak sayısını göster

  // Hediye mesajı varsa göster
  if (giftMessage) {
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(0, 150, 0); // Koyu yeşil renk
    text(giftMessage, width / 2, height / 2);
  }
} // draw() fonksiyonu sonu


// --- HTML Butonlarından Çağrılan Fonksiyonlar ---

// Oyunu Başlatma Fonksiyonu ("Başla" butonu)
function startGame() {
  // Başlarken hakları tekrar kontrol et (başka sekmede oynamış olabilir)
  lives = checkLives();
  if (lives > 0) {
    document.getElementById('startScreen').style.display = 'none'; // Başlangıç ekranını gizle
    document.getElementById('gameCanvas').style.display = 'block'; // Oyun alanını göster
    document.getElementById('restartButton').style.display = 'none'; // Yeniden başlat gizle
    document.getElementById('message').style.display = 'none'; // Mesajları gizle

    resetGame(); // Oyun değişkenlerini sıfırla (puan, kargolar vs.)
    frameCount = 0; // Kare sayacını sıfırla (ilk kargonun hemen düşmemesi için)
    loop(); // p5.js draw() döngüsünü başlat/devam ettir
    console.log('Oyun başlatıldı. Hak:', lives);
  } else {
    // Hak yoksa mesaj göster
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').innerText = 'Günlük 3 hakkın bitti! Yarın tekrar dene.';
    console.log('Haklar bittiği için oyun başlatılamadı.');
  }
}

// Oyunu Yeniden Başlatma Fonksiyonu ("Yeniden Başlat" butonu)
function restartGame() {
  console.log("Yeniden başlat butonuna tıklandı. Mevcut hak:", lives);
  // Yeniden başlatma 1 hakka mal oluyor
  if (lives > 0) {
     updateStoredLives(lives - 1); // Hakkı azalt ve kaydet

     // Hak hala varsa oyunu tekrar başlat
     if (lives > 0) {
        document.getElementById('restartButton').style.display = 'none'; // Butonu gizle
        document.getElementById('message').style.display = 'none'; // Mesajları gizle
        resetGame();
        frameCount = 0; // Kare sayacını sıfırla
        loop(); // Oyun döngüsünü başlat
        console.log('Oyun yeniden başlatıldı. Kalan haklar:', lives);
     }
     // Eğer bu son hak idiyse, oyunu bitir ve game over ekranını göster
     else {
        gameOver = true; // Oyun bitti durumuna geç
        console.log('Son hak kullanıldı, oyun bitti.');
        redraw(); // draw() fonksiyonunu bir kereliğine çalıştırarak game over ekranını çizdir
     }
  } else {
      // Bu durum normalde olmamalı ama ek kontrol
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
    console.log("Oyun değişkenleri sıfırlandı.");
}
