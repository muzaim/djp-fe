<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AddNewActivityDrawer from '@/views/master-data/tanggung-jawab/AddNewActivityDrawer.vue'
import { paginationMeta } from '@api-utils/paginationMeta'

const route = useRoute()
const router = useRouter()

const responsibilityId = computed(() => String(route.params.id || ''))

const {
  activities,
  responsibilityDetail,
  totalActivities,
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
} = useActivity(responsibilityId)

// Headers for Activities datatable
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Nama Aktivitas', key: 'name' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const goBack = () => {
  router.push('/master-data/tanggung-jawab/list')
}
</script>

<template>
  <section>
    <!-- 👉 Top Banner Card with Header & Justified Back Button -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4 pa-5">
        <div class="d-flex align-center gap-4">
          <VAvatar
            size="48"
            color="info"
            variant="tonal"
            class="rounded"
          >
            <VIcon
              size="28"
              icon="tabler-list-check"
            />
          </VAvatar>
          <div>
            <h4 class="text-h5 font-weight-semibold mb-0">
              Daftar Aktivitas
            </h4>
            <span class="text-subtitle-2 text-disabled">
              Tanggung Jawab: <strong class="text-primary">{{ responsibilityDetail?.name || 'Loading...' }}</strong>
            </span>
          </div>
        </div>

        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-arrow-left"
          size="small"
          @click="goBack"
        >
          Kembali ke Daftar Tanggung Jawab
        </VBtn>
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

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 14rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Cari aktivitas..."
              density="compact"
            />
          </div>

          <!-- 👉 Add Activity Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Tambah Aktivitas
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="activities"
        :items-length="totalActivities"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.name || item.name || '-' }}
          </span>
        </template>

        <!-- Status -->
        <template #item.isActive="{ item }">
          <VChip
            label
            size="small"
            :color="(item.raw?.isActive ?? item.isActive) ? 'success' : 'secondary'"
            class="font-weight-medium"
          >
            {{ (item.raw?.isActive ?? item.isActive) ? 'Aktif' : 'Non-Aktif' }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            title="Edit Aktivitas"
            @click="selectData(item.raw || item)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn
            title="Hapus Aktivitas"
            @click="updateDeleteData(item.raw?.id || item.id); isConfirmDialogOpen = true"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalActivities) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalActivities / itemsPerPage) || 1"
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

    <!-- 👉 Add/Edit Activity Drawer -->
    <AddNewActivityDrawer
      v-model:isDrawerOpen="isAddNewDrawerVisible"
      v-model:activity-data="detailData"
      @submit="submitProcess"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Apakah Anda yakin ingin menghapus aktivitas ini?"
      confirm-title="Terhapus!"
      confirm-msg="Aktivitas telah berhasil dihapus."
      cancel-title="Batal"
      cancel-msg="Penghapusan dibatalkan."
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
