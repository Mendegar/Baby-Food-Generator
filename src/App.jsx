import { useState, useEffect } from 'react'
import ProfileForm from './components/ProfileForm'
import ProfileManager from './components/ProfileManager'
import MenuGenerator from './components/MenuGenerator'
import MenuView from './components/MenuView'
import ShoppingList from './components/ShoppingList'
import ScientificReferences from './components/ScientificReferences'
import Welcome from './components/Welcome'
import SecurityScreen from './components/SecurityScreen'
import { ProfileManager as ProfileManagerUtil } from './utils/profileManager'
import { SecurityManager } from './utils/security'

function App() {
  const [currentScreen, setCurrentScreen] = useState('security-check')
  const [childProfile, setChildProfile] = useState(null)
  const [generatedMenu, setGeneratedMenu] = useState(null)
  const [shoppingList, setShoppingList] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Проверка аутентификации и загрузка профиля при старте
  useEffect(() => {
    const requiresAuth = SecurityManager.requiresAuthentication()
    
    if (!requiresAuth) {
      setIsAuthenticated(true)
      const currentProfile = ProfileManagerUtil.getCurrentProfile()
      if (currentProfile) {
        setChildProfile(currentProfile)
        setCurrentScreen('menu-generator')
      } else {
        setCurrentScreen('welcome')
      }
    } else {
      setCurrentScreen('security-check')
    }
  }, [])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    const currentProfile = ProfileManagerUtil.getCurrentProfile()
    if (currentProfile) {
      setChildProfile(currentProfile)
      setCurrentScreen('menu-generator')
    } else {
      setCurrentScreen('welcome')
    }
  }

  const saveProfile = (profile) => {
    const savedProfile = ProfileManagerUtil.saveProfile(profile)
    setChildProfile(savedProfile)
    setCurrentScreen('menu-generator')
  }

  const handleProfileSelect = (profile) => {
    setChildProfile(profile)
    if (profile) {
      setCurrentScreen('menu-generator')
    } else {
      setCurrentScreen('welcome')
    }
  }

  const handleMenuGenerated = (menu) => {
    setGeneratedMenu(menu)
    setCurrentScreen('menu-view')
    
    // Сохранение меню
    const menuId = Date.now().toString()
    localStorage.setItem(`bfg_menu_${menuId}`, JSON.stringify({
      menu,
      profile: childProfile,
      generatedAt: new Date().toISOString()
    }))
  }

  const handleShoppingListGenerated = (items) => {
    setShoppingList(items)
    setCurrentScreen('shopping-list')
  }

  const resetProfile = () => {
    setChildProfile(null)
    setGeneratedMenu(null)
    setShoppingList([])
    setCurrentScreen('welcome')
  }

  // Показываем экран безопасности, если не аутентифицированы
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="header">
          <div className="container">
            <h1>Baby Food Generator</h1>
            <p>Персонализированные меню прикорма для детей 6-12 месяцев</p>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            <SecurityScreen 
              onAuthenticated={handleAuthenticated}
              onSetupComplete={() => {}}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Baby Food Generator</h1>
          <p>Персонализированные меню прикорма для детей 6-12 месяцев</p>
        </div>
      </header>

      <div className="navigation">
        <div className="container">
          <div className="nav-buttons">
            <button 
              className={`nav-button ${currentScreen === 'welcome' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('welcome')}
            >
              О приложении
            </button>
            
            <button 
              className={`nav-button ${currentScreen === 'profiles' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('profiles')}
            >
              Мои профили
            </button>
            
            {childProfile && (
              <>
                <button 
                  className={`nav-button ${currentScreen === 'profile' ? 'active' : ''}`}
                  onClick={() => setCurrentScreen('profile')}
                >
                  Редактировать профиль
                </button>
                <button 
                  className={`nav-button ${currentScreen === 'menu-generator' ? 'active' : ''}`}
                  onClick={() => setCurrentScreen('menu-generator')}
                >
                  Генерация меню
                </button>
                {generatedMenu && (
                  <button 
                    className={`nav-button ${currentScreen === 'menu-view' ? 'active' : ''}`}
                    onClick={() => setCurrentScreen('menu-view')}
                  >
                    Результат
                  </button>
                )}
                {shoppingList.length > 0 && (
                  <button 
                    className={`nav-button ${currentScreen === 'shopping-list' ? 'active' : ''}`}
                    onClick={() => setCurrentScreen('shopping-list')}
                  >
                    Список покупок
                  </button>
                )}
              </>
            )}
            
            <button 
              className={`nav-button ${currentScreen === 'references' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('references')}
            >
              Научные источники
            </button>
            
            {SecurityManager.hasPinCode() && (
              <button 
                className="nav-button"
                onClick={() => {
                  if (window.confirm('Выйти из приложения? Потребуется повторный ввод PIN-кода.')) {
                    SecurityManager.endSession()
                    setIsAuthenticated(false)
                    setChildProfile(null)
                    setGeneratedMenu(null)
                    setShoppingList([])
                    setCurrentScreen('security-check')
                  }
                }}
                style={{ marginLeft: 'auto', background: 'var(--warning-color)' }}
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="container">
          {currentScreen === 'welcome' && (
            <Welcome 
              onCreateProfile={() => setCurrentScreen('profile')}
              onLoadProfile={() => {
                if (childProfile) {
                  setCurrentScreen('menu-generator')
                } else {
                  setCurrentScreen('profile')
                }
              }}
              onNavigateToProfiles={() => setCurrentScreen('profiles')}
              hasProfile={!!childProfile}
            />
          )}

          {currentScreen === 'profiles' && (
            <ProfileManager 
              onProfileSelect={handleProfileSelect}
              onCreateNew={() => setCurrentScreen('profile')}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileForm 
              initialProfile={childProfile}
              onSave={saveProfile}
              onReset={resetProfile}
            />
          )}

          {currentScreen === 'menu-generator' && childProfile && (
            <MenuGenerator 
              childProfile={childProfile}
              onMenuGenerated={handleMenuGenerated}
            />
          )}

          {currentScreen === 'menu-view' && generatedMenu && (
            <MenuView 
              menu={generatedMenu}
              childProfile={childProfile}
              onGenerateShoppingList={handleShoppingListGenerated}
              onGenerateNew={() => setCurrentScreen('menu-generator')}
            />
          )}

          {currentScreen === 'shopping-list' && (
            <ShoppingList 
              items={shoppingList}
              onBack={() => setCurrentScreen('menu-view')}
            />
          )}

          {currentScreen === 'references' && (
            <ScientificReferences />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
