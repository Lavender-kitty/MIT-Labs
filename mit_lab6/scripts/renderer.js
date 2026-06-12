const SERVER_URL = 'https://starcraft.op.edu.ua';

export const Renderer = {
    _getFullImageUrl(path) {
        if (!path) return 'assets/placeholder.jpg';
        if (path.startsWith('http')) return path;
        return `${SERVER_URL}${path}`;
    },

    _createCardHTML({ id, name, description, image, wikiUrl, isUnit = true, isEditorMode = false, onDelete = null }) {
        const fullImage = this._getFullImageUrl(image);
        
        return `
            <div class="${isUnit ? 'unit-card' : 'leader-card'}" data-id="${id || ''}">
                ${isUnit && isEditorMode ? `<button class="delete-btn" data-id="${id}">Delete</button>` : ''}
                <img src="${fullImage}" alt="${name}" class="${isUnit ? 'unit-img' : 'leader-img'}">
                <div class="${isUnit ? 'unit-details' : 'leader-info'}">
                    ${isUnit ? `<h4>${name}</h4>` : `<h3>${name}</h3>`}
                    <p>${description}</p>
                    ${wikiUrl ? `<a href="${wikiUrl}" target="_blank" class="wiki-link">Read more on Wiki</a>` : ''}
                </div>
            </div>
        `;
    },

    renderLeader(leader, container) {
        if (!leader) {
            container.innerHTML = '<p>Leader info not found</p>';
            return;
        }

        const wiki = leader.wikiUrl || leader.wiki || leader.wikiLink;
        const image = leader.image || leader.imageUrl;

        container.innerHTML = this._createCardHTML({
            name: leader.name,
            description: leader.description,
            image: image,
            wikiUrl: wiki,
            isUnit: false
        });
    },

    renderUnits(units, container, isEditorMode, onDelete) {
        if (!units || units.length === 0) {
            container.innerHTML = '<p>No units found</p>';
            return;
        }

        container.innerHTML = units.map(unit => 
            this._createCardHTML({
                id: unit.id,
                name: unit.name,
                description: unit.description,
                image: unit.image || unit.imageUrl,
                isUnit: true,
                isEditorMode: isEditorMode
            })
        ).join('');

        if (isEditorMode) {
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = () => onDelete(btn.dataset.id);
            });
        }
    },

    showError(message) {
        const toast = document.getElementById('error-toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }
};
