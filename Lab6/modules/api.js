export const ENDPOINT = 'https://starcraft.op.edu.ua/starcraft-api';
export const HOST = 'https://starcraft.op.edu.ua';

export const Logic = {
    async getData(path) {
        const res = await fetch(`${ENDPOINT}${path}`);
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        return res.status === 204 ? true : await res.json();
    },
    async postData(path, body) {
        const res = await fetch(`${ENDPOINT}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Post error: ${res.status}`);
        return await res.json();
    },
    async removeData(path) {
        const res = await fetch(`${ENDPOINT}${path}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Delete error: ${res.status}`);
        return true;
    }
};
