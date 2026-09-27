const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Neon Veritabanı bağlantısı ekledik

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let currentTrack = { url: '', title: 'Henüz müzik çalmıyor' };

// Müzik Yükleme API'si (Neon Veritabanına kayıt eklendi)
app.post('/api/upload', upload.single('music'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi.' });
    }

    const track = {
        title: req.file.originalname,
        url: `/uploads/${req.file.filename}`
    };

    try {
        // Neon veritabanına şarkıyı kaydediyoruz
        await db.query('INSERT INTO playlist (title, url) VALUES ($1, $2)', [track.title, track.url]);

        // Güncel listeyi veritabanından çekip herkese bildiriyoruz
        const result = await db.query('SELECT * FROM playlist ORDER BY id ASC');
        io.emit('update_playlist', result.rows);

        res.json({ success: true, ...track });
    } catch (err) {
        console.error("Veritabanına kayıt hatası:", err);
        res.status(500).json({ success: false, error: 'Veritabanı hatası.' });
    }
});

io.on('connection', async (socket) => {
    console.log('Bir kullanıcı bağlandı.');

    try {
        // Kullanıcı bağlandığında veritabanındaki tüm şarkıları listele
        const result = await db.query('SELECT * FROM playlist ORDER BY id ASC');
        socket.emit('update_playlist', result.rows);
    } catch (err) {
        console.error("Çalma listesi yüklenirken hata:", err);
    }

    socket.emit('play_track', currentTrack);

    // Listeden bir şarkı seçildiğinde
    socket.on('change_track', (track) => {
        currentTrack = track;
        io.emit('play_track', currentTrack);
    });

    socket.on('disconnect', () => {
        console.log('Bir kullanıcı ayrıldı.');
    });
});

server.listen(3000, () => {
    console.log('🚀 Sunucu çalışıyor: http://localhost:3000');
});