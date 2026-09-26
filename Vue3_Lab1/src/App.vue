<script setup>
import { ref, computed } from 'vue'
import DrinkItem from './components/DrinkItem.vue'
import PromoCodeManager from './components/PromoCodeManager.vue'
import Summary from './components/Summary.vue'

const drinks = ref([
  { id: 1, name: 'Coca-Cola', price: 40, emoji: '🥤', volume: 0 },
  { id: 2, name: 'Orange Juice', price: 60, emoji: '🧃', volume: 0 },
  { id: 3, name: 'Mineral Water', price: 25, emoji: '💧', volume: 0 },
  { id: 4, name: 'Lemonade', price: 70, emoji: '🍋', volume: 0 }
])

const promoCodes = ref([
  { code: 'PARTY10', discount: 10 },
  { code: 'KITTY20', discount: 20 }
])

const subtotal = computed(() => {
  return drinks.value.reduce((sum, drink) => {
    return sum + (drink.price * (drink.volume || 0))
  }, 0)
})

const handleAddPromo = (newPromo) => {
  promoCodes.value.push(newPromo)
}

const updateVolume = (id, newVolume) => {
  const drink = drinks.value.find(d => d.id === id)
  if (drink) {
    drink.volume = newVolume
  }
}
</script>

<template>
  <div class="app-container">
    <h1>🎉 Калькулятор напитков</h1>
    
    <div class="main-content">
      <div class="drinks-list">
        <h2>Выберите напитки:</h2>
        <DrinkItem 
          v-for="drink in drinks" 
          :key="drink.id" 
          :drink="drink" 
          @update-volume="updateVolume"
        />
      </div>

      <div class="sidebar">
        <PromoCodeManager 
          :promo-codes="promoCodes" 
          @add-promo="handleAddPromo" 
        />
        
        <Summary 
          :subtotal="subtotal" 
          :promo-codes="promoCodes"
        />
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f3f4f6;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.app-container {
  max-width: 900px;
  margin: 40px auto;
  color: #333;
}
h1 {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 30px;
}
.main-content {
  display: flex;
  gap: 30px;
}
.drinks-list {
  flex: 2;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>