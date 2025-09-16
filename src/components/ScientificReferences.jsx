function ScientificReferences() {
  const references = [
    {
      title: "WHO Guideline for complementary feeding of infants and young children 6-23 months",
      url: "https://www.who.int/publications/i/item/9789240081864",
      description: "Основные рекомендации ВОЗ по введению прикорма, сроки, принципы разнообразия питания и responsive feeding.",
      keyPoints: [
        "Начинать прикорм в 6 месяцев при продолжении грудного вскармливания",
        "Не добавлять соль и сахар в пищу детей до 2 лет",
        "Постепенное увеличение консистенции и разнообразия",
        "Responsive feeding - кормление по сигналам ребёнка"
      ]
    },
    {
      title: "ESPGHAN Position Paper on Complementary Feeding (2017)",
      url: "https://journals.lww.com/jpgn/Fulltext/2017/01000/Complementary_Feeding___A_Position_Paper_by_the.21.aspx",
      description: "Европейские рекомендации по прикорму, включая современный подход к введению аллергенов.",
      keyPoints: [
        "Раннее введение аллергенов может снизить риск развития аллергии",
        "Глютен можно вводить в 4-12 месяцев",
        "Яйца и арахис можно вводать с 4-6 месяцев",
        "Важность железосодержащих продуктов"
      ]
    },
    {
      title: "Союз педиатров России - Практические рекомендации по введению прикорма",
      url: "https://www.pediatr-russia.ru/parents_information/soveti-roditelyam/ratsiony-pitaniya-v-razlichnye-vozrastnye-periody/vvedenie-prikorma.php",
      description: "Российские рекомендации с примерами меню и порций для разных возрастов.",
      keyPoints: [
        "Схемы введения прикорма по месяцам",
        "Рекомендуемые порции для российских детей",
        "Особенности питания в разных климатических зонах",
        "Профилактика железодефицитной анемии"
      ]
    },
    {
      title: "American Academy of Pediatrics - Starting Solid Foods",
      url: "https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx",
      description: "Американские рекомендации по введению твёрдой пищи и развитию пищевых навыков.",
      keyPoints: [
        "Признаки готовности к прикорму",
        "Baby-led weaning как альтернативный подход",
        "Предотвращение удушья",
        "Формирование здоровых пищевых привычек"
      ]
    }
  ]

  const nutritionFacts = [
    {
      title: "Железо",
      importance: "Критически важно для предотвращения анемии и развития мозга",
      sources: "Мясо, птица, рыба (гемовое железо), обогащённые каши, бобовые",
      note: "Гемовое железо из мясных продуктов усваивается лучше растительного"
    },
    {
      title: "Цинк",
      importance: "Необходим для роста, иммунитета и заживления",
      sources: "Мясо, рыба, яйца, цельные злаки",
      note: "Дефицит цинка может замедлить рост и ослабить иммунитет"
    },
    {
      title: "Кальций",
      importance: "Основа для формирования костей и зубов",
      sources: "Молочные продукты, зелёные овощи, кунжут",
      note: "Важен баланс с витамином D для лучшего усвоения"
    },
    {
      title: "Витамин D",
      importance: "Необходим для усвоения кальция и здоровья костей",
      sources: "Жирная рыба, яичные желтки, обогащённые продукты",
      note: "Часто требуется дополнительный приём по назначению врача"
    },
    {
      title: "Омега-3 жирные кислоты",
      importance: "Критически важны для развития мозга и зрения",
      sources: "Жирная рыба, льняное масло, грецкие орехи, авокадо",
      note: "DHA особенно важна в первые годы жизни"
    }
  ]

  const safetyGuidelines = [
    {
      title: "Предотвращение удушья",
      points: [
        "Избегайте цельных орехов, винограда, твёрдых конфет до 3 лет",
        "Нарезайте круглые продукты (виноград, помидоры черри) на четвертинки",
        "Всегда находитесь рядом во время еды",
        "Учите ребёнка жевать и не торопиться"
      ]
    },
    {
      title: "Гигиена и безопасность",
      points: [
        "Тщательно мойте руки перед приготовлением пищи",
        "Используйте отдельные доски для мяса и овощей",
        "Проверяйте температуру пищи перед подачей",
        "Не оставляйте приготовленную пищу при комнатной температуре более 2 часов"
      ]
    },
    {
      title: "Аллергические реакции",
      points: [
        "Вводите новые продукты по одному в течение 3-5 дней",
        "Следите за признаками аллергии: сыпь, рвота, диарея, затрудненное дыхание",
        "При серьёзных реакциях немедленно обращайтесь к врачу",
        "Ведите дневник питания для отслеживания реакций"
      ]
    }
  ]

  return (
    <div className="card">
      <h2>Научные источники и справочная информация</h2>
      
      <div className="warning">
        <strong>Важное напоминание:</strong>
        Данная информация носит образовательный характер и не заменяет 
        консультацию с квалифицированным педиатром. Всегда обсуждайте 
        план питания вашего ребёнка с врачом.
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Основные научные источники</h3>
        {references.map((ref, index) => (
          <div key={index} style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            border: '1px solid #e9ecef', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
              <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6ec1e4', textDecoration: 'none' }}>
                {ref.title} ↗
              </a>
            </h4>
            <p style={{ margin: '0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {ref.description}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Ключевые моменты:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                {ref.keyPoints.map((point, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Ключевые нутриенты для развития</h3>
        {nutritionFacts.map((nutrient, index) => (
          <div key={index} style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>{nutrient.title}</h4>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
              <strong>Значение:</strong> {nutrient.importance}
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
              <strong>Источники:</strong> {nutrient.sources}
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', fontStyle: 'italic', color: '#6c757d' }}>
              {nutrient.note}
            </p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Безопасность и гигиена</h3>
        {safetyGuidelines.map((guideline, index) => (
          <div key={index} style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            background: '#fff3cd', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>{guideline.title}</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
              {guideline.points.map((point, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h3>Этапы введения прикорма по возрасту</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>6-7 месяцев</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Пюреобразная консистенция</li>
              <li>Однокомпонентные блюда</li>
              <li>Овощи, фрукты, безглютеновые каши</li>
              <li>Порции 50-100г</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', background: '#f0f8ff', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>8-9 месяцев</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Густые пюре, мелкие кусочки</li>
              <li>Введение мяса, желтка</li>
              <li>Многокомпонентные блюда</li>
              <li>Порции 100-150г</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', background: '#f0fff0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>10-12 месяцев</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
              <li>Кусочки, finger food</li>
              <li>Рыба, молочные продукты</li>
              <li>Самостоятельное питание</li>
              <li>Порции 150-200г</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ScientificReferences
