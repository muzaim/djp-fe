<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AuditLogDetailDialog from '@/views/audit-logs/AuditLogDetailDialog.vue'
import { paginationMeta } from '@api-utils/paginationMeta'

const {
  auditLogs,
  totalAuditLogs,
  isLoading,
  searchQuery,
  itemsPerPage,
  page,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
  isDetailModalOpen,
  detailData,
  selectData,
} = useAuditLog()

// Headers for Audit Logs datatable
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Waktu', key: 'createdAt' },
  { title: 'User Email', key: 'userEmail' },
  { title: 'Method', key: 'method' },
  { title: 'Action / Endpoint', key: 'path' },
  { title: 'Status', key: 'statusCode' },
  { title: 'IP Address', key: 'ipAddress' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const resolveMethodColor = (method?: string) => {
  const m = (method || '').toUpperCase()
  if (m === 'POST') return 'primary'
  if (m === 'GET') return 'info'
  if (m === 'PATCH' || m === 'PUT') return 'warning'
  if (m === 'DELETE') return 'error'
  return 'secondary'
}

const resolveStatusColor = (code?: number | null) => {
  if (!code) return 'secondary'
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'info'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'error'
  return 'secondary'
}

const formattedDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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
            icon="tabler-ticket"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Audit Log / Activity Log
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Kelola dan pantau riwayat aktivitas pengguna serta log transaksi sistem secara real-time
          </span>
        </div>
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
          <div style="inline-size: 16rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Cari user, path, atau action..."
              density="compact"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="auditLogs"
        :items-length="totalAuditLogs"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- Waktu -->
        <template #item.createdAt="{ item }">
          <span class="text-subtitle-2 font-weight-medium">
            {{ formattedDate(item.raw?.createdAt || item.createdAt) }}
          </span>
        </template>

        <!-- User Email -->
        <template #item.userEmail="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.userEmail || item.userEmail || item.raw?.userId || item.userId || 'System' }}
          </span>
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <VChip
            size="small"
            label
            :color="resolveMethodColor(item.raw?.method || item.method)"
            class="font-weight-bold"
          >
            {{ (item.raw?.method || item.method || 'GET').toUpperCase() }}
          </VChip>
        </template>

        <!-- Action / Path -->
        <template #item.path="{ item }">
          <span class="text-subtitle-2 text-truncate max-w-300">
            {{ item.raw?.path || item.path || item.raw?.action || item.action || '-' }}
          </span>
        </template>

        <!-- Status Code -->
        <template #item.statusCode="{ item }">
          <VChip
            size="small"
            label
            :color="resolveStatusColor(item.raw?.statusCode ?? item.statusCode)"
            class="font-weight-medium"
          >
            {{ item.raw?.statusCode ?? item.statusCode ?? 200 }}
          </VChip>
        </template>

        <!-- IP Address -->
        <template #item.ipAddress="{ item }">
          <span class="text-subtitle-2">
            {{ item.raw?.ipAddress || item.ipAddress || '-' }}
          </span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            title="Lihat Detail Log"
            @click="selectData(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalAuditLogs) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalAuditLogs / itemsPerPage) || 1"
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

    <!-- 👉 Detail Log Modal -->
    <AuditLogDetailDialog
      v-model:isDialogVisible="isDetailModalOpen"
      :audit-log-data="detailData"
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

<style scoped>
.max-w-300 {
  display: inline-block;
  max-inline-size: 300px;
}
</style>
