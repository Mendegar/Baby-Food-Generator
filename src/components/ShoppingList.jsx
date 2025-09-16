import { exportToCSV, exportToPrintableList } from '../utils/csv'

function ShoppingList({ items, onBack }) {
  const handleExportCSV = () => {
    const filename = `shopping-list-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(items, filename)
  }

  const handlePrint = () => {
    exportToPrintableList(items)
  }

  const totalItems = items.reduce((sum, category) => sum + category.items.length, 0)

  return (
    <div className="card">
      <h2>Список покупок</h2>
      
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <strong>Всего продуктов:</strong> {totalItems}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
          Создано: {new Date().toLocaleDateString('ru-RU')}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Список покупок пуст</h3>
          <p>Сначала сгенерируйте меню, чтобы создать список покупок.</p>
        </div>
      ) : (
        <div className="shopping-list">
          {items.map((category, categoryIndex) => (
            <div key={categoryIndex} className="shopping-category">
              <h4>{category.name}</h4>
              <ul className="shopping-items">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        style={{ marginRight: '0.5rem' }}
                        onChange={(e) => {
                          // Визуальная обратная связь при отмечании пунктов
                          e.target.parentElement.style.opacity = e.target.checked ? '0.6' : '1'
                          e.target.parentElement.style.textDecoration = e.target.checked ? 'line-through' : 'none'
                        }}
                      />
                      <span>
                        <strong>{item.name}</strong> — {item.approximateAmount}
                        <span style={{ color: '#6c757d', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                          ({item.grams}г)
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="btn-group">
        <button className="btn" onClick={onBack}>
          ← Вернуться к меню
        </button>
        
        {items.length > 0 && (
          <>
            <button className="btn btn-success" onClick={handleExportCSV}>
              Скачать CSV
            </button>
            
            <button className="btn btn-secondary" onClick={handlePrint}>
              Печать
            </button>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#e7f3ff', 
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Советы по покупкам</h4>
          <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
            <li>Покупайте овощи и фрукты свежими, выбирайте спелые плоды</li>
            <li>Мясо и рыбу лучше покупать в проверенных местах</li>
            <li>Обращайте внимание на сроки годности, особенно молочных продуктов</li>
            <li>Детские каши выбирайте без сахара и соли</li>
            <li>Оливковое масло покупайте первого холодного отжима</li>
            <li>Замороженные овощи тоже подходят для детского питания</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ShoppingList
