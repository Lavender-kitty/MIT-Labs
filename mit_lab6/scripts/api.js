const BASE_URL = 'https://starcraft.op.edu.ua/starcraft-api';

export const API = {
    async getLeaderByRace(raceId) {
        return this._request(`/Leader/by-race/${raceId}`);
    },

    async getUnitsByRace(raceId) {
        return this._request(`/Unit?raceId=${raceId}`);
    },

    async createUnit(unitData) {
        return this._request('/Unit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unitData)
        });
    },

    async deleteUnit(unitId) {
        return this._request(`/Unit/${unitId}`, {
            method: 'DELETE'
        });
    },

    async _request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        try {
            const fetchOptions = {
                ...options,
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    ...(options.headers || {})
                }
            };

            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Server error ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }
            
            if (response.status === 204) return true;
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
