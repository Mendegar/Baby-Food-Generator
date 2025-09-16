import { useState } from 'react'
import { generateDailyMenu, generateWeeklyMenu, calculateAge } from '../utils/menuLogic'

function MenuGenerator({ childProfile, onMenuGenerated }) {
  const [settings, setSettings] = useState({
    period: 'day',
    startDate: new Date().toISOString().split('T')[0],
    avoidNewProducts: false,
    strictRotation: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const ageMonths = calculateAge(childProfile.dateOfBirth)

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')

    try {
      let menu
      
      if (settings.period === 'day') {
        menu = generateDailyMenu(childProfile, settings)
      } else {
        menu = generateWeeklyMenu(childProfile, settings)
      }
      
      onMenuGenerated(menu)
    } catch (err) {
      console.error('Ошибка генерации меню:', err)
      setError(err.message || 'Произошла ошибка при генерации меню')
    } finally {
      setIsGenerating(false)
    }
  }

  const introducedCount = childProfile.introducedProducts?.length || 0
  const hasAllergens = childProfile.excludeAllergens?.length > 0

  return (
    <div className="card">
      <h2>Генерация меню</h2>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Информация о профиле:</h3>
        <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
          <strong>{childProfile.name || 'Ребёнок'}:</strong> {ageMonths} {ageMonths === 1 ? 'месяц' : ageMonths < 5 ? 'месяца' : 'месяцев'}
        </p>
        <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
          <strong>Введённых продуктов:</strong> {introducedCount}
        </p>
        {hasAllergens && (
          <p style={{ margin: '0.25rem 0', color: '#e74c3c' }}>
            <strong>Исключения:</strong> {childProfile.excludeAllergens.length} аллерген(ов)
          </p>
        )}
        {childProfile.dietaryPreferences.vegetarian && (
          <p style={{ margin: '0.25rem 0', color: '#27ae60' }}>
            <strong>Вегетарианское питание</strong>
          </p>
        )}
        {childProfile.dietaryPreferences.vegan && (
          <p style={{ margin: '0.25rem 0', color: '#27ae60' }}>
            <strong>Веганское питание</strong>
          </p>
        )}
      </div>

      {ageMonths < 6 && (
        <div className="warning">
          <strong>Внимание!</strong> Возраст ребёнка менее 6 месяцев. 
          ВОЗ рекомендует исключительно грудное вскармливание до 6 месяцев.
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Период генерации:</label>
        <select
          className="form-select"
          value={settings.period}
          onChange={(e) => handleSettingChange('period', e.target.value)}
        >
          <option value="day">На день</option>
          <option value="week">На неделю</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Дата начала:</label>
        <input
          type="date"
          className="form-input"
          value={settings.startDate}
          onChange={(e) => handleSettingChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="avoidNewProducts"
              checked={settings.avoidNewProducts}
              onChange={(e) => handleSettingChange('avoidNewProducts', e.target.checked)}
            />
            <label htmlFor="avoidNewProducts">
              Не вводить новых продуктов
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                Использовать только уже введённые продукты
              </div>
            </label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="strictRotation"
              checked={settings.strictRotation}
              onChange={(e) => handleSettingChange('strictRotation', e.target.checked)}
            />
            <label htmlFor="strictRotation">
              Строгая ротация продуктов
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                Не повторять основные ингредиенты в течение дня
              </div>
            </label>
          </div>
        </div>
      </div>

      {settings.avoidNewProducts && introducedCount < 3 && (
        <div className="warning">
          <strong>Предупреждение:</strong> Введено мало продуктов ({introducedCount}). 
          Это может ограничить разнообразие меню. Рекомендуется постепенно вводить новые продукты.
        </div>
      )}

      {error && (
        <div className="warning">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      <div className="btn-group">
        <button 
          className="btn" 
          onClick={handleGenerate}
          disabled={isGenerating || ageMonths < 6}
        >
          {isGenerating ? 'Генерирую...' : `Сгенерировать меню на ${settings.period === 'day' ? 'день' : 'неделю'}`}
        </button>
      </div>

      {ageMonths >= 6 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px', fontSize: '0.9rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Советы по использованию</h4>
          <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
            <li>Начинайте с простых однокомпонентных блюд</li>
            <li>Вводите новые продукты постепенно, по одному в 3-5 дней</li>
            <li>Следите за реакцией ребёнка на новые продукты</li>
            <li>Консистенция блюд автоматически адаптируется к возрасту</li>
            <li>При аллергических реакциях немедленно исключите продукт и обратитесь к врачу</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default MenuGenerator
