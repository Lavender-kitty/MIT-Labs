import { Logic } from './modules/api.js';
import { UI } from './modules/ui.js';

class StarfallApp {
    constructor() {
        this.activeFaction = parseInt(localStorage.getItem('savedFaction')) || 1;
        this.adminView = localStorage.getItem('savedAdmin') === 'true';
        this.troops = [];
        this.order = 'default';

        this.bindElements();
        this.bindEvents();
        this.refresh();
    }

    bindElements() {
        this.heroContainer = document.getElementById('hero-area');
        this.troopContainer = document.getElementById('troop-container');
        this.navButtons = document.querySelectorAll('.tab-btn');
        this.adminToggle = document.getElementById('admin-mode-check');
        this.spawnBtn = document.getElementById('spawn-btn');
        this.sortBox = document.getElementById('troop-sort');
        this.overlay = document.getElementById('form-overlay');
        this.form = document.getElementById('troop-form');

        this.adminToggle.checked = this.adminView;
        this.navButtons.forEach(b => {
            if (parseInt(b.dataset.faction) === this.activeFaction) b.classList.add('active');
        });
        if (this.adminView) this.spawnBtn.classList.remove('hide');
    }

    bindEvents() {
        this.navButtons.forEach(b => {
            b.onclick = () => {
                const newFaction = parseInt(b.dataset.faction);
                if (this.activeFaction === newFaction) return;
                
                this.activeFaction = newFaction;
                localStorage.setItem('savedFaction', this.activeFaction);
                this.navButtons.forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                
                const raceClass = this.activeFaction === 1 ? 'theme-terran' : this.activeFaction === 2 ? 'theme-zerg' : 'theme-protoss';
                document.body.className = raceClass;
                
                this.refresh();
            };
        });

        this.adminToggle.onchange = (e) => {
            this.adminView = e.target.checked;
            localStorage.setItem('savedAdmin', this.adminView);
            this.spawnBtn.classList.toggle('hide', !this.adminView);
            this.display();
        };

        this.sortBox.onchange = (e) => {
            this.order = e.target.value;
            this.display();
        };

        this.spawnBtn.onclick = () => this.overlay.classList.remove('hide');
        document.querySelector('.close-x').onclick = () => this.overlay.classList.add('hide');

        this.form.onsubmit = async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('in-name').value,
                description: document.getElementById('in-desc').value,
                image: document.getElementById('in-img').value,
                raceId: this.activeFaction
            };
            try {
                const created = await Logic.postData('/Unit', payload);
                this.troops.push(created);
                this.display();
                this.overlay.classList.add('hide');
                this.form.reset();
            } catch (err) { UI.alert(err.message); }
        };
    }

    async refresh() {
        try {
            this.heroContainer.innerHTML = '<div class="spinner">Decrypting Hero Records...</div>';
            this.troopContainer.innerHTML = '<div class="spinner">Fetching Troop Manifest...</div>';
            
            const [hero, list] = await Promise.all([
                Logic.getData(`/Leader/by-race/${this.activeFaction}`),
                Logic.getData(`/Unit?raceId=${this.activeFaction}`)
            ]);

            this.troops = list;
            UI.showHero(hero, this.heroContainer);
            this.display();
        } catch (err) { UI.alert(err.message); }
    }

    display() {
        let sorted = [...this.troops];
        if (this.order === 'asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
        else if (this.order === 'desc') sorted.sort((a, b) => b.name.localeCompare(a.name));

        UI.showTroops(sorted, this.troopContainer, this.adminView, (id) => this.kill(id));
        this.initScrollAnimations();
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
    }

    async kill(id) {
        if (!confirm('Eliminate this record?')) return;
        try {
            await Logic.removeData(`/Unit/${id}`);
            this.troops = this.troops.filter(t => t.id != id);
            this.display();
        } catch (err) { UI.alert(err.message); }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = parseInt(localStorage.getItem('savedFaction')) || 1;
    document.body.className = `theme-${saved === 1 ? 'terran' : saved === 2 ? 'zerg' : 'protoss'}`;
    new StarfallApp();
});
