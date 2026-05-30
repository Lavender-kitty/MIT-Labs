document.addEventListener('DOMContentLoaded', () => {
    const artistsList = document.getElementById('artists-list');
    const songsList = document.getElementById('songs-list');
    const queueList = document.getElementById('queue-list');
    const songsContainerHeader = document.querySelector('#songs-container .sub-header');
    
    const audio = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('total-duration');
    
    const currentTrackImg = document.getElementById('current-track-img');
    const currentTrackTitle = document.getElementById('current-track-title');
    const currentTrackArtist = document.getElementById('current-track-artist');

    // память
    let allData = [];
    let viewedArtist = null;
    let playingArtist = null;
    let playingSongIndex = -1;
    let queue = [];
    let isPlaying = false;
    let isDragging = false;

    // фетч
    async function fetchData() {
        try {
            const response = await fetch('data.json');
            let data = await response.json();
            allData = Array.isArray(data) ? data : [data];
            renderArtists();
            
            const savedVolume = localStorage.getItem('player-volume') || 80;
            audio.volume = savedVolume / 100;
            volumeSlider.value = savedVolume;
        } catch (err) {
            console.error('fetch failed:', err);
        }
    }

    function renderArtists() {
        artistsList.innerHTML = allData.map((a, i) => `
            <div class="artist-card" data-index="${i}">
                <img src="${a.image}" alt="${a.artist}" class="artist-img">
                <div class="artist-name">${a.artist}</div>
            </div>
        `).join('');

        document.querySelectorAll('.artist-card').forEach(c => {
            c.addEventListener('click', () => {
                const idx = c.getAttribute('data-index');
                selectArtist(idx);
            });
        });
    }

    function selectArtist(index) {
        viewedArtist = allData[index];
        document.querySelectorAll('.artist-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`.artist-card[data-index="${index}"]`).classList.add('active');
        
        songsContainerHeader.textContent = `Пісні: ${viewedArtist.artist}`;
        renderSongs();
    }

    function renderSongs() {
        if (!viewedArtist) return;

        songsList.innerHTML = viewedArtist.songs.map((s, i) => {
            const isPlayingThis = playingArtist && playingArtist.artist === viewedArtist.artist && i === playingSongIndex;
            return `
                <div class="song-item ${isPlayingThis ? 'playing' : ''}" data-index="${i}">
                    <span class="song-rank">${isPlayingThis ? '▶' : i + 1}</span>
                    <span class="song-title">${s.title}</span>
                    <div class="song-actions">
                        <button class="add-queue-btn" data-index="${i}" title="Add to queue">+</button>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-queue-btn')) return;
                const index = parseInt(item.getAttribute('data-index'));
                if (playingArtist && playingArtist.artist === viewedArtist.artist && playingSongIndex === index) {
                    togglePlay();
                } else {
                    playSong(index, viewedArtist);
                }
            });
        });

        document.querySelectorAll('.add-queue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToQueue(parseInt(btn.getAttribute('data-index')));
            });
        });
    }

    function playSong(index, artistData) {
        if (!artistData) return;
        
        playingArtist = artistData;
        playingSongIndex = index;
        const song = playingArtist.songs[index];

        audio.src = song.path;
        audio.play().catch(e => console.log('autoplay blocked:', e));
        isPlaying = true;
        updatePlayPauseUI();
        
        currentTrackImg.src = playingArtist.image;
        currentTrackTitle.textContent = song.title;
        currentTrackArtist.textContent = playingArtist.artist;
        
        renderSongs();
    }

    function togglePlay() {
        if (!audio.src) return;
        if (audio.paused) {
            audio.play();
            isPlaying = true;
        } else {
            audio.pause();
            isPlaying = false;
        }
        updatePlayPauseUI();
        renderSongs();
    }

    function updatePlayPauseUI() {
        playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    }

    function nextSong() {
        if (queue.length > 0) {
            const next = queue.shift();
            renderQueue();
            playSong(next.songIndex, next.artist);
        } else if (playingArtist) {
            let nextIdx = playingSongIndex + 1;
            if (nextIdx >= playingArtist.songs.length) {
                nextIdx = 0;
            }
            playSong(nextIdx, playingArtist);
        }
    }

    function prevSong() {
        if (playingArtist) {
            let prevIdx = playingSongIndex - 1;
            if (prevIdx < 0) prevIdx = playingArtist.songs.length - 1;
            playSong(prevIdx, playingArtist);
        }
    }

    function addToQueue(index) {
        const song = viewedArtist.songs[index];
        queue.push({
            songIndex: index,
            artist: viewedArtist,
            title: song.title
        });
        renderQueue();
    }

    function renderQueue() {
        queueList.innerHTML = queue.map((item, i) => `
            <li class="queue-item">
                <span>${item.title} - ${item.artist.artist}</span>
                <span class="remove-btn" onclick="removeFromQueue(${i})">✕</span>
            </li>
        `).join('');
    }

    window.removeFromQueue = (i) => {
        queue.splice(i, 1);
        renderQueue();
    };

    function updateProgress() {
        if (isDragging) return;
        
        const { duration, currentTime } = audio;
        if (isNaN(duration)) return;
        
        const percent = (currentTime / duration) * 100;
        progressBar.value = percent;
        
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }

    function formatTime(t) {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    playPauseBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    
    progressBar.addEventListener('mousedown', () => isDragging = true);
    progressBar.addEventListener('mouseup', () => isDragging = false);
    
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            const time = (progressBar.value / 100) * audio.duration;
            audio.currentTime = time;
            currentTimeEl.textContent = formatTime(time);
        }
    });

    volumeSlider.addEventListener('input', () => {
        const v = volumeSlider.value;
        audio.volume = v / 100;
        localStorage.setItem('player-volume', v);
    });

    fetchData();
});
