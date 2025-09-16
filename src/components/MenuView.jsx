import { generateShoppingList } from '../utils/menuLogic'

function MenuView({ menu, childProfile, onGenerateShoppingList, onGenerateNew }) {
  const isWeeklyMenu = Array.isArray(menu)
  
  const handleGenerateShoppingList = () => {
    const shoppingList = generateShoppingList(menu)
    onGenerateShoppingList(shoppingList)
  }

  const handleSaveMenu = () => {
    const menuId = Date.now().toString()
    const menuData = {
      menu,
      profile: childProfile,
      generatedAt: new Date().toISOString(),
      type: isWeeklyMenu ? 'weekly' : 'daily'
    }
    
    localStorage.setItem(`bfg_menu_${menuId}`, JSON.stringify(menuData))
    alert('Меню сохранено!')
  }

  const renderNutritionInfo = (nutrition) => (
    <div className="nutrition-info">
      <strong>Питательная ценность:</strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div>Калории: <strong>{nutrition.kcal.toFixed(0)}</strong> ккал</div>
        <div>Белок: <strong>{nutrition.protein_g.toFixed(1)}</strong> г</div>
        <div>Железо: <strong>{nutrition.iron_mg.toFixed(1)}</strong> мг</div>
        <div>Цинк: <strong>{nutrition.zinc_mg.toFixed(1)}</strong> мг</div>
        <div>Кальций: <strong>{nutrition.calcium_mg.toFixed(0)}</strong> мг</div>
        <div>Витамин D: <strong>{nutrition.vitaminD_µg.toFixed(1)}</strong> мкг</div>
      </div>
    </div>
  )

  const renderMeal = (meal, dayIndex = null) => (
    <div key={`${dayIndex}-${meal.timeLabel}`} className="meal-card">
      <div className="meal-title">{meal.timeLabel}</div>
      <div className="meal-recipe">
        <strong>{meal.recipe.title}</strong>
      </div>
      
      <div className="meal-notes">
        {meal.recipe.notes}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Ингредиенты:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
          {meal.ingredients.map((ingredient, idx) => (
            <li key={idx}>
              {ingredient.productName}: {ingredient.grams}г
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Приготовление:</strong>
        <ol className="steps-list">
          {meal.recipe.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {renderNutritionInfo(meal.nutrition)}
    </div>
  )

  const renderDailyMenu = (dayMenu, dayIndex = null) => (
    <div key={dayIndex} style={{ marginBottom: '2rem' }}>
      {isWeeklyMenu && (
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          padding: '0.5rem 1rem', 
          background: '#6ec1e4', 
          color: 'white', 
          borderRadius: '8px',
          textTransform: 'capitalize'
        }}>
          {dayMenu.dayName} ({new Date(dayMenu.date).toLocaleDateString('ru-RU')})
        </h3>
      )}
      
      {dayMenu.error ? (
        <div className="warning">
          <strong>Ошибка:</strong> {dayMenu.error}
        </div>
      ) : (
        <>
          {dayMenu.meals.map(meal => renderMeal(meal, dayIndex))}
          
          {dayMenu.totalNutrition && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f0f8ff', 
              borderRadius: '8px',
              border: '2px solid #6ec1e4'
            }}>
              <strong>Итого за день:</strong>
              {renderNutritionInfo(dayMenu.totalNutrition)}
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="card">
      <h2>
        {isWeeklyMenu ? 'Меню на неделю' : 'Меню на день'}
        {!isWeeklyMenu && menu.date && (
          <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6c757d', marginLeft: '1rem' }}>
            ({new Date(menu.date).toLocaleDateString('ru-RU')})
          </span>
        )}
      </h2>

      <div className="warning">
        <strong>Помните:</strong> Это меню носит рекомендательный характер. 
        Всегда консультируйтесь с педиатром при введении новых продуктов, 
        особенно если у ребёнка есть склонность к аллергическим реакциям.
      </div>

      {isWeeklyMenu ? (
        <div>
          {menu.map((dayMenu, index) => renderDailyMenu(dayMenu, index))}
        </div>
      ) : (
        renderDailyMenu(menu)
      )}

      <div className="btn-group">
        <button className="btn btn-success" onClick={handleGenerateShoppingList}>
          Создать список покупок
        </button>
        
        <button className="btn btn-secondary" onClick={handleSaveMenu}>
          Сохранить меню
        </button>
        
        <button className="btn" onClick={onGenerateNew}>
          Сгенерировать другой вариант
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#fff3cd', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Рекомендации по кормлению</h4>
        <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
          <li>Предлагайте еду в спокойной обстановке</li>
          <li>Позвольте ребёнку есть самостоятельно (под присмотром)</li>
          <li>Не принуждайте к еде - следуйте сигналам голода и насыщения</li>
          <li>Новые продукты предлагайте несколько раз - вкусы формируются постепенно</li>
          <li>Всегда проверяйте температуру пищи перед подачей</li>
          <li>При кормлении кусочками всегда находитесь рядом с ребёнком</li>
        </ul>
      </div>
    </div>
  )
}

export default MenuView
