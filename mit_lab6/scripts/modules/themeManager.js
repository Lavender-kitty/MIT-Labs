export const ThemeManager = {
    setTheme(raceId) {
        const themeClass = raceId === 1 ? 'theme-terran' : raceId === 2 ? 'theme-zerg' : 'theme-protoss';
        document.body.className = themeClass;
    }
};
