<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  subtotal: {
    type: Number,
    required: true
  },
  promoCodes: {
    type: Array,
    required: true
  }
})

const inputCode = ref('')
const message = ref('')
const currentDiscount = ref(0)

const applyCode = () => {
  const promo = props.promoCodes.find(p => p.code === inputCode.value.toUpperCase())
  
  if (promo) {
    currentDiscount.value = promo.discount
    message.value = `Скидку ${promo.discount}% применено!`
  } else {
    currentDiscount.value = 0
    message.value = '❌ Неверный промокод!'
  }
}

const discountAmount = computed(() => {
  return (props.subtotal * currentDiscount.value) / 100
})

const finalTotal = computed(() => {
  return props.subtotal - discountAmount.value
})
</script>

<template>
  <div class="summary card">
    <h3>🧾 Чек</h3>
    
    <div class="promo-apply">
      <input type="text" v-model="inputCode" placeholder="Введіть промокод" />
      <button @click="applyCode">Применить</button>
    </div>
    <div v-if="message" class="message" :class="{ 'error': currentDiscount === 0 }">
      {{ message }}
    </div>

    <div class="totals">
      <p>Промежуточная стоимость: <strong>{{ subtotal.toFixed(2) }} грн</strong></p>
      <p class="discount-row">Скидка: <strong>-{{ discountAmount.toFixed(2) }} грн</strong></p>
      <hr />
      <h3>Финальная цена: <span>{{ finalTotal.toFixed(2) }} грн</span></h3>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
.promo-apply {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}
input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0 15px;
  font-weight: bold;
}
button:hover {
  background: #2563eb;
}
.message {
  font-size: 13px;
  color: #10b981;
  margin-bottom: 15px;
  font-weight: 500;
}
.message.error {
  color: #ef4444;
}
.totals p {
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  color: #4b5563;
}
.discount-row {
  color: #10b981 !important;
}
hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 15px 0;
}
.totals h3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #111827;
  margin-bottom: 0;
  font-size: 20px;
}
.totals h3 span {
  color: #2563eb;
}
</style>