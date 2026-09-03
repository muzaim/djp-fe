<script setup lang="ts">
import type { AuditLogItem } from '@/services/types/audit-log.types'

interface Props {
  isDialogVisible: boolean
  auditLogData?: AuditLogItem | null
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  auditLogData: null,
})

const emit = defineEmits<Emit>()

const closeModal = () => {
  emit('update:isDialogVisible', false)
}

const formattedPayload = computed(() => {
  if (!props.auditLogData?.payload)
    return '-'
  try {
    return typeof props.auditLogData.payload === 'string'
      ? JSON.stringify(JSON.parse(props.auditLogData.payload), null, 2)
      : JSON.stringify(props.auditLogData.payload, null, 2)
  }
  catch {
    return String(props.auditLogData.payload)
  }
})

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
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="700"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard class="pa-2">
      <!-- Header Section -->
      <VCardItem class="pb-3">
        <template #title>
          <span class="text-h6 font-weight-semibold d-flex align-center gap-2">
            <VIcon
              icon="tabler-ticket"
              color="primary"
            />
            Detail Audit Log
          </span>
        </template>
        <template #append>
          <IconBtn @click="closeModal">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </template>
      </VCardItem>

      <VDivider />

      <VCardText class="pt-4">
        <VRow>
          <!-- User Email -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              User Email / ID
            </div>
            <div class="font-weight-medium text-high-emphasis">
              {{ props.auditLogData?.userEmail || props.auditLogData?.userId || 'System' }}
            </div>
          </VCol>

          <!-- Waktu Activity -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              Waktu Aktivitas
            </div>
            <div class="font-weight-medium text-high-emphasis">
              {{ formattedDate(props.auditLogData?.createdAt) }}
            </div>
          </VCol>

          <!-- Method & Endpoint -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              Method & Path
            </div>
            <div class="d-flex align-center gap-2">
              <VChip
                size="small"
                label
                :color="resolveMethodColor(props.auditLogData?.method)"
                class="font-weight-bold"
              >
                {{ props.auditLogData?.method || 'N/A' }}
              </VChip>
              <span class="font-weight-medium text-truncate">{{ props.auditLogData?.path || '-' }}</span>
            </div>
          </VCol>

          <!-- Status Code -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              Status Code
            </div>
            <VChip
              size="small"
              label
              :color="resolveStatusColor(props.auditLogData?.statusCode)"
              class="font-weight-bold"
            >
              HTTP {{ props.auditLogData?.statusCode || '200' }}
            </VChip>
          </VCol>

          <!-- IP Address -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              IP Address
            </div>
            <div class="font-weight-medium">
              {{ props.auditLogData?.ipAddress || '-' }}
            </div>
          </VCol>

          <!-- Action / Description -->
          <VCol
            cols="12"
            sm="6"
          >
            <div class="text-caption text-disabled mb-1">
              Action Description
            </div>
            <div class="font-weight-medium text-truncate">
              {{ props.auditLogData?.action || '-' }}
            </div>
          </VCol>

          <!-- User Agent -->
          <VCol cols="12">
            <div class="text-caption text-disabled mb-1">
              User Agent
            </div>
            <div class="text-caption text-truncate bg-var-theme-background pa-2 rounded">
              {{ props.auditLogData?.userAgent || '-' }}
            </div>
          </VCol>

          <!-- Payload JSON -->
          <VCol cols="12">
            <div class="text-caption text-disabled mb-1">
              Request Payload / Detail JSON
            </div>
            <div class="payload-box rounded pa-3 bg-var-theme-background border">
              <pre class="text-caption mb-0 overflow-auto">{{ formattedPayload }}</pre>
            </div>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 justify-end">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="closeModal"
        >
          Tutup
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.payload-box {
  max-block-size: 250px;
  overflow-y: auto;
}
</style>
