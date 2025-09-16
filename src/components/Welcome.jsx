function Welcome({ onCreateProfile, onLoadProfile, onNavigateToProfiles, hasProfile }) {
  return (
    <div className="card">
      <h2>Добро пожаловать в Baby Food Generator</h2>
      
      <div className="warning">
        <strong>Важное предупреждение</strong>
        Это приложение не заменяет консультацию с педиатром. Всегда согласовывайте 
        введение новых продуктов с вашим врачом, особенно при наличии аллергических 
        реакций или особых медицинских показаний.
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Возможности приложения</h3>
        <ul>
          <li>Генерирует персонализированные меню для детей 6-12 месяцев</li>
          <li>Учитывает аллергены и пищевые исключения</li>
          <li>Показывает питательную ценность блюд</li>
          <li>Создаёт удобные списки покупок</li>
          <li>Предоставляет научно обоснованные рекомендации</li>
          <li>Обеспечивает ротацию продуктов для разнообразия</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Основные принципы</h3>
        <ul>
          <li>Без добавления соли и сахара (рекомендация ВОЗ)</li>
          <li>Консистенция адаптируется к возрасту ребёнка</li>
          <li>Постепенное введение новых продуктов</li>
          <li>Разнообразие для формирования здоровых пищевых привычек</li>
        </ul>
      </div>

      <div className="btn-group">
        {hasProfile ? (
          <>
            <button className="btn btn-success" onClick={onLoadProfile}>
              Продолжить с текущим профилем
            </button>
            <button className="btn" onClick={onNavigateToProfiles}>
              Управление профилями
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={onCreateProfile}>
              Создать профиль ребёнка
            </button>
            <button className="btn btn-secondary" onClick={onNavigateToProfiles}>
              Управление профилями
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Welcome
