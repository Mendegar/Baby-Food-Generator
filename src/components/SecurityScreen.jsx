import { useState, useEffect } from 'react'
import { SecurityManager } from '../utils/security'

function SecurityScreen({ onAuthenticated, onSetupComplete }) {
  const [mode, setMode] = useState('check') // check, setup, login, change
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [oldPin, setOldPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [securityStatus, setSecurityStatus] = useState(null)

  useEffect(() => {
    checkSecurityStatus()
    
    // Настройка управления сессиями
    SecurityManager.setupSessionManagement()
    
    // Слушатель истечения сессии
    const handleSessionExpired = () => {
      setMode('login')
      setError('Сессия истекла. Введите PIN-код повторно.')
    }
    
    window.addEventListener('session-expired', handleSessionExpired)
    return () => window.removeEventListener('session-expired', handleSessionExpired)
  }, [])

  const checkSecurityStatus = () => {
    const status = SecurityManager.getSecurityStatus()
    setSecurityStatus(status)

    if (!status.hasPin) {
      setMode('setup')
    } else if (status.requiresAuth) {
      setMode('login')
    } else {
      onAuthenticated()
    }
  }

  const handleSetupPin = async () => {
    if (pin !== confirmPin) {
      setError('PIN-коды не совпадают')
      return
    }

    if (pin.length < 4) {
      setError('PIN-код должен содержать минимум 4 символа')
      return
    }

    setLoading(true)
    try {
      await SecurityManager.setPinCode(pin)
      setPin('')
      setConfirmPin('')
      setError('')
      onSetupComplete()
      onAuthenticated()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!pin) {
      setError('Введите PIN-код')
      return
    }

    setLoading(true)
    try {
      await SecurityManager.verifyPin(pin)
      setPin('')
      setError('')
      onAuthenticated()
    } catch (error) {
      setError(error.message)
      setPin('')
      // Обновляем статус для отображения блокировки
      checkSecurityStatus()
    } finally {
      setLoading(false)
    }
  }

  const handleChangePin = async () => {
    if (!oldPin) {
      setError('Введите текущий PIN-код')
      return
    }

    if (pin !== confirmPin) {
      setError('Новые PIN-коды не совпадают')
      return
    }

    if (pin.length < 4) {
      setError('Новый PIN-код должен содержать минимум 4 символа')
      return
    }

    setLoading(true)
    try {
      await SecurityManager.changePinCode(oldPin, pin)
      setOldPin('')
      setPin('')
      setConfirmPin('')
      setError('')
      setMode('login')
      alert('PIN-код успешно изменён')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetSecurity = () => {
    if (window.confirm(
      'Вы действительно хотите сбросить систему безопасности?\n\n' +
      'Это удалит PIN-код и откроет доступ ко всем профилям.\n' +
      'Данное действие нельзя отменить.'
    )) {
      SecurityManager.resetSecurity()
      checkSecurityStatus()
    }
  }

  const formatTimeRemaining = (lockedUntil) => {
    const remaining = Math.ceil((new Date(lockedUntil) - new Date()) / 1000 / 60)
    return remaining > 0 ? remaining : 0
  }

  if (mode === 'setup') {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2>Настройка защиты</h2>
        
        <div className="warning">
          <strong>Рекомендуется установить PIN-код</strong>
          Это защитит личные данные ваших детей от посторонних лиц, 
          которые могут получить доступ к вашему устройству.
        </div>

        <div className="form-group">
          <label className="form-label">
            Создайте PIN-код (минимум 4 символа):
            <input
              type="password"
              className="form-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Введите PIN-код"
              maxLength={20}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">
            Подтвердите PIN-код:
            <input
              type="password"
              className="form-input"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Повторите PIN-код"
              maxLength={20}
            />
          </label>
        </div>

        {error && (
          <div className="warning">
            {error}
          </div>
        )}

        <div className="btn-group">
          <button 
            className="btn"
            onClick={handleSetupPin}
            disabled={loading || !pin || !confirmPin}
          >
            {loading ? 'Настройка...' : 'Установить PIN-код'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              onSetupComplete()
              onAuthenticated()
            }}
          >
            Пропустить (не рекомендуется)
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem'
        }}>
          <strong>Важно:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
            <li>Запомните PIN-код - восстановление невозможно</li>
            <li>PIN-код защищает доступ только в этом браузере</li>
            <li>При потере PIN-кода потребуется полный сброс данных</li>
          </ul>
        </div>
      </div>
    )
  }

  if (mode === 'login') {
    const isLocked = securityStatus?.isLocked
    const timeRemaining = isLocked ? formatTimeRemaining(securityStatus.lockedUntil) : 0

    return (
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2>Вход в приложение</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: isLocked ? 'var(--error-color)' : 'var(--primary-color)'
          }}>
            {isLocked ? '🔒' : '🔐'}
          </div>
          <p>Введите PIN-код для доступа к профилям</p>
        </div>

        {isLocked ? (
          <div className="warning">
            <strong>Доступ заблокирован</strong>
            Слишком много неверных попыток. 
            Попробуйте через {timeRemaining} мин.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">
                PIN-код:
                <input
                  type="password"
                  className="form-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Введите PIN-код"
                  maxLength={20}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin()
                    }
                  }}
                />
              </label>
            </div>

            {error && (
              <div className="warning">
                {error}
              </div>
            )}

            <div className="btn-group">
              <button 
                className="btn"
                onClick={handleLogin}
                disabled={loading || !pin}
              >
                {loading ? 'Проверка...' : 'Войти'}
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            onClick={() => setMode('change')}
            disabled={isLocked}
          >
            Изменить PIN-код
          </button>
          
          <button 
            className="btn btn-warning"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
            onClick={handleResetSecurity}
          >
            Сбросить защиту
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'change') {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2>Изменение PIN-кода</h2>
        
        <div className="form-group">
          <label className="form-label">
            Текущий PIN-код:
            <input
              type="password"
              className="form-input"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="Введите текущий PIN-код"
              maxLength={20}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">
            Новый PIN-код:
            <input
              type="password"
              className="form-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Введите новый PIN-код"
              maxLength={20}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">
            Подтвердите новый PIN-код:
            <input
              type="password"
              className="form-input"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Повторите новый PIN-код"
              maxLength={20}
            />
          </label>
        </div>

        {error && (
          <div className="warning">
            {error}
          </div>
        )}

        <div className="btn-group">
          <button 
            className="btn"
            onClick={handleChangePin}
            disabled={loading || !oldPin || !pin || !confirmPin}
          >
            {loading ? 'Изменение...' : 'Изменить PIN-код'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => setMode('login')}
          >
            Отмена
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default SecurityScreen
