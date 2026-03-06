# 🚀 Team ToDo - Sosyal Üretkenlik ve Oyunlaştırma Platformu

**Team ToDo**, geleneksel yapılacaklar listesi (Todo List) deneyimini sosyal etkileşim ve oyunlaştırma (Gamification) unsurlarıyla birleştiren, **Full-Stack** (Uçtan Uca) modern bir web uygulamasıdır.

Kullanıcılar sadece kendi görevlerini yönetmekle kalmaz, arkadaşlarıyla etkileşime girer, birbirlerini motive eder ve liderlik tablosunda üst sıralara çıkmak için yarışırlar.

---

## ✨ Özellikler ve Yetenekler

### 🎯 1. Görev Yönetimi (Todo Management)
*   **Kategorilendirme:** *Moodle, Coursera, Kişisel, İş, Eğlence* gibi kategorilerle düzenli çalışma.
*   **Gizlilik Ayarları:** Görevlerinizi **"Herkese Açık" (Public)** yaparak arkadaşlarınızla paylaşın veya **"Özel" (Private)** tutarak sadece kendiniz görün.
*   **Günlük Hedefler (Daily Mode):** Güne odaklanmak için o gün bitirilmesi gereken kritik görevleri seçin.
*   **Akıllı Erteleme:** Tamamlanmayan günlük görevler, ertesi gün otomatik olarak genel listenizde kalır (Backlog mantığı), böylece hiçbir iş gözden kaçmaz.

### 🎮 2. Oyunlaştırma (Gamification)
*   **🔥 Streak (Seri) Sistemi:** Her gün en az 1 görev tamamlayarak serinizi koruyun ve ateşinizi söndürmeyin!
*   **🏆 Liderlik Tablosu (Leaderboard):** En disiplinli kullanıcıların listelendiği, **3 sütunlu (3-3-3)** rekabetçi sıralama.
*   **📊 Detaylı İstatistikler:** Tamamlama oranlarınız, kategori bazlı dağılımlarınız ve topluluk içindeki sıralamanız.

### 🤝 3. Sosyal Etkileşim (Social Features)
*   **Sosyal Akış (Social Feed):** Arkadaşlarınızın o gün neler başardığını anlık olarak takip edin.
*   **Reaksiyonlar (Reactions):** Arkadaşlarınızın görevlerine 🔥, ❤️, 👍, ⭐ gibi emojilerle destek verin. (Toggle mantığıyla çalışır: Aynı emojiyi geri alabilir veya değişebilirsiniz).
*   **Mood Paylaşımı:** O günkü ruh halinizi profilinizde yansıtın.
*   **Profil İnceleme:** Diğer kullanıcıların profillerini ziyaret ederek başarılarını ve çalışma stillerini görün.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

Bu proje modern ve performanslı teknolojiler kullanılarak geliştirilmiştir:

### Backend (Arka Plan)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python) - Yüksek performanslı, asenkron API.
*   **Veritabanı:** SQLite / SQLAlchemy ORM.
*   **Güvenlik:** JWT (JSON Web Tokens) & OAuth2 & Bcrypt (Şifreleme).
*   **Şema Doğrulama:** Pydantic.

### Frontend (Önyüz)
*   **Kütüphane:** [React](https://reactjs.org/) (Vite ile).
*   **Stil:** [Tailwind CSS](https://tailwindcss.com/) - Modern ve responsive tasarım.
*   **İkonlar:** Lucide React.
*   **İletişim:** Axios (HTTP İstekleri).

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Backend Kurulumu (Python)

```bash
# Proje dizinine gidin
cd Team_ToDo

# Sanal ortam oluşturun (Önerilen)
python -m venv .venv

# Sanal ortamı aktif edin
# Windows:
.venv\Scripts\Activate
# Mac/Linux:
source .venv/bin/activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt

# Sunucusu başlatın
uvicorn app.main:app --reload
```
*Backend şu adreste çalışacaktır:* `http://127.0.0.1:8000`  
*API Dokümantasyonu (Swagger UI):* `http://127.0.0.1:8000/docs`

### 2. Frontend Kurulumu (Node.js)

Yeni bir terminal açın ve şu komutları girin:

```bash
# Frontend klasikörüne girin
cd frontend

# Paketleri yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```
*Uygulama şu adreste çalışacaktır:* `http://localhost:5173`

---

## 📂 Proje Yapısı

```
Team_ToDo/
├── app/                  # Backend Kaynak Kodları
│   ├── models/           # Veritabanı Modelleri (User, Todo, Reaction)
│   ├── routers/          # API Rotaları (Endpoints)
│   ├── database.py       # DB Bağlantısı
│   └── main.py           # Uygulama Giriş Noktası
├── frontend/             # Frontend Kaynak Kodları
│   ├── src/
│   │   ├── components/   # React Bileşenleri (Navbar, Leaderboard, Feed...)
│   │   ├── services/     # API İstek Servisleri
│   │   └── App.jsx       # Ana Uygulama Bileşeni
├── alembic/              # Veritabanı Migrasyonları
└── README.md             # Proje Dokümantasyonu
```
