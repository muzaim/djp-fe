<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { paginationMeta } from '@api-utils/paginationMeta'

const {
  roles,
  totalRoles,
  isLoading,
  searchQuery,
  itemsPerPage,
  page,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
} = useRole()

// Read-only Headers for Roles
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Kode Role', key: 'code' },
  { title: 'Nama Role', key: 'name' },
  { title: 'Deskripsi', key: 'description' },
]
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
            icon="tabler-shield-check"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Daftar Role Hak Akses
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Daftar peran dan hak akses pengguna yang terdaftar dalam sistem (Read Only)
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
          <div style="inline-size: 16rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Cari role hak akses..."
              density="compact"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION Read-Only DatatableServer -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="roles"
        :items-length="totalRoles"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- Code -->
        <template #item.code="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.code || item.code || '-' }}
          </span>
        </template>

        <!-- Name as Chip -->
        <template #item.name="{ item }">
          <VChip
            label
            size="small"
            color="primary"
            class="text-capitalize font-weight-medium"
          >
            {{ item.raw?.name || item.name || '-' }}
          </VChip>
        </template>

        <!-- Description -->
        <template #item.description="{ item }">
          <span>{{ item.raw?.description || item.description || '-' }}</span>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalRoles) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalRoles / itemsPerPage) || 1"
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
