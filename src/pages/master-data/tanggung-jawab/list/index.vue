<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AddNewResponsibilityDrawer from '@/views/master-data/tanggung-jawab/AddNewResponsibilityDrawer.vue'
import { paginationMeta } from '@api-utils/paginationMeta'
import { OrgStructureService } from '@/services/org-structure.service'
import { useMasterStore } from '@/stores/useMasterStore'

interface SelectOption {
  title: string
  value: string
}

const router = useRouter()
const masterStore = useMasterStore()

const {
  responsibilities,
  totalResponsibilities,
  isLoading,
  isExporting,
  searchQuery,
  itemsPerPage,
  page,
  filterDivisionId,
  filterDepartmentId,
  filterPositionId,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
  isAddNewDrawerVisible,
  isConfirmDialogOpen,
  detailData,
  exportData,
  addData,
  selectData,
  submitProcess,
  updateDeleteData,
  deleteData,
} = useResponsibility()

// Headers for Responsibilities datatable in requested order:
// No, Kode TJU, Divisi, Fungsi, Nama Tanggung Jawab, Jumlah Aktivitas, Status, Actions
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Kode TJU', key: 'code' },
  { title: 'Divisi', key: 'division' },
  { title: 'Fungsi', key: 'position.title' },
  { title: 'Nama Tanggung Jawab', key: 'name' },
  { title: 'Jumlah Aktivitas', key: 'activitiesCount' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Filter options state
const filterDivisions = ref<SelectOption[]>([])
const filterDepartments = ref<SelectOption[]>([])
const filterPositions = ref<SelectOption[]>([])

const loadingFilterDivisions = ref(false)
const loadingFilterDepartments = ref(false)
const loadingFilterPositions = ref(false)

// 1. Fetch Divisions for filter
const fetchFilterDivisions = async () => {
  loadingFilterDivisions.value = true
  try {
    const divs = await masterStore.getDivisions()
    filterDivisions.value = divs.map(d => ({
      title: d.name,
      value: String(d.id),
    }))
  }
  catch (err) {
    console.error('Fetch filter divisions error:', err)
  }
  finally {
    loadingFilterDivisions.value = false
  }
}

// 2. Fetch Departments for filter by Division ID
const fetchFilterDepartments = async (divId: string) => {
  if (!divId) {
    filterDepartments.value = []
    return
  }
  loadingFilterDepartments.value = true
  try {
    const depts = await OrgStructureService.getDepartmentsByDivision(divId)
    filterDepartments.value = depts.map(d => ({
      title: d.name,
      value: String(d.id),
    }))
  }
  catch (err) {
    console.error('Fetch filter departments error:', err)
    filterDepartments.value = []
  }
  finally {
    loadingFilterDepartments.value = false
  }
}

// 3. Fetch Positions for filter by Department ID or Division ID
const fetchFilterPositions = async (divId: string, deptId?: string) => {
  if (!divId && !deptId) {
    filterPositions.value = []
    return
  }
  loadingFilterPositions.value = true
  try {
    let posList: any[] = []
    if (deptId) {
      posList = await OrgStructureService.getPositionsByDepartment(deptId)
    }
    else if (divId) {
      posList = await OrgStructureService.getPositionsByDivision(divId)
    }

    filterPositions.value = posList.map(p => ({
      title: p.title,
      value: String(p.id),
    }))
  }
  catch (err) {
    console.error('Fetch filter positions error:', err)
    filterPositions.value = []
  }
  finally {
    loadingFilterPositions.value = false
  }
}

// Handle Filter Division Change
const handleFilterDivisionChange = async (newDivId: string) => {
  filterDepartmentId.value = ''
  filterPositionId.value = ''
  filterDepartments.value = []
  filterPositions.value = []

  if (newDivId) {
    await Promise.all([
      fetchFilterDepartments(newDivId),
      fetchFilterPositions(newDivId),
    ])
  }
}

// Handle Filter Department Change
const handleFilterDepartmentChange = async (newDeptId: string) => {
  filterPositionId.value = ''
  if (newDeptId) {
    await fetchFilterPositions(filterDivisionId.value, newDeptId)
  }
  else if (filterDivisionId.value) {
    await fetchFilterPositions(filterDivisionId.value)
  }
}

// Safely extract division name
const getDivisionName = (respItem: any) => {
  const item = respItem?.raw || respItem
  return item?.position?.division?.name
    || item?.position?.organizationUnit?.parent?.name
    || item?.position?.organizationUnit?.name
    || '-'
}

// Safely extract position title
const getPositionTitle = (respItem: any) => {
  const item = respItem?.raw || respItem
  return item?.position?.title || '-'
}

// Navigate to Activity list for this Responsibility
const goToActivities = (id: string) => {
  router.push(`/master-data/tanggung-jawab/${id}/aktivitas`)
}

onMounted(() => {
  fetchFilterDivisions()
})
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
            icon="tabler-list-details"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Tanggung Jawab
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Kelola master data tanggung jawab berdasarkan divisi dan fungsi posisi jabatan
          </span>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 Simple Clean Filter Card (Standard Vuexy Pattern) -->
    <VCard class="mb-6">
      <VCardItem class="pb-2">
        <VCardTitle class="text-subtitle-1 font-weight-semibold">
          Filter Data
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 1. Select Divisi -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppAutocomplete
              v-model="filterDivisionId"
              :items="filterDivisions"
              :loading="loadingFilterDivisions"
              label="Select Divisi"
              placeholder="Semua Divisi"
              clearable
              @update:model-value="handleFilterDivisionChange"
            />
          </VCol>

          <!-- 2. Select Bagian -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppAutocomplete
              v-model="filterDepartmentId"
              :items="filterDepartments"
              :loading="loadingFilterDepartments"
              :disabled="!filterDivisionId"
              label="Select Bagian"
              placeholder="Semua Bagian"
              clearable
              @update:model-value="handleFilterDepartmentChange"
            />
          </VCol>

          <!-- 3. Select Fungsi -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppAutocomplete
              v-model="filterPositionId"
              :items="filterPositions"
              :loading="loadingFilterPositions"
              :disabled="!filterDivisionId"
              label="Select Fungsi"
              placeholder="Semua Fungsi"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 👉 Data Table Card -->
    <VCard :loading="isLoading">
      <VCardText class="d-flex flex-wrap py-4 gap-4 align-center">
        <!-- Items Per Page -->
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
              placeholder="Cari tanggung jawab..."
              density="compact"
            />
          </div>

          <!-- 👉 Export Excel Button -->
          <VBtn
            color="success"
            variant="tonal"
            prepend-icon="tabler-file-spreadsheet"
            :loading="isExporting"
            @click="exportData"
          >
            Export Excel
          </VBtn>

          <!-- 👉 Add Responsibility Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Tambah Tanggung Jawab
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="responsibilities"
        :items-length="totalResponsibilities"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- 1. Kode TJU -->
        <template #item.code="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.code || item.code || '-' }}
          </span>
        </template>

        <!-- 2. Division Name -->
        <template #item.division="{ item }">
          <span>{{ getDivisionName(item) }}</span>
        </template>

        <!-- 3. Position Title -->
        <template #item.position.title="{ item }">
          <span>{{ getPositionTitle(item) }}</span>
        </template>

        <!-- 4. Name -->
        <template #item.name="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.name || item.name || '-' }}
          </span>
        </template>

        <!-- 5. Activities Count (Plain Number Only) -->
        <template #item.activitiesCount="{ item }">
          <span>
            {{ (item.raw?.activities?.length || item.activities?.length || 0) }}
          </span>
        </template>

        <!-- 6. Status -->
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

        <!-- 7. Actions -->
        <template #item.actions="{ item }">
          <!-- IconBtn for Lihat Aktivitas -->
          <IconBtn
            title="Lihat Aktivitas"
            @click="goToActivities(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-list-check" />
          </IconBtn>

          <IconBtn
            title="Edit Tanggung Jawab"
            @click="selectData(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn
            title="Hapus Tanggung Jawab"
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
              {{ paginationMeta({ page, itemsPerPage }, totalResponsibilities) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalResponsibilities / itemsPerPage) || 1"
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

    <!-- 👉 Add/Edit Drawer -->
    <AddNewResponsibilityDrawer
      v-model:isDrawerOpen="isAddNewDrawerVisible"
      v-model:responsibility-data="detailData"
      @submit="submitProcess"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Apakah Anda yakin ingin menghapus tanggung jawab ini beserta seluruh aktivitas turunannya?"
      confirm-title="Terhapus!"
      confirm-msg="Tanggung jawab telah berhasil dihapus."
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
