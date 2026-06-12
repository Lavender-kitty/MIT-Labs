import { API } from './api.js';
import { Renderer } from './renderer.js';
import { ThemeManager } from './modules/themeManager.js';
import { Modal } from './modules/modal.js';

class App {
    constructor() {
        this.currentRaceId = parseInt(localStorage.getItem('currentRaceId')) || 1;
        this.isEditorMode = localStorage.getItem('isEditorMode') === 'true';
        this.units = [];
        this.currentSort = 'default';

        this.initElements();
        this.initEvents();
        
        ThemeManager.setTheme(this.currentRaceId);
        this.loadRaceData(this.currentRaceId);
        this.toggleEditorUI();
    }

    initElements() {
        this.leaderContainer = document.getElementById('leader-section');
        this.unitsContainer = document.getElementById('units-container');
        this.raceButtons = document.querySelectorAll('.nav-btn');
        this.editorToggle = document.getElementById('editor-mode-toggle');
        this.addUnitBtn = document.getElementById('add-unit-btn');
        this.sortSelect = document.getElementById('sort-select');
        this.closeModalBtn = document.querySelector('.close-btn');
        this.unitForm = document.getElementById('unit-form');

        this.editorToggle.checked = this.isEditorMode;
        Modal.init('modal', 'unit-form');

        this.raceButtons.forEach(btn => {
            if (parseInt(btn.dataset.race) === this.currentRaceId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initEvents() {
        this.raceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const raceId = parseInt(btn.dataset.race);
                if (this.currentRaceId !== raceId) {
                    this.switchRace(raceId, btn);
                }
            });
        });

        this.editorToggle.addEventListener('change', (e) => {
            this.isEditorMode = e.target.checked;
            localStorage.setItem('isEditorMode', this.isEditorMode);
            this.toggleEditorUI();
            this.renderUnits();
        });

        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderUnits();
        });

        this.addUnitBtn.addEventListener('click', () => Modal.show(true));
        this.closeModalBtn.addEventListener('click', () => Modal.show(false));
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) Modal.show(false);
        });

        this.unitForm.addEventListener('submit', (e) => this.handleCreateUnit(e));
    }

    async switchRace(raceId, btn) {
        this.currentRaceId = raceId;
        localStorage.setItem('currentRaceId', raceId);
        
        this.raceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        ThemeManager.setTheme(raceId);
        await this.loadRaceData(raceId);
    }

    async loadRaceData(raceId) {
        try {
            this.leaderContainer.innerHTML = '<div class="loading-spinner">Loading info...</div>';
            this.unitsContainer.innerHTML = '<div class="loading-spinner">Loading units...</div>';

            const [leader, units] = await Promise.all([
                API.getLeaderByRace(raceId),
                API.getUnitsByRace(raceId)
            ]);

            this.units = units;
            Renderer.renderLeader(leader, this.leaderContainer);
            this.renderUnits();
        } catch (error) {
            Renderer.showError(`Failed to load data: ${error.message}`);
        }
    }

    renderUnits() {
        let sortedUnits = [...this.units];

        if (this.currentSort === 'asc') {
            sortedUnits.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.currentSort === 'desc') {
            sortedUnits.sort((a, b) => b.name.localeCompare(a.name));
        }

        Renderer.renderUnits(
            sortedUnits, 
            this.unitsContainer, 
            this.isEditorMode, 
            (id) => this.handleDeleteUnit(id)
        );
    }

    toggleEditorUI() {
        if (this.isEditorMode) {
            this.addUnitBtn.classList.remove('hidden');
        } else {
            this.addUnitBtn.classList.add('hidden');
        }
    }

    async handleCreateUnit(e) {
        e.preventDefault();
        
        const unitData = {
            name: document.getElementById('unit-name').value,
            description: document.getElementById('unit-description').value,
            image: document.getElementById('unit-image').value,
            raceId: this.currentRaceId
        };

        try {
            const newUnit = await API.createUnit(unitData);
            this.units.push(newUnit);
            this.renderUnits();
            Modal.show(false);
        } catch (error) {
            Renderer.showError(`Could not create unit: ${error.message}`);
        }
    }

    async handleDeleteUnit(id) {
        if (!confirm('Are you sure you want to delete this unit?')) return;

        try {
            await API.deleteUnit(id);
            this.units = this.units.filter(u => u.id != id);
            this.renderUnits();
        } catch (error) {
            Renderer.showError(`Could not delete unit: ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
