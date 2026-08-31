<script setup lang="ts">
interface Props {
  searchQuery: string
}

// Data table options
const tags = ref('')

const label = ref('All Application')

watch([label], () => {
  tags.value = label.value
})
</script>

<template>
  <VCard class="mb-4">
    <VCardText>
      <!-- 👉 Header -->
      <div class="d-flex justify-space-between align-center flex-wrap gap-4 mb-4 ">
        <div>
          <h6 class="text-h6">
            My Application
          </h6>
        </div>
      </div>

      <!-- 👉 Course List -->
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.course-title{
  &:not(:hover){
    color: rgba(var(--v-theme-on-surface), var(--v-text-high-emphasis))
  }
}
</style>
