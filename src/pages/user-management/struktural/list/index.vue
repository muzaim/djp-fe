<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AddNewPositionDrawer from '@/views/user-management/struktural/AddNewPositionDrawer.vue'
import { paginationMeta } from '@api-utils/paginationMeta'

const {
  positions,
  totalPositions,
  isLoading,
  searchQuery,
  itemsPerPage,
  page,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
  isAddNewDrawerVisible,
  isConfirmDialogOpen,
  detailData,
  addData,
  selectData,
  submitProcess,
  updateDeleteData,
  deleteData,
} = usePosition()

// Headers for Daftar Fungsi
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Nama Fungsi', key: 'title' },
  { title: 'Divisi', key: 'division' },
  { title: 'Unit Organisasi', key: 'organizationUnit.name' },
  { title: 'Job Level', key: 'jobLevel.name' },
  { title: 'Atasan Langsung', key: 'parentPosition.title' },
  { title: 'Aksi', key: 'actions', sortable: false },
]

// Extract division name directly from position.division object
const getDivisionName = (posItem: any) => {
  const item = posItem?.raw || posItem

  return item?.division?.name || '-'
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
            icon="tabler-subtask"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Daftar Fungsi
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Kelola posisi jabatan (fungsi), unit organisasi terkait, job level, dan struktur atasan langsung
          </span>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 Data Table Card -->
    <VCard :loading="isLoading">
      <VCardText class="d-flex flex-wrap py-4 gap-4 align-center">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 14rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Cari posisi / fungsi..."
              density="compact"
            />
          </div>

          <!-- 👉 Add button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Tambah Fungsi
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="positions"
        :items-length="totalPositions"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- Title / Nama Fungsi -->
        <template #item.title="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.title || item.title || '-' }}
          </span>
        </template>

        <!-- Division -->
        <template #item.division="{ item }">
          <span>{{ getDivisionName(item) }}</span>
        </template>

        <!-- Organization Unit -->
        <template #item.organizationUnit.name="{ item }">
          <span>{{ item.raw?.organizationUnit?.name || item.organizationUnit?.name || '-' }}</span>
        </template>

        <!-- Job Level -->
        <template #item.jobLevel.name="{ item }">
          <VChip
            label
            size="small"
            color="primary"
            class="text-capitalize"
          >
            {{ item.raw?.jobLevel?.name || item.jobLevel?.name || item.raw?.jobLevel?.code || '-' }}
          </VChip>
        </template>

        <!-- Parent Position -->
        <template #item.parentPosition.title="{ item }">
          <span>{{ item.raw?.parentPosition?.title || item.parentPosition?.title || '-' }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            title="Edit Fungsi"
            @click="selectData(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn
            title="Hapus Fungsi"
            @click="updateDeleteData(item.raw?.id || item.id); isConfirmDialogOpen = true"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- pagination meta -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalPositions) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalPositions / itemsPerPage) || 1"
              :total-visible="6"
            >
              <template #prev="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Previous
                </VBtn>
              </template>

              <template #next="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Next
                </VBtn>
              </template>
            </VPagination>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>

    <!-- 👉 Add/Edit Position Drawer -->
    <AddNewPositionDrawer
      v-model:isDrawerOpen="isAddNewDrawerVisible"
      v-model:position-data="detailData"
      @submit="submitProcess"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Apakah Anda yakin ingin menghapus data fungsi ini?"
      confirm-title="Terhapus!"
      confirm-msg="Data fungsi telah berhasil dihapus."
      cancel-title="Batal"
      cancel-msg="Penghapusan data fungsi dibatalkan."
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
