# Sistem Informasi Gudang

## Identitas

- Nama: Stevanus Gabriel
- Kelas: XII RPL
- Nomor Absen: 12

## Tema

Gudang

## Tujuan

Sistem Informasi Gudang dibuat untuk membantu pengelolaan data produk dan transaksi barang masuk maupun barang keluar.

Aplikasi ini digunakan untuk mempermudah pencatatan produk, pemantauan stok, pencatatan transaksi, serta melihat ringkasan kondisi gudang melalui dashboard.

## Fitur

- Dashboard
- Melihat total produk
- Melihat total stok
- Melihat stok menipis
- Melihat total transaksi
- Grafik perkembangan stok
- Melihat stok terbanyak
- Melihat stok sedikit
- Menambah produk
- Mengubah produk
- Menghapus produk
- Mencari produk
- Filter status stok
- Menambah transaksi
- Mengubah transaksi
- Menghapus transaksi
- Barang masuk
- Barang keluar
- Mencari transaksi
- Filter jenis transaksi
- Keterangan transaksi
- Update stok otomatis
- Validasi input
- Notifikasi berhasil dan gagal

## Teknologi

### Frontend

- Next.js
- React
- JavaScript
- Ant Design
- CSS Modules
- Recharts

### Backend

- Node.js
- Express.js

### Database

- MySQL

## Struktur Database

Database yang digunakan bernama `gudang`.

Database terdiri dari 4 tabel:

### 1. `categories`

Tabel `categories` digunakan untuk menyimpan data kategori produk.

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | INT UNSIGNED | Primary Key, ID kategori |
| `name` | VARCHAR(100) | Nama kategori |
| `created_at` | TIMESTAMP | Waktu data kategori dibuat |

### 2. `products`

Tabel `products` digunakan untuk menyimpan data produk yang tersedia di gudang.

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | INT UNSIGNED | Primary Key, ID produk |
| `category_id` | INT UNSIGNED | Foreign Key yang mengarah ke `categories.id` |
| `code` | VARCHAR(20) | Kode unik produk |
| `name` | VARCHAR(100) | Nama produk |
| `unit` | VARCHAR(20) | Satuan produk, seperti Pcs |
| `price` | DECIMAL(12,2) | Harga produk |
| `stock` | INT UNSIGNED | Jumlah stok produk |
| `created_at` | TIMESTAMP | Waktu data produk dibuat |

### 3. `transactions`

Tabel `transactions` digunakan untuk menyimpan data utama transaksi barang masuk dan barang keluar.

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | INT UNSIGNED | Primary Key, ID transaksi |
| `type` | ENUM('IN','OUT') | Jenis transaksi, barang masuk atau barang keluar |
| `transaction_date` | DATE | Tanggal transaksi |
| `description` | VARCHAR(255) | Keterangan transaksi |
| `created_at` | TIMESTAMP | Waktu transaksi dibuat |

### 4. `transaction_details`

Tabel `transaction_details` digunakan untuk menyimpan detail produk dan jumlah barang dalam setiap transaksi.

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | INT UNSIGNED | Primary Key, ID detail transaksi |
| `transaction_id` | INT UNSIGNED | Foreign Key yang mengarah ke `transactions.id` |
| `product_id` | INT UNSIGNED | Foreign Key yang mengarah ke `products.id` |
| `quantity` | INT UNSIGNED | Jumlah produk yang masuk atau keluar |

### Relasi Database

- `categories.id` → `products.category_id`
- `transactions.id` → `transaction_details.transaction_id`
- `products.id` → `transaction_details.product_id`

Hubungan antar tabel:

- Satu kategori dapat memiliki banyak produk.
- Satu produk dapat digunakan pada banyak detail transaksi.
- Satu transaksi dapat memiliki banyak detail transaksi.
- `transaction_details` menjadi penghubung antara transaksi dan produk.

## Cara Instalasi dan Menjalankan

### 1. Clone Repository

```bash
git clone LINK_GITHUB
```

### 2. Masuk ke Folder Project

```bash
cd XII_RPL_12_Stevanus_Gabriel
```

### 3. Install Dependency

```bash
npm install
```

### 4. Siapkan Database

Buat database MySQL dengan nama:

```text
gudang
```

Kemudian import file SQL database ke database tersebut.

Konfigurasi database:

```text
Host     : localhost
User     : root
Password : kosong
Database : gudang
```

### 5. Jalankan Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Jalankan backend:

```bash
node server.js
```

Backend berjalan pada:

```text
http://localhost:5000
```

### 6. Jalankan Frontend

Buka terminal baru dan masuk ke folder utama project.

Kemudian jalankan:

```bash
npm run dev
```

Frontend dapat diakses melalui:

```text
http://localhost:3000
```

## Akun Uji

Aplikasi tidak menggunakan sistem login, sehingga tidak terdapat akun uji.

## Kendala dan Perbaikan

### 1. Perubahan Stok Saat Transaksi Diedit

Kendala yang ditemukan adalah perubahan transaksi dapat memengaruhi jumlah stok produk.

Perbaikan dilakukan dengan mengembalikan pengaruh transaksi lama terlebih dahulu, kemudian menerapkan pengaruh transaksi yang baru.

### 2. Penghapusan Transaksi

Ketika transaksi dihapus, stok harus disesuaikan kembali.

Perbaikannya adalah sistem menghitung kembali stok berdasarkan jenis transaksi yang dihapus.

Jika transaksi barang masuk dihapus, stok akan berkurang kembali.

Jika transaksi barang keluar dihapus, stok akan bertambah kembali.

### 3. Barang Keluar Melebihi Stok

Kendala lainnya adalah kemungkinan jumlah barang keluar lebih besar daripada stok yang tersedia.

Perbaikannya adalah menambahkan validasi agar transaksi barang keluar ditolak jika jumlahnya melebihi stok.

## Penggunaan AI dan Referensi

AI digunakan sebagai bantuan dalam proses pengembangan aplikasi, terutama untuk memahami konsep, struktur kode, debugging, dan mencari solusi terhadap kendala yang ditemukan.

Kode dan solusi yang diperoleh dari AI disesuaikan dengan kebutuhan aplikasi, kemudian diuji dan diperiksa kembali agar dapat berjalan sesuai dengan kebutuhan proyek.

Referensi juga digunakan untuk memahami penggunaan teknologi yang digunakan dalam project, seperti:

- Next.js
- React
- Ant Design
- Node.js
- Express.js
- MySQL
- Recharts