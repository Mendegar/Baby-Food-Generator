// Утилиты для управления профилями детей
export class ProfileManager {
  static STORAGE_KEY = 'bfg_profiles'
  static CURRENT_PROFILE_KEY = 'bfg_current_profile_id'

  // Получить все профили
  static getAllProfiles() {
    try {
      const profiles = localStorage.getItem(this.STORAGE_KEY)
      return profiles ? JSON.parse(profiles) : {}
    } catch (error) {
      console.error('Ошибка загрузки профилей:', error)
      return {}
    }
  }

  // Получить текущий активный профиль
  static getCurrentProfile() {
    const currentId = localStorage.getItem(this.CURRENT_PROFILE_KEY)
    if (!currentId) return null

    const profiles = this.getAllProfiles()
    return profiles[currentId] || null
  }

  // Сохранить профиль
  static saveProfile(profile) {
    const profiles = this.getAllProfiles()
    
    // Генерируем ID если его нет
    if (!profile.id) {
      profile.id = this.generateProfileId(profile)
    }

    // Добавляем метаданные
    profile.createdAt = profile.createdAt || new Date().toISOString()
    profile.updatedAt = new Date().toISOString()

    profiles[profile.id] = profile
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    localStorage.setItem(this.CURRENT_PROFILE_KEY, profile.id)

    return profile
  }

  // Удалить профиль
  static deleteProfile(profileId) {
    const profiles = this.getAllProfiles()
    delete profiles[profileId]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))

    // Если удаляем текущий профиль, сбрасываем его
    const currentId = localStorage.getItem(this.CURRENT_PROFILE_KEY)
    if (currentId === profileId) {
      localStorage.removeItem(this.CURRENT_PROFILE_KEY)
    }
  }

  // Установить активный профиль
  static setCurrentProfile(profileId) {
    const profiles = this.getAllProfiles()
    if (profiles[profileId]) {
      localStorage.setItem(this.CURRENT_PROFILE_KEY, profileId)
      return profiles[profileId]
    }
    return null
  }

  // Генерация читаемого ID профиля
  static generateProfileId(profile) {
    const name = profile.name || 'Ребёнок'
    const birthDate = profile.dateOfBirth || new Date().toISOString().split('T')[0]
    const timestamp = Date.now()
    
    // Создаём читаемый ID: имя_дата_рождения_timestamp
    const cleanName = name.toLowerCase().replace(/[^а-яёa-z0-9]/g, '')
    const cleanDate = birthDate.replace(/-/g, '')
    
    return `${cleanName}_${cleanDate}_${timestamp}`
  }

  // Экспорт профилей в JSON
  static exportProfiles() {
    const profiles = this.getAllProfiles()
    const exportData = {
      profiles,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `baby-food-profiles-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Импорт профилей из JSON
  static async importProfiles(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          
          if (!importData.profiles) {
            throw new Error('Неверный формат файла')
          }

          const currentProfiles = this.getAllProfiles()
          const importedProfiles = importData.profiles
          const conflicts = []
          const imported = []

          // Проверяем конфликты
          Object.keys(importedProfiles).forEach(id => {
            if (currentProfiles[id]) {
              conflicts.push({
                id,
                existing: currentProfiles[id],
                imported: importedProfiles[id]
              })
            } else {
              imported.push(importedProfiles[id])
            }
          })

          resolve({ conflicts, imported, importedProfiles })
        } catch (error) {
          reject(new Error('Ошибка чтения файла: ' + error.message))
        }
      }

      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsText(file)
    })
  }

  // Применить импорт профилей
  static applyImport(importedProfiles, overwriteConflicts = false) {
    const currentProfiles = this.getAllProfiles()
    
    Object.keys(importedProfiles).forEach(id => {
      if (!currentProfiles[id] || overwriteConflicts) {
        currentProfiles[id] = importedProfiles[id]
      }
    })

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentProfiles))
  }

  // Получить статистику профилей
  static getProfilesStats() {
    const profiles = this.getAllProfiles()
    const profileList = Object.values(profiles)
    
    return {
      total: profileList.length,
      byAge: this.groupProfilesByAge(profileList),
      oldest: this.getOldestProfile(profileList),
      newest: this.getNewestProfile(profileList)
    }
  }

  static groupProfilesByAge(profiles) {
    const groups = {
      '6-7': 0,
      '8-9': 0,
      '10-12': 0,
      'older': 0
    }

    profiles.forEach(profile => {
      const age = this.calculateAge(profile.dateOfBirth)
      if (age <= 7) groups['6-7']++
      else if (age <= 9) groups['8-9']++
      else if (age <= 12) groups['10-12']++
      else groups['older']++
    })

    return groups
  }

  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                  (today.getMonth() - birthDate.getMonth())
    return Math.max(0, months)
  }

  static getOldestProfile(profiles) {
    if (profiles.length === 0) return null
    return profiles.reduce((oldest, profile) => {
      return new Date(profile.createdAt || 0) < new Date(oldest.createdAt || 0) ? profile : oldest
    })
  }

  static getNewestProfile(profiles) {
    if (profiles.length === 0) return null
    return profiles.reduce((newest, profile) => {
      return new Date(profile.createdAt || 0) > new Date(newest.createdAt || 0) ? profile : newest
    })
  }

  // Миграция старых данных
  static migrateOldProfile() {
    const oldProfile = localStorage.getItem('bfg_child_profile')
    if (oldProfile) {
      try {
        const profile = JSON.parse(oldProfile)
        this.saveProfile(profile)
        localStorage.removeItem('bfg_child_profile')
        return true
      } catch (error) {
        console.error('Ошибка миграции старого профиля:', error)
      }
    }
    return false
  }

  // Очистка всех данных
  static clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_PROFILE_KEY)
    
    // Очищаем старые меню
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('bfg_menu_')) {
        localStorage.removeItem(key)
      }
    })
  }
}
