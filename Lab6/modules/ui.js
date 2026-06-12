import { HOST } from './api.js';

export const UI = {
    imgUrl(path) {
        if (!path) return 'https://via.placeholder.com/400';
        return path.startsWith('http') ? path : `${HOST}${path}`;
    },
    
    // Abstracting rendering block to follow DRY principle
    renderCard(data, type, isAdmin = false, onDel = null, idx = 0) {
        const wiki = data.wikiUrl || data.wiki || data.wikiLink;
        const imgPath = this.imgUrl(data.image || data.imageUrl);
        
        if (type === 'hero') {
            return `
                <div class="hero-card reveal-item">
                    <img src="${imgPath}" class="hero-img">
                    <div class="hero-bio">
                        <h3>${data.name}</h3>
                        <p>${data.description}</p>
                        ${wiki ? `<a href="${wiki}" target="_blank" class="external-link">Wiki Archive</a>` : ''}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="soldier-entry reveal-item" style="transition-delay: ${(idx % 10) * 0.05}s">
                    ${isAdmin ? `<button class="remove-btn" data-id="${data.id}">Kill</button>` : ''}
                    <img src="${imgPath}" class="soldier-img">
                    <div class="soldier-info">
                        <h4>${data.name}</h4>
                        <p>${data.description}</p>
                    </div>
                </div>
            `;
        }
    },

    showHero(data, target) {
        if(!data) {
             target.innerHTML = '<p>No data found</p>';
             return;
        }
        target.innerHTML = this.renderCard(data, 'hero');
    },

    showTroops(list, target, isAdmin, onDel) {
        if(!list || list.length === 0) {
             target.innerHTML = '<p>No troops found</p>';
             return;
        }
        
        target.innerHTML = list.map((t, idx) => this.renderCard(t, 'troop', isAdmin, onDel, idx)).join('');
        
        if (isAdmin) {
            target.querySelectorAll('.remove-btn').forEach(b => {
                b.onclick = () => onDel(b.dataset.id);
            });
        }
    },

    alert(msg) {
        const box = document.getElementById('notice-popup');
        box.textContent = msg;
        box.classList.remove('hide');
        setTimeout(() => box.classList.add('hide'), 4000);
    }
};
