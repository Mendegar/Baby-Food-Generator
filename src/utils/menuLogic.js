import productsData from '../data/products.json'
import recipesData from '../data/recipes.json'

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                (today.getMonth() - birthDate.getMonth())
  return Math.max(0, months)
}

export const getConsistencyForAge = (ageMonths) => {
  if (ageMonths <= 7) return 'puree'
  if (ageMonths <= 9) return 'soft-chunks'
  return 'finger-food'
}

export const filterProductsByProfile = (childProfile) => {
  const ageMonths = calculateAge(childProfile.dateOfBirth)
  
  return productsData.products.filter(product => {
    // Проверка возраста
    if (product.allowed_from_month > ageMonths) return false
    
    // Проверка аллергенов
    if (product.allergens && product.allergens.some(allergen => 
      childProfile.excludeAllergens.includes(allergen)
    )) return false
    
    // Проверка диетических предпочтений
    if (childProfile.dietaryPreferences.vegetarian && 
        ['meat', 'fish'].includes(product.categories[0])) return false
        
    if (childProfile.dietaryPreferences.vegan && 
        ['meat', 'fish', 'dairy', 'egg'].includes(product.categories[0])) return false
    
    return true
  })
}

export const filterRecipesByProfile = (childProfile, availableProducts) => {
  const ageMonths = calculateAge(childProfile.dateOfBirth)
  const targetConsistency = getConsistencyForAge(ageMonths)
  const availableProductIds = new Set(availableProducts.map(p => p.id))
  
  return recipesData.recipes.filter(recipe => {
    // Проверка возраста
    if (recipe.recommended_from_month > ageMonths) return false
    
    // Проверка консистенции (можем брать более мягкую консистенцию)
    const consistencyOrder = ['puree', 'soft-chunks', 'finger-food']
    const recipeConsistencyIndex = consistencyOrder.indexOf(recipe.consistency)
    const targetConsistencyIndex = consistencyOrder.indexOf(targetConsistency)
    if (recipeConsistencyIndex > targetConsistencyIndex) return false
    
    // Проверка доступности всех ингредиентов
    return recipe.ingredients.every(ingredient => 
      availableProductIds.has(ingredient.product_id)
    )
  })
}

export const calculateNutrition = (recipe, availableProducts) => {
  const productMap = new Map(availableProducts.map(p => [p.id, p]))
  
  const totals = {
    kcal: 0,
    protein_g: 0,
    iron_mg: 0,
    zinc_mg: 0,
    calcium_mg: 0,
    vitaminD_µg: 0
  }
  
  recipe.ingredients.forEach(ingredient => {
    const product = productMap.get(ingredient.product_id)
    if (!product) return
    
    const multiplier = ingredient.grams / 100 // пересчёт на 100г
    
    Object.keys(totals).forEach(nutrient => {
      totals[nutrient] += (product.nutrition_per_100g[nutrient] || 0) * multiplier
    })
  })
  
  // Округляем значения
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 100) / 100
  })
  
  return totals
}

export const generateDailyMenu = (childProfile, settings = {}) => {
  const {
    avoidNewProducts = false,
    strictRotation = true
  } = settings
  
  const availableProducts = filterProductsByProfile(childProfile)
  
  // Если нужно избегать новых продуктов, фильтруем по уже введённым
  const finalProducts = avoidNewProducts 
    ? availableProducts.filter(p => childProfile.introducedProducts.includes(p.id))
    : availableProducts
    
  const availableRecipes = filterRecipesByProfile(childProfile, finalProducts)
  
  if (availableRecipes.length === 0) {
    throw new Error('Недостаточно доступных рецептов для генерации меню')
  }
  
  const mealTimes = ['Завтрак', 'Перекус (утро)', 'Обед', 'Перекус (день)', 'Ужин']
  const usedMainIngredients = new Set()
  const meals = []
  
  mealTimes.forEach((mealTime, index) => {
    let selectedRecipe = null
    let attempts = 0
    const maxAttempts = 50
    
    // Пытаемся найти подходящий рецепт
    while (!selectedRecipe && attempts < maxAttempts) {
      const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)]
      
      if (strictRotation) {
        // Проверяем, что основной ингредиент не повторяется
        const mainIngredient = randomRecipe.ingredients
          .filter(ing => {
            const product = finalProducts.find(p => p.id === ing.product_id)
            return product && !['oil'].includes(product.categories[0])
          })
          .sort((a, b) => b.grams - a.grams)[0] // берём самый весомый ингредиент
        
        if (mainIngredient) {
          const product = finalProducts.find(p => p.id === mainIngredient.product_id)
          const productCategory = product.categories[0]
          
          if (!usedMainIngredients.has(productCategory)) {
            selectedRecipe = randomRecipe
            usedMainIngredients.add(productCategory)
          }
        }
      } else {
        selectedRecipe = randomRecipe
      }
      
      attempts++
    }
    
    // Если не удалось найти с ротацией, берём любой доступный
    if (!selectedRecipe) {
      selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)]
    }
    
    const nutrition = calculateNutrition(selectedRecipe, finalProducts)
    
    meals.push({
      timeLabel: mealTime,
      recipe: selectedRecipe,
      nutrition,
      ingredients: selectedRecipe.ingredients.map(ing => {
        const product = finalProducts.find(p => p.id === ing.product_id)
        return {
          ...ing,
          productName: product?.name || 'Неизвестный продукт'
        }
      })
    })
  })
  
  return {
    date: new Date().toISOString().split('T')[0],
    meals,
    totalNutrition: meals.reduce((total, meal) => {
      Object.keys(meal.nutrition).forEach(key => {
        total[key] = (total[key] || 0) + meal.nutrition[key]
      })
      return total
    }, {})
  }
}

