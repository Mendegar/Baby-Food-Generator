import { useState, useEffect } from 'react'
import productsData from '../data/products.json'

const ALLERGENS = [
  { id: 'milk', name: 'Молоко и молочные продукты' },
  { id: 'egg', name: 'Яйца' },
  { id: 'peanut', name: 'Арахис' },
  { id: 'soy', name: 'Соя' },
  { id: 'wheat', name: 'Пшеница/глютен' },
  { id: 'fish', name: 'Рыба' },
  { id: 'shellfish', name: 'Моллюски/ракообразные' },
  { id: 'tree_nut', name: 'Орехи деревьев' },
  { id: 'sesame', name: 'Кунжут' },
  { id: 'berry', name: 'Ягоды' }
]

function ProfileForm({ initialProfile, onSave, onReset }) {
  const [profile, setProfile] = useState({
    name: '',
    dateOfBirth: '',
    weight: '',
    introducedProducts: [],
    excludeAllergens: [],
    dietaryPreferences: {
      vegetarian: false,
      vegan: false
    }
  })

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])

  const calculateAge = (dob) => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                  (today.getMonth() - birthDate.getMonth())
    return Math.max(0, months)
  }

  const currentAge = calculateAge(profile.dateOfBirth)

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAllergenChange = (allergenId, checked) => {
    setProfile(prev => ({
      ...prev,
      excludeAllergens: checked 
        ? [...prev.excludeAllergens, allergenId]
        : prev.excludeAllergens.filter(id => id !== allergenId)
    }))
  }

  const handleProductChange = (productId, checked) => {
    setProfile(prev => ({
      ...prev,
      introducedProducts: checked 
        ? [...prev.introducedProducts, productId]
        : prev.introducedProducts.filter(id => id !== productId)
    }))
  }

  const handleDietaryPreferenceChange = (preference, checked) => {
    setProfile(prev => ({
      ...prev,
      dietaryPreferences: {
        ...prev.dietaryPreferences,
        [preference]: checked
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!profile.dateOfBirth) {
      alert('Пожалуйста, укажите дату рождения ребёнка')
      return
    }

    if (currentAge < 6) {
      alert('Прикорм рекомендуется вводить не ранее 6 месяцев. Обязательно проконсультируйтесь с педиатром.')
      return
    }

    if (currentAge > 12) {
      alert('Это приложение предназначено для детей до 12 месяцев. Для детей старше года рекомендуется консультация с педиатром.')
      return
    }

    onSave(profile)
  }

  // Фильтруем продукты по возрасту
  const availableProducts = productsData.products.filter(
    product => product.allowed_from_month <= currentAge
  )

  return (
    <div className="card">
      <h2>Профиль ребёнка</h2>
      
      {currentAge > 0 && currentAge < 6 && (
        <div className="warning">
          <strong>Внимание!</strong> Возраст ребёнка менее 6 месяцев. 
          ВОЗ рекомендует исключительно грудное вскармливание до 6 месяцев.
        </div>
      )}

      {profile.dietaryPreferences.vegan && (
        <div className="warning">
          <strong>Важно!</strong> Веганское питание для детей до года требует 
          особого внимания к витамину B12, железу, цинку и витамину D. 
          Обязательно проконсультируйтесь с педиатром.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Имя ребёнка (необязательно):
            <input
              type="text"
              className="form-input"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Например, Маша"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">
            Дата рождения (обязательно): *
            <input
              type="date"
              className="form-input"
              value={profile.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </label>
          {currentAge > 0 && (
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Возраст: {currentAge} {currentAge === 1 ? 'месяц' : currentAge < 5 ? 'месяца' : 'месяцев'}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Вес (кг, необязательно):
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-input"
              value={profile.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="Например, 8.5"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Исключить аллергены:</label>
          <div className="checkbox-group">
            {ALLERGENS.map(allergen => (
              <div key={allergen.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`allergen-${allergen.id}`}
                  checked={profile.excludeAllergens.includes(allergen.id)}
                  onChange={(e) => handleAllergenChange(allergen.id, e.target.checked)}
                />
                <label htmlFor={`allergen-${allergen.id}`}>{allergen.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Семейные предпочтения:</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="vegetarian"
                checked={profile.dietaryPreferences.vegetarian}
                onChange={(e) => handleDietaryPreferenceChange('vegetarian', e.target.checked)}
              />
              <label htmlFor="vegetarian">Вегетарианство</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="vegan"
                checked={profile.dietaryPreferences.vegan}
                onChange={(e) => handleDietaryPreferenceChange('vegan', e.target.checked)}
              />
              <label htmlFor="vegan">Веганство</label>
            </div>
          </div>
        </div>

        {currentAge >= 6 && (
          <div className="form-group">
            <label className="form-label">
              Уже введённые продукты (отметьте то, что ребёнок уже пробовал):
            </label>
            <div className="checkbox-group">
              {availableProducts.map(product => (
                <div key={product.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    checked={profile.introducedProducts.includes(product.id)}
                    onChange={(e) => handleProductChange(product.id, e.target.checked)}
                  />
                  <label htmlFor={`product-${product.id}`}>{product.name}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="btn-group">
          <button type="submit" className="btn">
            {initialProfile ? 'Обновить профиль' : 'Создать профиль'}
          </button>
          {initialProfile && (
            <button type="button" className="btn btn-warning" onClick={onReset}>
              Создать новый профиль
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
