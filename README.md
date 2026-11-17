# Birthday Website for Amil

Buka `index.html` langsung di browser (klik dua kali). Tidak perlu server atau internet.
Catatan: musik dan foto dimuat dari folder `assets/`, jadi jangan pindahkan `index.html` keluar dari folder ini.

## Struktur
```
index.html   → isi & teks
style.css    → tampilan
script.js    → interaksi (+ pengaturan di bagian CONFIG paling atas)
assets/
  images/    → foto (photo-01.jpg, photo-02.jpg, ...)
  audio/     → musik (background.mp3)
```

## Mengganti foto
1. Taruh foto di `assets/images/` dengan nama `photo-01.jpg`, `photo-02.jpg`, `photo-03.jpg`, dst (urut, tanpa lompat nomor).
   Format `.jpg`, `.jpeg`, `.png`, atau `.webp` juga dikenali.
2. Refresh halaman. Galeri otomatis menyesuaikan jumlah foto (1 sampai 60), dan tata letaknya berganti-ganti per foto.
3. Tips: perkecil foto ke lebar sekitar 1600px agar cepat dibuka di HP.
4. Caption (opsional): di `script.js`, isi `CONFIG.captions`, misalnya `1: 'Hari pertama kita'`.

## Mengganti pesan
Buka `index.html`, cari komentar `EDIT YOUR PERSONAL MESSAGE`. Ganti isi tiap `<p>` dengan tulisanmu,
dan hapus paragraf `placeholder-note`. Nama pengirim: isi `CONFIG.signature` di `script.js` (contoh `'Rina'`).

## Mengganti musik
Lagu sudah terpasang di `assets/audio/background.mp3` (The Beatles — Oh! Darling). Untuk mengganti, timpa file itu dengan lagu lain bernama sama.
Musik tidak autoplay: mulai saat tombol "Enter the experience" ditekan, dan bisa dihentikan/dimainkan lewat tombol Music di navigasi.
Jika file belum ada, muncul pemberitahuan kecil.

## Lainnya
- Warna ada di bagian `:root` pada `style.css`.
- Mendukung `prefers-reduced-motion` (animasi dikurangi otomatis).
- Pakai hak cipta lagu/foto yang sesuai jika website dipublikasikan.
