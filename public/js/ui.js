// F1 Bot UI - Дополнительные функции интерфейса

// Toast уведомления
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    }
    
    static getIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Анимации и переходы
class Animations {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    static fadeOut(element, duration = 300) {
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    static slideIn(element, direction = 'left', duration = 300) {
        const distance = direction === 'left' || direction === 'right' ? '100%' : '50px';
        const transform = direction === 'left' ? 'translateX(-100%)' : 
                         direction === 'right' ? 'translateX(100%)' :
                         direction === 'up' ? 'translateY(-50px)' : 'translateY(50px)';
        
        element.style.transform = transform;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const ratio = Math.min(progress / duration, 1);
            
            element.style.transform = `translateX(${(ratio - 1) * 100}%)`;
            element.style.opacity = ratio;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Утилиты для работы с датами
class DateUtils {
    static formatDate(date, locale = 'ru-RU') {
        if (!date) return 'Не указано';
        
        const d = new Date(date);
        return d.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    static formatTime(time) {
        if (!time) return 'Не указано';
        return time;
    }
    
    static formatDateTime(date, time) {
        const dateStr = this.formatDate(date);
        const timeStr = this.formatTime(time);
        return `${dateStr} в ${timeStr}`;
    }
    
    static isToday(date) {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    }
    
    static isUpcoming(date) {
        if (!date) return false;
        return new Date(date) > new Date();
    }
    
    static getTimeUntil(date) {
        if (!date) return null;
        
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        
        if (diff <= 0) return null;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} дн. ${hours} ч.`;
        } else if (hours > 0) {
            return `${hours} ч. ${minutes} мин.`;
        } else {
            return `${minutes} мин.`;
        }
    }
}

// Утилиты для работы с позициями
class PositionUtils {
    static getPositionEmoji(position) {
        switch (position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏁';
        }
    }
    
    static getPositionClass(position) {
        switch (position) {
            case 1: return 'position-1';
            case 2: return 'position-2';
            case 3: return 'position-3';
            default: return '';
        }
    }
    
    static formatPoints(points) {
        return points.toLocaleString('ru-RU');
    }
}

// Утилиты для работы с поиском
class SearchUtils {
    static highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Утилиты для работы с модальными окнами
class ModalUtils {
    static showModal(title, content, options = {}) {
        const modal = document.getElementById('modal');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = content;
        
        if (options.size) {
            modal.querySelector('.modal-content').style.maxWidth = options.size;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Фокус на кнопку закрытия
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }
    
    static closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    static showConfirmModal(title, message, onConfirm, onCancel) {
        const content = `
            <div class="confirm-modal">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="ModalUtils.closeModal(); ${onCancel || ''}">
                        Отмена
                    </button>
                    <button class="btn btn-primary" onclick="ModalUtils.closeModal(); ${onConfirm}">
                        Подтвердить
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(title, content);
    }
}

// Утилиты для работы с загрузкой
class LoadingUtils {
    static showLoading(message = 'Загрузка...') {
        const overlay = document.getElementById('loading-overlay');
        const spinner = overlay.querySelector('.loading-spinner span');
        
        if (spinner) spinner.textContent = message;
        overlay.classList.add('active');
    }
    
    static hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('active');
    }
    
    static showLoadingInElement(element, message = 'Загрузка...') {
        element.innerHTML = `
            <div class="loading-inline">
                <i class="fas fa-spinner fa-spin"></i>
                <span>${message}</span>
            </div>
        `;
    }
}

// Утилиты для работы с ошибками
class ErrorUtils {
    static showError(message, duration = 5000) {
        Toast.show(message, 'error', duration);
    }
    
    static showSuccess(message, duration = 3000) {
        Toast.show(message, 'success', duration);
    }
    
    static showWarning(message, duration = 4000) {
        Toast.show(message, 'warning', duration);
    }
    
    static showInfo(message, duration = 3000) {
        Toast.show(message, 'info', duration);
    }
}

// Утилиты для работы с локальным хранилищем
class StorageUtils {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

// Добавляем стили для toast уведомлений
const toastStyles = `
<style>
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow-hover);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.toast.show {
    transform: translateX(0);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toast i {
    font-size: 1.2rem;
}

.toast-success i { color: #4caf50; }
.toast-error i { color: #f44336; }
.toast-warning i { color: #ff9800; }
.toast-info i { color: #2196f3; }

.loading-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: var(--text-muted);
}

.loading-inline i {
    color: var(--primary-color);
}

.confirm-modal {
    text-align: center;
}

.confirm-modal p {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.confirm-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
}

.btn-secondary {
    background: var(--surface-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--border-color);
}

mark {
    background: var(--accent-color);
    color: var(--text-primary);
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
}
</style>
`;

// Добавляем стили в head
document.head.insertAdjacentHTML('beforeend', toastStyles); 