<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import AddNewOrgUnitDrawer from '@/views/user-management/struktur-organisasi/AddNewOrgUnitDrawer.vue'
import OrgChartDialog from '@/views/user-management/struktur-organisasi/OrgChartDialog.vue'

const {
  orgUnits,
  chartData,
  totalOrgUnits,
  isLoading,
  isLoadingChart,
  searchQuery,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
  isAddNewDrawerVisible,
  isConfirmDialogOpen,
  isChartDialogOpen,
  detailData,
  addData,
  selectData,
  submitProcess,
  updateDeleteData,
  deleteData,
} = useOrgStructure()

// Headers for Struktur Organisasi
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Nama Unit Organisasi', key: 'name' },
  { title: 'Level Type', key: 'levelType' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Level type color chips
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

// Indonesian Level Labels
const getLevelLabel = (levelType: string) => {
  switch (levelType) {
    case 'COMPANY': return 'Perusahaan'
    case 'DIRECTORATE': return 'Direktorat'
    case 'DIVISION': return 'Divisi'
    case 'DEPARTMENT': return 'Departemen'
    case 'SECTION': return 'Seksi'
    default: return levelType
  }
}
</script>

<template>
  <section>
    <!-- 👉 Top Banner Card -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center gap-4 pa-5">
        <VAvatar
          size="48"
          color="primary"
          variant="tonal"
          class="rounded"
        >
          <VIcon
            size="28"
            icon="tabler-sitemap"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Struktur Organisasi
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Kelola hirarki struktur organisasi (Perusahaan, Direktorat, Divisi, Departemen, dan Seksi)
          </span>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 Data Table Card -->
    <VCard :loading="isLoading">
      <VCardText class="d-flex flex-wrap py-4 gap-4 align-center">
        <!-- 👉 Search Input (Far Left) -->
        <div style="inline-size: 16rem;">
          <AppTextField
            v-model="searchQuery"
            placeholder="Cari unit organisasi..."
            density="compact"
          />
        </div>

        <VSpacer />

        <!-- 👉 Action Buttons (Far Right) -->
        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 View Org Chart Button -->
          <VBtn
            prepend-icon="tabler-hierarchy-2"
            variant="tonal"
            color="primary"
            @click="isChartDialogOpen = true"
          >
            Lihat Bagan
          </VBtn>

          <!-- 👉 Add button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Tambah Unit
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTable
        :items="orgUnits"
        :headers="headers"
        :items-per-page="999999"
        class="text-no-wrap"
      >
        <!-- Name with rightward depth indentation -->
        <template #item.name="{ item }">
          <div
            class="d-flex align-center"
            :style="{ paddingLeft: `${(item.raw?.depth ?? item.depth ?? 0) * 1.5}rem` }"
          >
            <span
              v-if="(item.raw?.depth ?? item.depth ?? 0) > 0"
              class="text-disabled me-2 font-weight-bold"
            >
              └─
            </span>
            <span
              class="font-weight-medium"
              :class="(item.raw?.levelType || item.levelType) === 'COMPANY' ? 'text-primary font-weight-bold text-base' : 'text-high-emphasis'"
            >
              {{ item.raw?.name || item.name || '-' }}
            </span>
          </div>
        </template>

        <!-- Level Type Chip -->
        <template #item.levelType="{ item }">
          <VChip
            label
            size="small"
            :color="getLevelColor(item.raw?.levelType || item.levelType)"
            class="font-weight-medium"
          >
            {{ getLevelLabel(item.raw?.levelType || item.levelType) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <!-- Protect Company level from edit/delete -->
          <template v-if="(item.raw?.levelType || item.levelType) !== 'COMPANY'">
            <IconBtn
              title="Edit Unit"
              @click="selectData(item.raw?.id || item.id)"
            >
              <VIcon icon="tabler-edit" />
            </IconBtn>

            <IconBtn
              title="Hapus Unit"
              @click="updateDeleteData(item.raw?.id || item.id); isConfirmDialogOpen = true"
            >
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </template>
          <span
            v-else
            class="text-xs text-disabled"
          >-</span>
        </template>

        <!-- Hide default pagination bottom bar since all items are shown -->
        <template #bottom>
          <VDivider />
          <div class="pa-4 text-xs text-disabled text-end">
            Total Unit Organisasi: {{ totalOrgUnits }}
          </div>
        </template>
      </VDataTable>
      <!-- SECTION -->
    </VCard>

    <!-- 👉 Add/Edit Drawer -->
    <AddNewOrgUnitDrawer
      v-model:isDrawerOpen="isAddNewDrawerVisible"
      v-model:org-unit-data="detailData"
      @submit="submitProcess"
    />

    <!-- 👉 Bagan Organization Chart Modal Dialog (Consuming GET /organization-units/chart) -->
    <OrgChartDialog
      v-model:isDialogVisible="isChartDialogOpen"
      :tree-data="chartData"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Apakah Anda yakin ingin menghapus unit organisasi ini?"
      confirm-title="Terhapus!"
      confirm-msg="Unit organisasi telah berhasil dihapus."
      cancel-title="Batal"
      cancel-msg="Penghapusan unit dibatalkan."
      confirm-btn-text="Ya, Hapus"
      cancel-btn-text="Batal"
      @confirm="deleteData"
    />
  </section>

  <!-- Snackbar Notification -->
  <VSnackbar
    v-model="isSnackbarVisible"
    transition="scroll-y-reverse-transition"
    location="top end"
    :timeout="2000"
    :color="snackBarColour"
  >
    {{ snackBarText }}
  </VSnackbar>
</template>
