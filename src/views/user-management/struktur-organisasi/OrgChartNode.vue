<script setup lang="ts">
const props = defineProps<{
  node: any
}>()

const type = computed(() => props.node.levelType || props.node.type || 'SECTION')

const getLevelColor = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'purple'
    case 'DIRECTORATE': return 'primary'
    case 'DIVISION': return 'success'
    case 'DEPARTMENT': return 'warning'
    case 'SECTION': return 'info'
    case 'NON_BAGIAN': return 'secondary'
    case 'POSITION': return 'primary'
    default: return 'secondary'
  }
}

const getLevelLabel = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'Perusahaan'
    case 'DIRECTORATE': return 'Direktorat'
    case 'DIVISION': return 'Divisi'
    case 'DEPARTMENT': return 'Departemen'
    case 'SECTION': return 'Seksi'
    case 'NON_BAGIAN': return 'Non Bagian'
    case 'POSITION': return 'Fungsi'
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
    case 'NON_BAGIAN': return 'tabler-folders'
    case 'POSITION': return 'tabler-user-check'
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
      :class="`border-${getLevelColor(type)}`"
    >
      <div class="d-flex align-center justify-center gap-2 mb-1">
        <VIcon
          size="18"
          :color="getLevelColor(type)"
          :icon="getIcon(type)"
        />
        <VChip
          size="x-small"
          :color="getLevelColor(type)"
          label
          class="font-weight-medium"
        >
          {{ getLevelLabel(type) }}
        </VChip>
      </div>

      <h6 class="text-subtitle-1 font-weight-bold mb-0 text-high-emphasis text-wrap max-w-220">
        {{ node.name || node.label || node.title || '-' }}
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
.max-w-220 {
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
