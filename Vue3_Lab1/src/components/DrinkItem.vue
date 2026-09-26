<script setup>
import { ref } from 'vue'

const props = defineProps({
  drink: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-volume'])

const inputVolume = ref('')
const error = ref('')

const handleInput = () => {
  let val = inputVolume.value
  
  if (val === '' || val === 0 || val === '0') {
    error.value = ''
    emit('update-volume', props.drink.id, 0)
    return
  }
  
  val = parseFloat(val)
  
  if (val < 0.25 || val > 100) {
    error.value = 'Разрешено от 0.25 до 100л!'
    emit('update-volume', props.drink.id, 0)
  } else {
    error.value = ''
    emit('update-volume', props.drink.id, val)
  }
}
</script>

<template>
  <div class="drink-item">
    <div class="drink-info">
      <span class="emoji">{{ drink.emoji }}</span>
      <span class="name">{{ drink.name }}</span>
      <span class="price">{{ drink.price }} грн/л</span>
    </div>
    
    <div class="input-wrapper">
      <div class="input-group">
        <input 
          type="number" 
          v-model="inputVolume" 
          @input="handleInput"
          placeholder="0"
          step="0.25"
        />
        <span class="unit">л</span>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.drink-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #fdfdfd;
}
.drink-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.emoji {
  font-size: 24px;
}
.name {
  font-weight: bold;
}
.price {
  color: #6b7280;
}
.input-wrapper {
  position: relative;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}
input {
  width: 70px;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
}
input:focus {
  border-color: #3b82f6;
}
.error-msg {
  color: #ef4444;
  font-size: 11px;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 2px;
  width: max-content;
}
</style>