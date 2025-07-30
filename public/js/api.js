// F1 Bot API - Работа с данными
class F1API {
    constructor() {
        this.baseURL = '/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Проверяем кэш
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Сохраняем в кэш
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Получить ближайшую гонку
    async getNextRace() {
        return this.request('/next-race');
    }

    // Получить последнюю гонку
    async getLastRace() {
        return this.request('/last-race');
    }

    // Получить результаты последней гонки
    async getLastRaceResults() {
        return this.request('/last-race-results');
    }

    // Получить календарь сезона
    async getSeasonCalendar() {
        return this.request('/calendar');
    }

    // Получить всех пилотов
    async getAllDrivers() {
        return this.request('/drivers');
    }

    // Получить информацию о пилоте
    async getDriverInfo(driverId) {
        return this.request(`/driver/${driverId}`);
    }

    // Получить все команды
    async getAllTeams() {
        return this.request('/teams');
    }

    // Получить информацию о команде
    async getTeamInfo(teamId) {
        return this.request(`/team/${teamId}`);
    }

    // Получить пилотов команды
    async getTeamDrivers(teamId) {
        return this.request(`/team/${teamId}/drivers`);
    }

    // Получить зачёт пилотов
    async getDriverStandings() {
        return this.request('/standings/drivers');
    }

    // Получить зачёт конструкторов
    async getConstructorStandings() {
        return this.request('/standings/constructors');
    }

    // Получить все трассы
    async getAllCircuits() {
        return this.request('/circuits');
    }

    // Получить информацию о трассе
    async getCircuitInfo(circuitId) {
        return this.request(`/circuit/${circuitId}`);
    }

    // Очистить кэш
    clearCache() {
        this.cache.clear();
    }

    // Очистить кэш для конкретного эндпоинта
    clearCacheFor(endpoint) {
        for (const [key] of this.cache) {
            if (key.startsWith(endpoint)) {
                this.cache.delete(key);
            }
        }
    }
}

// Глобальный экземпляр API
const API = new F1API(); 