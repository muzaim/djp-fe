<script setup lang="ts">
import OrgChartNode from './OrgChartNode.vue'

interface Props {
  isDialogVisible: boolean
  treeData: any[]
}

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <VDialog
    max-width="1400"
    :model-value="props.isDialogVisible"
    scrollable
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard class="org-chart-modal">
      <VCardItem class="py-4 px-6 border-b">
        <template #prepend>
          <VAvatar
            size="40"
            color="primary"
            variant="tonal"
            class="me-2"
          >
            <VIcon
              size="24"
              icon="tabler-hierarchy-2"
            />
          </VAvatar>
        </template>
        <VCardTitle class="text-h5 font-weight-bold">
          Bagan Struktur Organisasi
        </VCardTitle>
        <VCardSubtitle>
          Visualisasi hierarki organisasi (Geser ke kanan untuk melihat seluruh struktur)
        </VCardSubtitle>

        <template #append>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </template>
      </VCardItem>

      <VCardText class="pa-6 chart-container-wrapper">
        <div class="org-chart-scroll-area">
          <ul
            v-if="props.treeData && props.treeData.length > 0"
            class="org-tree-root"
          >
            <OrgChartNode
              v-for="root in props.treeData"
              :key="root.id"
              :node="root"
            />
          </ul>
          <div
            v-else
            class="text-center py-10 text-disabled"
          >
            Data struktur organisasi belum tersedia.
          </div>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.org-chart-modal {
  max-block-size: 90vh;
}

.chart-container-wrapper {
  background-color: var(--v-theme-background);
  min-block-size: 500px;
  overflow-x: auto !important;
  overflow-y: auto !important;
}

.org-chart-scroll-area {
  display: inline-block;
  min-inline-size: 100%;
  padding: 20px;
}

/* CSS Tree Layout Rules */
:deep(.org-tree-root),
:deep(.org-children-list) {
  display: flex;
  position: relative;
  justify-content: center;
  list-style-type: none;
  padding-block-start: 24px;
  padding-inline-start: 0;
  transition: all 0.3s;
}

:deep(.org-node-item) {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  padding-block-start: 24px;
  padding-inline-end: 12px;
  padding-inline-start: 12px;
  transition: all 0.3s;
}

/* Top Horizontal Line Connectors */
:deep(.org-node-item::before),
:deep(.org-node-item::after) {
  position: absolute;
  block-size: 24px;
  border-block-start: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  content: '';
  inline-size: 50%;
  inset-block-start: 0;
  inset-inline-end: 50%;
}

:deep(.org-node-item::after) {
  border-inline-start: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  inset-inline-end: auto;
  inset-inline-start: 50%;
}

:deep(.org-node-item:only-child::after),
:deep(.org-node-item:only-child::before) {
  display: none;
}

:deep(.org-node-item:only-child) {
  padding-block-start: 0;
}

:deep(.org-node-item:first-child::before),
:deep(.org-node-item:last-child::after) {
  border: 0 none;
}

:deep(.org-node-item:last-child::before) {
  border-border-radius-top-right: 8px;
  border-inline-end: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.org-node-item:first-child::after) {
  border-border-radius-top-left: 8px;
}

/* Vertical Line from parent to children */
:deep(.org-children-list::before) {
  position: absolute;
  block-size: 24px;
  border-inline-start: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  content: '';
  inline-size: 0;
  inset-block-start: 0;
  inset-inline-start: 50%;
}
</style>