export const generateWeeklyMenu = (childProfile, settings = {}) => {
  const weeklyMenu = []
  
  for (let day = 0; day < 7; day++) {
    try {
      const dailyMenu = generateDailyMenu(childProfile, settings)
      const date = new Date()
      date.setDate(date.getDate() + day)
      
      weeklyMenu.push({
        ...dailyMenu,
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('ru-RU', { weekday: 'long' })
      })
    } catch (error) {
      console.error(`Ошибка генерации меню для дня ${day + 1}:`, error)
      // Попробуем сгенерировать упрощённое меню
      weeklyMenu.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dayName: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { weekday: 'long' }),
        meals: [],
        error: 'Не удалось сгенерировать меню для этого дня'
      })
    }
  }
  
  return weeklyMenu
}

export const generateShoppingList = (menu) => {
  const ingredientMap = new Map()
  
  // Собираем все ингредиенты
  const menus = Array.isArray(menu) ? menu : [menu]
  
  menus.forEach(dayMenu => {
    if (dayMenu.meals) {
      dayMenu.meals.forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          const key = ingredient.product_id
          const existing = ingredientMap.get(key)
          
          if (existing) {
            existing.totalGrams += ingredient.grams
          } else {
            ingredientMap.set(key, {
              productId: ingredient.product_id,
              productName: ingredient.productName,
              totalGrams: ingredient.grams,
              category: 'other' // будет обновлено ниже
            })
          }
        })
      })
    }
  })
  
  // Группируем по категориям
  const categories = {
    vegetables: { name: 'Овощи', items: [] },
    fruits: { name: 'Фрукты', items: [] },
    cereals: { name: 'Крупы и каши', items: [] },
    meat: { name: 'Мясо и птица', items: [] },
    fish: { name: 'Рыба', items: [] },
    dairy: { name: 'Молочные продукты', items: [] },
    oils: { name: 'Масла', items: [] },
    other: { name: 'Прочее', items: [] }
  }
  
  // Определяем категории продуктов
  const products = productsData.products
  
  ingredientMap.forEach(ingredient => {
    const product = products.find(p => p.id === ingredient.productId)
    let categoryKey = 'other'
    
    if (product && product.categories.length > 0) {
      const productCategory = product.categories[0]
      
      switch (productCategory) {
        case 'vegetable':
          categoryKey = 'vegetables'
          break
        case 'fruit':
          categoryKey = 'fruits'
          break
        case 'cereal':
          categoryKey = 'cereals'
          break
        case 'meat':
          categoryKey = 'meat'
          break
        case 'fish':
          categoryKey = 'fish'
          break
        case 'dairy':
        case 'egg':
          categoryKey = 'dairy'
          break
        case 'oil':
          categoryKey = 'oils'
          break
        default:
          categoryKey = 'other'
      }
    }
    
    categories[categoryKey].items.push({
      name: ingredient.productName,
      grams: Math.ceil(ingredient.totalGrams),
      // Добавляем примерные порции для удобства покупок
      approximateAmount: getApproximateAmount(ingredient.productName, ingredient.totalGrams)
    })
  })
  
  // Убираем пустые категории и сортируем
  Object.keys(categories).forEach(key => {
    categories[key].items.sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return Object.values(categories).filter(category => category.items.length > 0)
}

const getApproximateAmount = (productName, grams) => {
  // Примерные переводы в удобные для покупки единицы
  if (productName.includes('масло')) {
    return '1 бутылочка'
  }
  if (productName.includes('каша') || productName.includes('крупа')) {
    return grams > 100 ? '1 пачка' : '1 небольшая пачка'
  }
  if (productName.includes('мясо') || productName.includes('курица') || productName.includes('говядина') || productName.includes('индейка')) {
    return `~${Math.ceil(grams / 50) * 50}г`
  }
  if (productName.includes('рыба')) {
    return `~${Math.ceil(grams / 25) * 25}г`
  }
  if (productName.includes('яблоко') || productName.includes('груша') || productName.includes('банан')) {
    const pieces = Math.ceil(grams / 150) // примерный вес одного фрукта
    return `${pieces} шт.`
  }
  if (productName.includes('морковь') || productName.includes('кабачок') || productName.includes('тыква')) {
    return grams > 200 ? '1 шт. средняя' : '1 шт. небольшая'
  }
  
  return `~${Math.ceil(grams / 10) * 10}г`
}
