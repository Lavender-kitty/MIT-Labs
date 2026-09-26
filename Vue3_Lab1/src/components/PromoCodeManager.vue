<script setup>
import { ref } from 'vue'

const props = defineProps({
  promoCodes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add-promo'])

const newCode = ref('')
const newDiscount = ref('')

const addPromo = () => {
  if (newCode.value && newDiscount.value > 0 && newDiscount.value <= 100) {
    emit('add-promo', {
      code: newCode.value.toUpperCase(),
      discount: Number(newDiscount.value)
    })
    newCode.value = ''
    newDiscount.value = ''
  }
}
</script>

<template>
  <div class="promo-manager card">
    <h3>🎟️ Доступные промокоды</h3>
    
    <div class="promo-list">
      <span class="badge" v-for="promo in promoCodes" :key="promo.code">
        {{ promo.code }} (-{{ promo.discount }}%)
      </span>
    </div>

    <h4>Додати новий код:</h4>
    <div class="add-promo">
      <input type="text" v-model="newCode" placeholder="Название (Пример VIP50)" />
      <input type="number" v-model="newDiscount" placeholder="% скидки" min="1" max="100" />
      <button @click="addPromo">Создать</button>
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
h3, h4 {
  margin-top: 0;
  margin-bottom: 10px;
}
.promo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
}
.add-promo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input, button {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
button {
  background: #10b981;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
button:hover {
  background: #059669;
}
</style>