// F1 Bot Web App - Main Application
class F1BotApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentStandings = 'drivers';
        this.currentFilter = 'all';
        this.data = {
            nextRace: null,
            lastRace: null,
            standings: null,
            drivers: [],
            teams: [],
            races: []
        };
        this.init();
    }

    init() {
        this.initTelegramWebApp();
        this.initEventListeners();
        this.initTheme();
        this.loadDashboard();
    }

    initTelegramWebApp() {
        // Инициализация Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Установка основной темы
            if (tg.colorScheme === 'dark') {
                this.setTheme('dark');
            }
            
            // Обработка изменений темы
            tg.onEvent('themeChanged', () => {
                this.setTheme(tg.colorScheme === 'dark' ? 'dark' : 'light');
            });
        }
    }

    initEventListeners() {
        // Навигация по вкладкам
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Переключение зачётов
        document.querySelectorAll('.standings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const standingsType = e.currentTarget.dataset.standings;
                this.switchStandings(standingsType);
            });
        });

        // Фильтры гонок
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterRaces(filter);
            });
        });

        // Поиск пилотов
        const driverSearch = document.getElementById('driver-search');
        if (driverSearch) {
            driverSearch.addEventListener('input', (e) => {
                this.searchDrivers(e.target.value);
            });
        }

        // Поиск команд
        const teamSearch = document.getElementById('team-search');
        if (teamSearch) {
            teamSearch.addEventListener('input', (e) => {
                this.searchTeams(e.target.value);
            });
        }

        // Переключение темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Закрытие модального окна
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Обработка клавиши Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('f1bot-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('f1bot-theme', theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    switchTab(tabName) {
        // Обновляем активную вкладку в навигации
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Скрываем все контенты вкладок
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Показываем нужный контент
        document.getElementById(tabName).classList.add('active');
        this.currentTab = tabName;

        // Загружаем данные для вкладки
        this.loadTabData(tabName);
    }

    switchStandings(standingsType) {
        // Обновляем активную вкладку зачётов
        document.querySelectorAll('.standings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-standings="${standingsType}"]`).classList.add('active');

        // Скрываем все таблицы зачётов
        document.querySelectorAll('.standings-table').forEach(table => {
            table.classList.remove('active');
        });

        // Показываем нужную таблицу
        document.getElementById(`${standingsType}-standings`).classList.add('active');
        this.currentStandings = standingsType;

        // Загружаем данные зачёта
        this.loadStandings(standingsType);
    }

    filterRaces(filter) {
        // Обновляем активный фильтр
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.renderRaces();
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'races':
                await this.loadRaces();
                break;
            case 'drivers':
                await this.loadDrivers();
                break;
            case 'teams':
                await this.loadTeams();
                break;
            case 'standings':
                await this.loadStandings(this.currentStandings);
                break;
        }
    }

    async loadDashboard() {
        try {
            this.showLoading();
            
            // Загружаем данные параллельно
            const [nextRace, lastRace, standings] = await Promise.all([
                API.getNextRace(),
                API.getLastRace(),
                API.getDriverStandings()
            ]);

            this.data.nextRace = nextRace;
            this.data.lastRace = lastRace;
            this.data.standings = standings;

            this.renderDashboard();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Ошибка загрузки данных');
        } finally {
            this.hideLoading();
        }
    }

    async loadRaces() {
        try {
            this.showLoading();
            const races = await API.getSeasonCalendar();
            this.data.races = races;
            this.renderRaces();
        } catch (error) {
            console.error('Error loading races:', error);
            this.showError('Ошибка загрузки гонок');
        } finally {
            this.hideLoading();
        }
    }

    async loadDrivers() {
        try {
            this.showLoading();
            const drivers = await API.getAllDrivers();
            this.data.drivers = drivers;
            this.renderDrivers();
        } catch (error) {
            console.error('Error loading drivers:', error);
            this.showError('Ошибка загрузки пилотов');
        } finally {
            this.hideLoading();
        }
    }

    async loadTeams() {
        try {
            this.showLoading();
            const teams = await API.getAllTeams();
            this.data.teams = teams;
            this.renderTeams();
        } catch (error) {
            console.error('Error loading teams:', error);
            this.showError('Ошибка загрузки команд');
        } finally {
            this.hideLoading();
        }
    }

    async loadStandings(standingsType) {
        try {
            this.showLoading();
            const standings = standingsType === 'drivers' 
                ? await API.getDriverStandings()
                : await API.getConstructorStandings();
            
            this.data.standings = standings;
            this.renderStandings(standingsType);
        } catch (error) {
            console.error('Error loading standings:', error);
            this.showError('Ошибка загрузки зачёта');
        } finally {
            this.hideLoading();
        }
    }

    renderDashboard() {
        this.renderNextRace();
        this.renderLastRace();
        this.renderStandingsPreview();
    }

    renderNextRace() {
        const container = document.getElementById('next-race-content');
        if (!this.data.nextRace) {
            container.innerHTML = '<div class="loading">Нет данных о ближайшей гонке</div>';
            return;
        }

        const race = this.data.nextRace;
        const raceDate = race.schedule?.race?.date ? new Date(race.schedule.race.date) : null;
        const isToday = raceDate && this.isToday(raceDate);
        const isUpcoming = raceDate && raceDate > new Date();

        container.innerHTML = `
            <div class="next-race-info">
                <div class="race-item">
                    <i class="fas fa-flag-checkered"></i>
                    <div>
                        <strong>${race.raceName || 'Не указано'}</strong>
                        <div>${race.circuit?.circuitName || 'Не указано'}</div>
                    </div>
                </div>
                <div class="race-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <strong>Дата</strong>
                        <div>${raceDate ? this.formatDate(raceDate) : 'Не указано'}</div>
                    </div>
                </div>
                <div class="race-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <strong>Время</strong>
                        <div>${race.schedule?.race?.time ? this.formatTime(race.schedule.race.time) : 'Не указано'}</div>
                    </div>
                </div>
                ${isToday ? '<div class="race-item" style="background: #e8f5e8; color: #388e3c;"><i class="fas fa-star"></i><div><strong>СЕГОДНЯ ГОНКА!</strong></div></div>' : ''}
            </div>
        `;
    }

    renderLastRace() {
        const container = document.getElementById('last-race-content');
        if (!this.data.lastRace) {
            container.innerHTML = '<div class="loading">Нет данных о последней гонке</div>';
            return;
        }

        const race = this.data.lastRace;
        container.innerHTML = `
            <div class="race-result">
                <div class="position">
                    <i class="fas fa-trophy position-1"></i>
                    <span>${race.raceName || 'Не указано'}</span>
                </div>
                <div>${race.circuit?.circuitName || 'Не указано'}</div>
            </div>
            ${race.winner ? `
                <div class="race-result">
                    <div class="position">
                        <i class="fas fa-crown position-1"></i>
                        <span>Победитель: ${race.winner.name} ${race.winner.surname}</span>
                    </div>
                    <div>${race.teamWinner?.teamName || 'Не указано'}</div>
                </div>
            ` : ''}
        `;
    }

    renderStandingsPreview() {
        const container = document.getElementById('standings-preview-content');
        if (!this.data.standings || !this.data.standings.standings) {
            container.innerHTML = '<div class="loading">Нет данных о зачёте</div>';
            return;
        }

        const topDrivers = this.data.standings.standings.slice(0, 5);
        container.innerHTML = topDrivers.map((driver, index) => `
            <div class="race-result">
                <div class="position">
                    <span class="position-${index + 1}">${index + 1}</span>
                    <span>${driver.driver.name} ${driver.driver.surname}</span>
                </div>
                <div>${driver.points} очков</div>
            </div>
        `).join('');
    }

    renderRaces() {
        const container = document.getElementById('races-list');
        if (!this.data.races || !this.data.races.races) {
            container.innerHTML = '<div class="loading">Нет данных о гонках</div>';
            return;
        }

        let races = this.data.races.races;
        const now = new Date();

        // Фильтруем гонки
        if (this.currentFilter === 'upcoming') {
            races = races.filter(race => new Date(race.schedule?.race?.date) > now);
        } else if (this.currentFilter === 'completed') {
            races = races.filter(race => new Date(race.schedule?.race?.date) <= now);
        }

        if (races.length === 0) {
            container.innerHTML = '<div class="loading">Нет гонок для отображения</div>';
            return;
        }

        container.innerHTML = races.map(race => {
            const raceDate = new Date(race.schedule?.race?.date);
            const isToday = this.isToday(raceDate);
            const isUpcoming = raceDate > now;
            const isCompleted = raceDate <= now;

            let status = 'upcoming';
            let statusText = 'Предстоящая';
            
            if (isToday) {
                status = 'ongoing';
                statusText = 'Сегодня';
            } else if (isCompleted) {
                status = 'completed';
                statusText = 'Завершена';
            }

            return `
                <div class="race-card" onclick="app.showRaceDetails('${race.id}')">
                    <div class="race-header">
                        <div class="race-name">${race.raceName}</div>
                        <div class="race-status ${status}">${statusText}</div>
                    </div>
                    <div class="race-details">
                        <div class="race-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${race.circuit?.circuitName || 'Не указано'}</span>
                        </div>
                        <div class="race-detail">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(raceDate)}</span>
                        </div>
                        ${race.schedule?.race?.time ? `
                            <div class="race-detail">
                                <i class="fas fa-clock"></i>
                                <span>${this.formatTime(race.schedule.race.time)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDrivers() {
        const container = document.getElementById('drivers-grid');
        if (!this.data.drivers || this.data.drivers.length === 0) {
            container.innerHTML = '<div class="loading">Нет данных о пилотах</div>';
            return;
        }

        container.innerHTML = this.data.drivers.map(driver => `
            <div class="driver-card" onclick="app.showDriverDetails('${driver.id}')">
                <div class="driver-header">
                    <div class="driver-avatar">
                        ${driver.shortName ? driver.shortName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="driver-info">
                        <div class="driver-name">${driver.name} ${driver.surname}</div>
                        <div class="driver-number">№${driver.number || 'N/A'}</div>
                    </div>
                </div>
                <div class="driver-details">
                    <div class="driver-detail">
                        <i class="fas fa-user"></i>
                        <span>${driver.shortName || 'N/A'}</span>
                    </div>
                    <div class="driver-detail">
                        <i class="fas fa-flag"></i>
                        <span>${driver.nationality || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTeams() {
        const container = document.getElementById('teams-grid');
        if (!this.data.teams || this.data.teams.length === 0) {
            container.innerHTML = '<div class="loading">Нет данных о командах</div>';
            return;
        }

        container.innerHTML = this.data.teams.map(team => `
            <div class="team-card" onclick="app.showTeamDetails('${team.id}')">
                <div class="team-header">
                    <div class="team-logo">
                        ${team.name ? team.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="team-info">
                        <div class="team-name">${team.name}</div>
                        <div class="team-nationality">${team.nationality || 'N/A'}</div>
                    </div>
                </div>
                <div class="team-details">
                    ${team.base ? `
                        <div class="team-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${team.base}</span>
                        </div>
                    ` : ''}
                    ${team.teamChief ? `
                        <div class="team-detail">
                            <i class="fas fa-user-tie"></i>
                            <span>${team.teamChief}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderStandings(standingsType) {
        const container = document.getElementById(`${standingsType}-standings`);
        if (!this.data.standings || !this.data.standings.standings) {
            container.innerHTML = '<div class="loading">Нет данных о зачёте</div>';
            return;
        }

        const standings = this.data.standings.standings;
        container.innerHTML = `
            <div class="standings-row">
                <div class="position-number">Поз</div>
                <div>${standingsType === 'drivers' ? 'Пилот' : 'Команда'}</div>
                <div class="points">Очки</div>
            </div>
            ${standings.map((item, index) => {
                const position = index + 1;
                const name = standingsType === 'drivers' 
                    ? `${item.driver.name} ${item.driver.surname}`
                    : item.team.name;
                const team = standingsType === 'drivers' 
                    ? item.team.name 
                    : item.team.nationality;

                return `
                    <div class="standings-row">
                        <div class="position-number">${position}</div>
                        <div class="${standingsType}-standings-info">
                            <div class="${standingsType}-name-standings">${name}</div>
                            <div class="${standingsType === 'drivers' ? 'driver-team' : 'constructor-nationality'}">${team}</div>
                        </div>
                        <div class="points">${item.points}</div>
                    </div>
                `;
            }).join('')}
        `;
    }

    searchDrivers(query) {
        if (!this.data.drivers) return;
        
        const filteredDrivers = this.data.drivers.filter(driver => 
            driver.name.toLowerCase().includes(query.toLowerCase()) ||
            driver.surname.toLowerCase().includes(query.toLowerCase()) ||
            driver.shortName.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderDriversList(filteredDrivers);
    }

    searchTeams(query) {
        if (!this.data.teams) return;
        
        const filteredTeams = this.data.teams.filter(team => 
            team.name.toLowerCase().includes(query.toLowerCase()) ||
            team.nationality.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderTeamsList(filteredTeams);
    }

    renderDriversList(drivers) {
        const container = document.getElementById('drivers-grid');
        if (drivers.length === 0) {
            container.innerHTML = '<div class="loading">Пилоты не найдены</div>';
            return;
        }

        container.innerHTML = drivers.map(driver => `
            <div class="driver-card" onclick="app.showDriverDetails('${driver.id}')">
                <div class="driver-header">
                    <div class="driver-avatar">
                        ${driver.shortName ? driver.shortName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="driver-info">
                        <div class="driver-name">${driver.name} ${driver.surname}</div>
                        <div class="driver-number">№${driver.number || 'N/A'}</div>
                    </div>
                </div>
                <div class="driver-details">
                    <div class="driver-detail">
                        <i class="fas fa-user"></i>
                        <span>${driver.shortName || 'N/A'}</span>
                    </div>
                    <div class="driver-detail">
                        <i class="fas fa-flag"></i>
                        <span>${driver.nationality || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTeamsList(teams) {
        const container = document.getElementById('teams-grid');
        if (teams.length === 0) {
            container.innerHTML = '<div class="loading">Команды не найдены</div>';
            return;
        }

        container.innerHTML = teams.map(team => `
            <div class="team-card" onclick="app.showTeamDetails('${team.id}')">
                <div class="team-header">
                    <div class="team-logo">
                        ${team.name ? team.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="team-info">
                        <div class="team-name">${team.name}</div>
                        <div class="team-nationality">${team.nationality || 'N/A'}</div>
                    </div>
                </div>
                <div class="team-details">
                    ${team.base ? `
                        <div class="team-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${team.base}</span>
                        </div>
                    ` : ''}
                    ${team.teamChief ? `
                        <div class="team-detail">
                            <i class="fas fa-user-tie"></i>
                            <span>${team.teamChief}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    showRaceDetails(raceId) {
        // Показать детали гонки в модальном окне
        this.showModal('Детали гонки', 'Загрузка...');
        // Здесь можно добавить загрузку детальной информации о гонке
    }

    showDriverDetails(driverId) {
        // Показать детали пилота в модальном окне
        this.showModal('Информация о пилоте', 'Загрузка...');
        // Здесь можно добавить загрузку детальной информации о пилоте
    }

    showTeamDetails(teamId) {
        // Показать детали команды в модальном окне
        this.showModal('Информация о команде', 'Загрузка...');
        // Здесь можно добавить загрузку детальной информации о команде
    }

    showModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showError(message) {
        // Показать ошибку пользователю
        console.error(message);
        // Можно добавить toast уведомление
    }

    // Утилиты
    formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(time) {
        return time;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
}

// Глобальные функции для быстрых действий
function showCalendar() {
    app.switchTab('races');
}

function showDrivers() {
    app.switchTab('drivers');
}

function showTeams() {
    app.switchTab('teams');
}

function showStandings() {
    app.switchTab('standings');
}

function closeModal() {
    app.closeModal();
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new F1BotApp();
}); 