import { useState, useEffect } from 'react'
import { ProfileManager } from '../utils/profileManager'
import { SecurityManager } from '../utils/security'

function ProfileManagerComponent({ onProfileSelect, onCreateNew }) {
  const [profiles, setProfiles] = useState({})
  const [currentProfileId, setCurrentProfileId] = useState(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importData, setImportData] = useState(null)

  useEffect(() => {
    loadProfiles()
    
    // Миграция старых данных при первом запуске
    const migrated = ProfileManager.migrateOldProfile()
    if (migrated) {
      loadProfiles()
    }
  }, [])

  const loadProfiles = () => {
    const allProfiles = ProfileManager.getAllProfiles()
    const currentProfile = ProfileManager.getCurrentProfile()
    
    setProfiles(allProfiles)
    setCurrentProfileId(currentProfile?.id || null)
  }

  const handleProfileSelect = (profileId) => {
    const profile = ProfileManager.setCurrentProfile(profileId)
    if (profile) {
      setCurrentProfileId(profileId)
      onProfileSelect(profile)
    }
  }

  const handleDeleteProfile = (profileId, profileName) => {
    if (window.confirm(`Удалить профиль "${profileName}"? Это действие нельзя отменить.`)) {
      ProfileManager.deleteProfile(profileId)
      loadProfiles()
      
      // Если удалили текущий профиль
      if (profileId === currentProfileId) {
        setCurrentProfileId(null)
        onProfileSelect(null)
      }
    }
  }

  const handleExportProfiles = () => {
    ProfileManager.exportProfiles()
  }

  const handleImportFile = async (file) => {
    try {
      const result = await ProfileManager.importProfiles(file)
      setImportData(result)
      setImportFile(file)
      setShowImportDialog(true)
    } catch (error) {
      alert('Ошибка импорта: ' + error.message)
    }
  }

  const handleConfirmImport = (overwriteConflicts = false) => {
    if (importData) {
      ProfileManager.applyImport(importData.importedProfiles, overwriteConflicts)
      loadProfiles()
      setShowImportDialog(false)
      setImportData(null)
      setImportFile(null)
      alert('Профили успешно импортированы!')
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                  (today.getMonth() - birthDate.getMonth())
    return Math.max(0, months)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const profilesList = Object.values(profiles)
  const stats = ProfileManager.getProfilesStats()

  return (
    <div className="card">
      <h2>Управление профилями</h2>
      
      {profilesList.length === 0 ? (
        <div className="empty-state">
          <h3>Нет сохранённых профилей</h3>
          <p>Создайте первый профиль ребёнка или импортируйте существующие данные.</p>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            background: 'var(--surface)', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Статистика</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div>Всего профилей: <strong>{stats.total}</strong></div>
              <div>6-7 мес: <strong>{stats.byAge['6-7']}</strong></div>
              <div>8-9 мес: <strong>{stats.byAge['8-9']}</strong></div>
              <div>10-12 мес: <strong>{stats.byAge['10-12']}</strong></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3>Сохранённые профили</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {profilesList.map(profile => (
                <div 
                  key={profile.id} 
                  style={{ 
                    padding: '1rem',
                    border: `2px solid ${profile.id === currentProfileId ? 'var(--primary-color)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    background: profile.id === currentProfileId ? 'var(--surface)' : 'var(--background)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                        {profile.name || 'Без имени'}
                        {profile.id === currentProfileId && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.75rem', 
                            background: 'var(--primary-color)', 
                            color: 'white', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '1rem' 
                          }}>
                            Активный
                          </span>
                        )}
                      </h4>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Возраст: {calculateAge(profile.dateOfBirth)} мес. • 
                        Создан: {formatDate(profile.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {profile.id !== currentProfileId && (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          onClick={() => handleProfileSelect(profile.id)}
                        >
                          Выбрать
                        </button>
                      )}
                      <button 
                        className="btn btn-warning"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {profile.excludeAllergens?.length > 0 && (
                      <span>Исключения: {profile.excludeAllergens.length} • </span>
                    )}
                    Продуктов введено: {profile.introducedProducts?.length || 0}
                    {profile.dietaryPreferences?.vegetarian && <span> • Вегетарианство</span>}
                    {profile.dietaryPreferences?.vegan && <span> • Веганство</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="btn-group">
        <button className="btn" onClick={onCreateNew}>
          Создать новый профиль
        </button>
        
        {profilesList.length > 0 && (
          <button className="btn btn-secondary" onClick={handleExportProfiles}>
            Экспорт профилей
          </button>
        )}
        
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Импорт профилей
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) handleImportFile(file)
            }}
          />
        </label>
        
        {profilesList.length > 0 && (
          <button 
            className="btn btn-warning" 
            onClick={() => {
              if (window.confirm('Удалить ВСЕ профили и данные? Это действие нельзя отменить!')) {
                ProfileManager.clearAllData()
                loadProfiles()
                setCurrentProfileId(null)
                onProfileSelect(null)
              }
            }}
          >
            Очистить всё
          </button>
        )}
      </div>

      {/* Диалог импорта */}
      {showImportDialog && importData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--background)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Импорт профилей</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p>Найдено профилей для импорта: <strong>{importData.imported.length}</strong></p>
              
              {importData.conflicts.length > 0 && (
                <div className="warning">
                  <strong>Конфликты:</strong> {importData.conflicts.length} профилей уже существуют.
                  Выберите действие ниже.
                </div>
              )}
            </div>

            {importData.imported.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Новые профили:</h4>
                <ul style={{ fontSize: '0.9rem' }}>
                  {importData.imported.map(profile => (
                    <li key={profile.id}>
                      {profile.name || 'Без имени'} ({calculateAge(profile.dateOfBirth)} мес.)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importData.conflicts.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Конфликтующие профили:</h4>
                <ul style={{ fontSize: '0.9rem' }}>
                  {importData.conflicts.map(conflict => (
                    <li key={conflict.id}>
                      {conflict.imported.name || 'Без имени'} (будет заменён)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="btn-group">
              <button 
                className="btn btn-success" 
                onClick={() => handleConfirmImport(false)}
              >
                Импортировать новые
              </button>
              
              {importData.conflicts.length > 0 && (
                <button 
                  className="btn btn-warning" 
                  onClick={() => handleConfirmImport(true)}
                >
                  Заменить всё
                </button>
              )}
              
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowImportDialog(false)
                  setImportData(null)
                  setImportFile(null)
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Управление данными и безопасностью</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Статус защиты:</strong> {SecurityManager.hasPinCode() ? (
              <span style={{ color: 'var(--success-color)' }}>🔒 Защищено PIN-кодом</span>
            ) : (
              <span style={{ color: 'var(--warning-color)' }}>🔓 Не защищено</span>
            )}
          </div>
          
          <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
            <li><strong>Экспорт:</strong> Сохраните все профили в JSON-файл для резервного копирования</li>
            <li><strong>Импорт:</strong> Восстановите профили из файла на другом устройстве</li>
            <li><strong>Локальное хранение:</strong> Данные сохраняются только в вашем браузере</li>
            <li><strong>PIN-защита:</strong> {SecurityManager.hasPinCode() ? 'Активна' : 'Рекомендуется установить в настройках'}</li>
            <li><strong>Приватность:</strong> Никакие данные не передаются на сервер</li>
          </ul>
        </div>
    </div>
  )
}

export default ProfileManagerComponent
