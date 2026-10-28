<script setup lang="ts">
import { computed } from 'vue'
import { handleBackground } from '@slidev/theme-default/layoutHelper'

const props = defineProps<{
  background?: string
  backgroundSize?: string
  backgroundPosition?: string
}>()

const style = computed(() => {
  if (!props.background)
    return {}
  const base = handleBackground(props.background, true, props.backgroundSize ?? 'cover')
  if (props.backgroundPosition)
    base.backgroundPosition = props.backgroundPosition
  return base
})
</script>

<template>
  <div class="slidev-layout default h-full min-h-full" :style="style">
    <slot />
  </div>
</template>
