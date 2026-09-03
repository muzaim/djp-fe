<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
</script>

<template>
  <VDialog
    :model-value="authStore.isSessionExpiredModalOpen"
    persistent
    max-width="420"
  >
    <VCard class="text-center pa-4">
      <VCardText class="pt-4">
        <VAvatar
          size="64"
          color="warning"
          variant="tonal"
          class="mb-4"
        >
          <VIcon
            size="36"
            icon="tabler-lock-off"
          />
        </VAvatar>

        <h4 class="text-h5 font-weight-bold mb-2">
          Sesi Anda Telah Habis
        </h4>

        <p class="text-body-2 text-medium-emphasis mb-6">
          Sesi login Anda telah berakhir demi alasan keamanan. Silakan login kembali untuk melanjutkan aktivitas Anda.
        </p>

        <VBtn
          block
          color="primary"
          size="large"
          prepend-icon="tabler-logout"
          @click="authStore.handleLogoutConfirm"
        >
          OK, Login Kembali
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
