document.addEventListener('DOMContentLoaded', () => {
    class MusicPlayer {
        constructor() {
            this.artistsList = document.getElementById('artists-list');
            this.songsList = document.getElementById('songs-list');
            this.queueList = document.getElementById('queue-list');
            this.songsContainerHeader = document.querySelector('#songs-container .sub-header');
            
            this.audio = document.getElementById('audio-player');
            this.playPauseBtn = document.getElementById('play-pause-btn');
            this.prevBtn = document.getElementById('prev-btn');
            this.nextBtn = document.getElementById('next-btn');
            this.progressBar = document.getElementById('progress-bar');
            this.volumeSlider = document.getElementById('volume-slider');
            this.currentTimeEl = document.getElementById('current-time');
            this.durationEl = document.getElementById('total-duration');
            
            this.currentTrackImg = document.getElementById('current-track-img');
            this.currentTrackTitle = document.getElementById('current-track-title');
            this.currentTrackArtist = document.getElementById('current-track-artist');

            // память
            this.allData = [];
            this.viewedArtist = null;
            this.playingArtist = null;
            this.playingSongIndex = -1;
            this.queue = [];
            this.isPlaying = false;
            this.isDragging = false;

            this.init();
        }

        init() {
            this.fetchData();
            this.setupEvents();
        }

        // фетч
        async fetchData() {
            try {
                const response = await fetch('data.json');
                let data = await response.json();
                this.allData = Array.isArray(data) ? data : [data];
                this.renderArtists();
                
                const savedVolume = localStorage.getItem('player-volume') || 80;
                this.audio.volume = savedVolume / 100;
                this.volumeSlider.value = savedVolume;
            } catch (err) {
                console.error('fetch failed:', err);
            }
        }

        setupEvents() {
            this.playPauseBtn.addEventListener('click', () => this.togglePlay());
            this.nextBtn.addEventListener('click', () => this.nextSong());
            this.prevBtn.addEventListener('click', () => this.prevSong());
            
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.nextSong());
            
            this.progressBar.addEventListener('mousedown', () => this.isDragging = true);
            this.progressBar.addEventListener('mouseup', () => this.isDragging = false);
            
            this.progressBar.addEventListener('input', () => {
                if (this.audio.duration) {
                    const time = (this.progressBar.value / 100) * this.audio.duration;
                    this.audio.currentTime = time;
                    this.currentTimeEl.textContent = this.formatTime(time);
                }
            });

            this.volumeSlider.addEventListener('input', () => {
                const v = this.volumeSlider.value;
                this.audio.volume = v / 100;
                localStorage.setItem('player-volume', v);
            });
        }

        renderArtists() {
            this.artistsList.innerHTML = this.allData.map((a, i) => `
                <div class="artist-card" data-index="${i}">
                    <img src="${a.image}" alt="${a.artist}" class="artist-img">
                    <div class="artist-name">${a.artist}</div>
                </div>
            `).join('');

            this.artistsList.querySelectorAll('.artist-card').forEach(c => {
                c.addEventListener('click', () => {
                    const idx = c.getAttribute('data-index');
                    this.selectArtist(idx);
                });
            });
        }

        selectArtist(index) {
            this.viewedArtist = this.allData[index];
            this.artistsList.querySelectorAll('.artist-card').forEach(c => c.classList.remove('active'));
            this.artistsList.querySelector(`.artist-card[data-index="${index}"]`).classList.add('active');
            
            this.songsContainerHeader.textContent = `Songs: ${this.viewedArtist.artist}`;
            this.renderSongs();
        }

        renderSongs() {
            if (!this.viewedArtist) return;

            this.songsList.innerHTML = this.viewedArtist.songs.map((s, i) => {
                const isPlayingThis = this.playingArtist && this.playingArtist.artist === this.viewedArtist.artist && i === this.playingSongIndex;
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

            this.songsList.querySelectorAll('.song-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.classList.contains('add-queue-btn')) return;
                    const index = parseInt(item.getAttribute('data-index'));
                    if (this.playingArtist && this.playingArtist.artist === this.viewedArtist.artist && this.playingSongIndex === index) {
                        this.togglePlay();
                    } else {
                        this.playSong(index, this.viewedArtist);
                    }
                });
            });

            this.songsList.querySelectorAll('.add-queue-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addToQueue(parseInt(btn.getAttribute('data-index')));
                });
            });
        }

        playSong(index, artistData) {
            if (!artistData) return;
            
            this.playingArtist = artistData;
            this.playingSongIndex = index;
            const song = this.playingArtist.songs[index];

            this.audio.src = song.path;
            this.audio.play().catch(e => console.log('autoplay blocked:', e));
            this.isPlaying = true;
            this.updatePlayPauseUI();
            
            this.currentTrackImg.src = this.playingArtist.image;
            this.currentTrackTitle.textContent = song.title;
            this.currentTrackArtist.textContent = this.playingArtist.artist;
            
            this.renderSongs();
        }

        togglePlay() {
            if (!this.audio.src) return;
            if (this.audio.paused) {
                this.audio.play();
                this.isPlaying = true;
            } else {
                this.audio.pause();
                this.isPlaying = false;
            }
            this.updatePlayPauseUI();
            this.renderSongs();
        }

        updatePlayPauseUI() {
            this.playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }

        nextSong() {
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.renderQueue();
                this.playSong(next.songIndex, next.artist);
            } else if (this.playingArtist) {
                let nextIdx = this.playingSongIndex + 1;
                if (nextIdx >= this.playingArtist.songs.length) {
                    nextIdx = 0;
                }
                this.playSong(nextIdx, this.playingArtist);
            }
        }

        prevSong() {
            if (this.playingArtist) {
                let prevIdx = this.playingSongIndex - 1;
                if (prevIdx < 0) prevIdx = this.playingArtist.songs.length - 1;
                this.playSong(prevIdx, this.playingArtist);
            }
        }

        addToQueue(index) {
            const song = this.viewedArtist.songs[index];
            this.queue.push({
                songIndex: index,
                artist: this.viewedArtist,
                title: song.title
            });
            this.renderQueue();
        }

        renderQueue() {
            this.queueList.innerHTML = this.queue.map((item, i) => `
                <li class="queue-item">
                    <span>${item.title} - ${item.artist.artist}</span>
                    <span class="remove-btn" data-index="${i}">✕</span>
                </li>
            `).join('');

            this.queueList.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.removeFromQueue(parseInt(btn.dataset.index));
                });
            });
        }

        removeFromQueue(i) {
            this.queue.splice(i, 1);
            this.renderQueue();
        }

        updateProgress() {
            if (this.isDragging) return;
            
            const { duration, currentTime } = this.audio;
            if (isNaN(duration)) return;
            
            const percent = (currentTime / duration) * 100;
            this.progressBar.value = percent;
            
            this.currentTimeEl.textContent = this.formatTime(currentTime);
            this.durationEl.textContent = this.formatTime(duration);
        }

        formatTime(t) {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }

    new MusicPlayer();
});
