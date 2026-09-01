<script setup lang="ts">
defineProps<{
  node: any
}>()

const getLevelColor = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'purple'
    case 'DIRECTORATE': return 'primary'
    case 'DIVISION': return 'success'
    case 'DEPARTMENT': return 'warning'
    case 'SECTION': return 'info'
    default: return 'secondary'
  }
}

const getLevelLabel = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'Perusahaan'
    case 'DIRECTORATE': return 'Direktorat'
    case 'DIVISION': return 'Divisi'
    case 'DEPARTMENT': return 'Bagian'
    case 'SECTION': return 'Seksi'
    default: return levelType || 'Unit'
  }
}

const getIcon = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'tabler-building'
    case 'DIRECTORATE': return 'tabler-building-skyscraper'
    case 'DIVISION': return 'tabler-subtask'
    case 'DEPARTMENT': return 'tabler-category'
    case 'SECTION': return 'tabler-layout-grid'
    default: return 'tabler-subtask'
  }
}
</script>

<template>
  <li class="org-node-item">
    <!-- Card Box -->
    <VCard
      elevation="3"
      class="org-card px-4 py-3 text-center rounded-lg"
      :class="`border-${getLevelColor(node.levelType)}`"
    >
      <div class="d-flex align-center justify-center gap-2 mb-1">
        <VIcon
          size="18"
          :color="getLevelColor(node.levelType)"
          :icon="getIcon(node.levelType)"
        />
        <VChip
          size="x-small"
          :color="getLevelColor(node.levelType)"
          label
          class="font-weight-medium"
        >
          {{ getLevelLabel(node.levelType) }}
        </VChip>
      </div>

      <h6 class="text-subtitle-1 font-weight-bold mb-0 text-high-emphasis text-wrap max-w-200">
        {{ node.name }}
      </h6>
    </VCard>

    <!-- Children Nodes -->
    <ul
      v-if="node.children && node.children.length > 0"
      class="org-children-list"
    >
      <OrgChartNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </ul>
  </li>
</template>

<style scoped>
.max-w-200 {
  max-inline-size: 220px;
}

.org-card {
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  min-inline-size: 180px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.org-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 15%) !important;
  transform: translateY(-2px);
}
</style>
