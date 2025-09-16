export const exportToCSV = (shoppingList, filename = 'shopping-list.csv') => {
  // Создаём CSV контент
  const csvContent = [
    // Заголовок
    'Категория,Продукт,Количество (г),Примерное количество',
    // Данные
    ...shoppingList.flatMap(category => 
      category.items.map(item => 
        `"${category.name}","${item.name}",${item.grams},"${item.approximateAmount}"`
      )
    )
  ].join('\n')

  // Создаём blob с правильной кодировкой для русского текста
  const BOM = '\uFEFF' // Byte Order Mark для корректного отображения в Excel
  const blob = new Blob([BOM + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  })

  // Создаём ссылку для скачивания
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const exportToPrintableList = (shoppingList) => {
  // Создаём простой текстовый список для печати
  const textContent = [
    'СПИСОК ПОКУПОК',
    '================',
    '',
    ...shoppingList.flatMap(category => [
      `${category.name.toUpperCase()}:`,
      ...category.items.map(item => `  ☐ ${item.name} (${item.approximateAmount})`),
      ''
    ]),
    '================',
    `Создано: ${new Date().toLocaleDateString('ru-RU')}`
  ].join('\n')

  // Открываем в новом окне для печати
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Список покупок</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          pre { 
            white-space: pre-wrap; 
            font-family: Arial, sans-serif; 
          }
          @media print {
            body { margin: 0; padding: 15px; }
          }
        </style>
      </head>
      <body>
        <pre>${textContent}</pre>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
