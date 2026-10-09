# Vidora - starter katalog video

Starter website katalog video responsif dengan tema gelap dan tombol play pink. Dibuat memakai HTML, CSS, dan JavaScript biasa agar sederhana dan dapat di-host sebagai situs statis.

## File
- `index.html`: struktur halaman
- `styles.css`: desain responsif
- `videos.js`: daftar video yang bisa diedit
- `app.js`: pencarian, kategori, dan modal player

## Tambah video
Buka `videos.js` dan ganti data contoh. Setiap item punya:
- `title`: judul video
- `category`: kategori
- `duration`: label durasi (opsional)
- `poster`: URL thumbnail (opsional)
- `embedUrl`: URL embed/player dari penyedia
- `pageUrl`: halaman video penyedia (opsional)

Pastikan `embedUrl` adalah URL embed yang memang disediakan penyedia video, bukan sembarang tautan berbagi. Uji satu video dulu. Beberapa host melarang pemutaran di iframe atau memerlukan URL embed khusus.

## Iklan
Area “Ruang iklan” hanya placeholder. Setelah jaringan iklan menyetujui situs, ganti area tersebut dengan kode iklan resmi dari penyedia. Jangan mengklik iklan sendiri atau mengarahkan pengunjung untuk mengeklik iklan. Pastikan konten dan situs mematuhi kebijakan penyedia iklan dan hukum yang berlaku.

## Deploy gratis ke Cloudflare Pages
1. Buat repository GitHub baru, misalnya `vidora-katalog`.
2. Upload empat file situs (`index.html`, `styles.css`, `videos.js`, `app.js`) dan README.
3. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
4. Pilih repository baru.
5. Framework preset: `None`.
6. Build command: kosongkan.
7. Build output directory: `/` (root directory repository) jika antarmuka menerima nilai itu. Jika antarmuka meminta direktori build, gunakan `.`.
8. Deploy.

Ini situs statis, jadi tidak perlu npm, Next.js, build command, atau GitHub Actions. Jika Cloudflare menampilkan form berbeda, jangan menebak: cek dokumentasi Cloudflare Pages untuk pengaturan Direct Upload/Git integration terbaru.

## Penting
Ini starter template. Belum terhubung otomatis ke API Doodstream, belum mengaktifkan pendapatan iklan, dan tidak berisi video nyata. Untuk konten campuran, gunakan video milik sendiri atau video yang penggunaannya sudah diizinkan.
