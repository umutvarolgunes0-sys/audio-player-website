// DOM Elementleri
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressInput = document.getElementById('progressInput');
const progress = document.getElementById('progress');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const volumeInput = document.getElementById('volumeInput');
const volumePercent = document.getElementById('volumePercent');
const trackName = document.getElementById('trackName');
const artistName = document.getElementById('artistName');
const albumImage = document.getElementById('albumImage');
const playlistContainer = document.getElementById('playlistContainer');
const addMusicBtn = document.getElementById('addMusicBtn');
const musicUrlInput = document.getElementById('musicUrl');
const trackTitleInput = document.getElementById('trackTitle');
const artistTitleInput = document.getElementById('artistTitle');

// Playlist
let playlist = [
  {
    title: 'Hoş Geldiniz',
    artist: 'Audio Player',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    image: 'https://via.placeholder.com/300?text=Welcome'
  },
  {
    title: 'Demo Şarkı',
    artist: 'Test Sanatçı',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    image: 'https://via.placeholder.com/300?text=Demo'
  }
];

let currentTrackIndex = 0;
let isPlaying = false;

// Başlangıç
function init() {
  updatePlaylist();
  loadTrack(currentTrackIndex);
  
  // Event Listeners
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', nextTrack);
  audioPlayer.addEventListener('loadedmetadata', updateDuration);
  progressInput.addEventListener('input', seekTrack);
  volumeInput.addEventListener('input', changeVolume);
  addMusicBtn.addEventListener('click', addMusic);

  // Enter tuşu ile müzik ekle
  musicUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMusic();
  });

  // Başlangıç ses seviyesi
  audioPlayer.volume = 0.7;
}

// Şarkı Yükle
function loadTrack(index) {
  if (index < 0) {
    currentTrackIndex = playlist.length - 1;
  } else if (index >= playlist.length) {
    currentTrackIndex = 0;
  } else {
    currentTrackIndex = index;
  }

  const track = playlist[currentTrackIndex];
  audioPlayer.src = track.url;
  trackName.textContent = track.title;
  artistName.textContent = track.artist;
  albumImage.src = track.image;
  albumImage.alt = track.title;

  // Aktif şarkıyı vurgula
  updateActivePlaylistItem();

  if (isPlaying) {
    audioPlayer.play();
  }
}

// Oynat/Duraklat
function togglePlay() {
  if (isPlaying) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
  }
}

audioPlayer.addEventListener('play', () => {
  isPlaying = true;
  playBtn.innerHTML = '<span>⏸</span>';
});

audioPlayer.addEventListener('pause', () => {
  isPlaying = false;
  playBtn.innerHTML = '<span>▶</span>';
});

// Sonraki Şarkı
function nextTrack() {
  loadTrack(currentTrackIndex + 1);
  if (isPlaying) {
    audioPlayer.play();
  }
}

// Önceki Şarkı
function prevTrack() {
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
  } else {
    loadTrack(currentTrackIndex - 1);
    if (isPlaying) {
      audioPlayer.play();
    }
  }
}

// İlerleme Çubuğu Güncelle
function updateProgress() {
  const { currentTime, duration } = audioPlayer;
  const progressPercent = (currentTime / duration) * 100 || 0;
  progress.style.width = progressPercent + '%';
  progressInput.value = progressPercent;

  currentTimeDisplay.textContent = formatTime(currentTime);
}

// Şarkıyı Ara
function seekTrack(e) {
  const seekTime = (e.target.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
}

// Süre Güncelle
function updateDuration() {
  durationDisplay.textContent = formatTime(audioPlayer.duration);
  progressInput.max = 100;
}

// Saat Biçimi (MM:SS)
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Ses Seviyesi
function changeVolume(e) {
  const volume = e.target.value / 100;
  audioPlayer.volume = volume;
  volumePercent.textContent = e.target.value + '%';
}

// Çalma Listesi Güncelle
function updatePlaylist() {
  playlistContainer.innerHTML = '';
  
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    if (index === currentTrackIndex) {
      li.classList.add('active');
    }

    li.innerHTML = `
      <div class="playlist-item-info">
        <div class="playlist-item-title">${track.title}</div>
        <div class="playlist-item-artist">${track.artist}</div>
      </div>
      <button class="playlist-item-delete" onclick="deleteTrack(${index})">Sil</button>
    `;

    li.addEventListener('click', (e) => {
      if (!e.target.classList.contains('playlist-item-delete')) {
        loadTrack(index);
        audioPlayer.play();
      }
    });

    playlistContainer.appendChild(li);
  });
}

// Aktif Çalma Listesi Öğesini Güncelle
function updateActivePlaylistItem() {
  const items = playlistContainer.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    item.classList.toggle('active', index === currentTrackIndex);
  });
}

// Müzik Ekle
function addMusic() {
  const url = musicUrlInput.value.trim();
  const title = trackTitleInput.value.trim();
  const artist = artistTitleInput.value.trim();

  if (!url || !title || !artist) {
    alert('Lütfen tüm alanları doldurun!');
    return;
  }

  // URL validasyonu basit
  if (!url.includes('http')) {
    alert('Geçerli bir URL giriniz!');
    return;
  }

  playlist.push({
    title: title,
    artist: artist,
    url: url,
    image: 'https://via.placeholder.com/300?text=' + encodeURIComponent(title)
  });

  // Input'ları temizle
  musicUrlInput.value = '';
  trackTitleInput.value = '';
  artistTitleInput.value = '';

  updatePlaylist();
  alert('✅ Müzik başarıyla eklendi!');
}

// Müzik Sil
function deleteTrack(index) {
  if (playlist.length === 1) {
    alert('En az bir şarkı olmalı!');
    return;
  }

  playlist.splice(index, 1);

  if (currentTrackIndex >= playlist.length) {
    currentTrackIndex = 0;
  }

  if (currentTrackIndex === index) {
    loadTrack(currentTrackIndex);
  }

  updatePlaylist();
}

// Başlat
init();
