// Утилиты для защиты данных профилей
export class SecurityManager {
  static SECURITY_KEY = 'bfg_security'
  static SESSION_KEY = 'bfg_session'
  static SESSION_DURATION = 30 * 60 * 1000 // 30 минут

  // Проверка, установлен ли PIN-код
  static hasPinCode() {
    const security = this.getSecurityData()
    return !!(security && security.pinHash)
  }

  // Установка PIN-кода
  static async setPinCode(pin) {
    if (!pin || pin.length < 4) {
      throw new Error('PIN-код должен содержать минимум 4 символа')
    }

    const pinHash = await this.hashPin(pin)
    const security = {
      pinHash,
      createdAt: new Date().toISOString(),
      attempts: 0,
      lockedUntil: null
    }

    localStorage.setItem(this.SECURITY_KEY, JSON.stringify(security))
    this.createSession()
  }

  // Проверка PIN-кода
  static async verifyPin(pin) {
    const security = this.getSecurityData()
    if (!security) return false

    // Проверка блокировки
    if (security.lockedUntil && new Date(security.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(security.lockedUntil) - new Date()) / 1000 / 60)
      throw new Error(`Доступ заблокирован на ${remainingTime} мин. из-за многократных неверных попыток`)
    }

    const pinHash = await this.hashPin(pin)
    const isValid = pinHash === security.pinHash

    if (isValid) {
      // Сброс попыток при успешном входе
      security.attempts = 0
      security.lockedUntil = null
      localStorage.setItem(this.SECURITY_KEY, JSON.stringify(security))
      this.createSession()
      return true
    } else {
      // Увеличение счётчика неудачных попыток
      security.attempts = (security.attempts || 0) + 1
      
      // Блокировка после 5 неудачных попыток
      if (security.attempts >= 5) {
        security.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 минут
        localStorage.setItem(this.SECURITY_KEY, JSON.stringify(security))
        throw new Error('Слишком много неверных попыток. Доступ заблокирован на 15 минут.')
      } else {
        localStorage.setItem(this.SECURITY_KEY, JSON.stringify(security))
        throw new Error(`Неверный PIN-код. Осталось попыток: ${5 - security.attempts}`)
      }
    }
  }

  // Проверка активной сессии
  static hasValidSession() {
    const session = localStorage.getItem(this.SESSION_KEY)
    if (!session) return false

    try {
      const sessionData = JSON.parse(session)
      const now = new Date().getTime()
      return sessionData.expiresAt > now
    } catch {
      return false
    }
  }

  // Создание сессии
  static createSession() {
    const session = {
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + this.SESSION_DURATION
    }
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
  }

  // Продление сессии
  static extendSession() {
    if (this.hasValidSession()) {
      this.createSession()
    }
  }

  // Завершение сессии
  static endSession() {
    localStorage.removeItem(this.SESSION_KEY)
  }

  // Смена PIN-кода
  static async changePinCode(oldPin, newPin) {
    const isValid = await this.verifyPin(oldPin)
    if (!isValid) {
      throw new Error('Неверный текущий PIN-код')
    }
    
    await this.setPinCode(newPin)
  }

  // Сброс всей системы безопасности (с подтверждением)
  static resetSecurity() {
    localStorage.removeItem(this.SECURITY_KEY)
    localStorage.removeItem(this.SESSION_KEY)
  }

  // Получение данных безопасности
  static getSecurityData() {
    try {
      const data = localStorage.getItem(this.SECURITY_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  // Хеширование PIN-кода (простое, но достаточное для локального хранения)
  static async hashPin(pin) {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin + 'bfg_salt_2024')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Проверка, требуется ли аутентификация
  static requiresAuthentication() {
    return this.hasPinCode() && !this.hasValidSession()
  }

  // Получение статуса безопасности
  static getSecurityStatus() {
    const security = this.getSecurityData()
    const hasPin = this.hasPinCode()
    const hasSession = this.hasValidSession()
    const isLocked = security?.lockedUntil && new Date(security.lockedUntil) > new Date()

    return {
      hasPin,
      hasSession,
      isLocked,
      attempts: security?.attempts || 0,
      lockedUntil: security?.lockedUntil,
      requiresAuth: hasPin && !hasSession
    }
  }

  // Автоматическое завершение сессии при закрытии вкладки
  static setupSessionManagement() {
    // Продление сессии при активности
    const extendOnActivity = () => {
      if (this.hasValidSession()) {
        this.extendSession()
      }
    }

    // События активности пользователя
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, extendOnActivity, { passive: true })
    })

    // Завершение сессии при закрытии вкладки
    window.addEventListener('beforeunload', () => {
      // Не завершаем сессию автоматически - пусть истекает по времени
      // Это позволяет пользователю вернуться к приложению в течение 30 минут
    })

    // Проверка сессии каждую минуту
    setInterval(() => {
      if (!this.hasValidSession() && this.hasPinCode()) {
        // Можно отправить событие для перенаправления на экран входа
        window.dispatchEvent(new CustomEvent('session-expired'))
      }
    }, 60000)
  }
}
