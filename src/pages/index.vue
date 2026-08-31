<script setup lang="ts">
const searchQuery = ref('')
</script>

<template>
  <VCard class="overflow-visible">
    <div class="w-100 sticky-header">
      <div class=" d-flex align-center gap-4 flex-wrap bg-background pa-3">
        <VCardText class="py-2 position-relative">
          <div
            class="d-flex flex-column gap-y-4 mx-auto "
            :class="$vuetify.display.mdAndUp ? 'w-50' : $vuetify.display.xs ? 'w-100' : 'w-75'"
          >
            <h4
              class="text-h5 text-center text-wrap mx-auto"
              :class="$vuetify.display.mdAndUp ? 'w-75' : 'w-100'"
            >
              SMF <span class="text-primary font-weight-bold"> All in one place.</span>
            </h4>
          </div>
        </VCardText>
      </div>
    </div>
  </VCard>
</template>

<style lang="scss" scoped>
.sticky-header {
  position: sticky;
  z-index: 9;
  inset-block-end: 0;
  inset-block-start: 4rem;
  transition: all 0.3s ease-in-out;
}

.illustration1 {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.illustration2 {
  position: absolute;
  inset-block-start: 2rem;
  inset-inline-start: 2.5rem;
}
</style>
