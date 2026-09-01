<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AddNewUserDrawer from '@/views/user-management/user/AddNewUserDrawer.vue'
import { paginationMeta } from '@api-utils/paginationMeta'

const {
  users,
  totalUsers,
  isLoading,
  searchQuery,
  itemsPerPage,
  page,
  isSnackbarVisible,
  snackBarText,
  snackBarColour,
  isAddNewUserDrawerVisible,
  isConfirmDialogOpen,
  isResetPasswordDialogOpen,
  detailData,
  addData,
  selectData,
  submitProcess,
  updateDeleteData,
  deleteData,
  openResetPasswordDialog,
  resetPassword,
} = useUserManagement()

// Headers matching NestJS User Entity: Name, Email, Division, Position, Role, Actions
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Division', key: 'division' },
  { title: 'Position', key: 'position.title' },
  { title: 'Role', key: 'role' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Safely extract division name using position.division.name
const getDivisionName = (userItem: any) => {
  const item = userItem?.raw || userItem
  return item?.position?.division?.name
    || item?.position?.organizationUnit?.parent?.name
    || item?.position?.organizationUnit?.name
    || '-'
}

// Safely extract position title
const getPositionTitle = (userItem: any) => {
  const item = userItem?.raw || userItem
  return item?.position?.title || '-'
}

// Safely extract role name
const getRoleName = (userItem: any) => {
  const item = userItem?.raw || userItem
  const roleName = item?.userRoles?.[0]?.role?.name
    || (Array.isArray(item?.roles) ? item.roles[0] : item?.roles)
    || item?.userRoles?.[0]?.role?.code
    || item?.role_name

  return roleName || '-'
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
            icon="tabler-users"
          />
        </VAvatar>
        <div>
          <h4 class="text-h5 font-weight-semibold mb-0">
            Daftar User
          </h4>
          <span class="text-subtitle-2 text-disabled">
            Kelola data pengguna, divisi, posisi jabatan, dan hak akses (role) dalam sistem
          </span>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 Data Table Card -->
    <VCard :loading="isLoading">
      <VCardText class="d-flex flex-wrap py-4 gap-4">
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
              placeholder="Search user..."
              density="compact"
            />
          </div>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Add User
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="users"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
      >
        <!-- User Name -->
        <template #item.name="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.raw?.name || item.name || '-' }}
          </span>
        </template>

        <!-- Email -->
        <template #item.email="{ item }">
          <span>{{ item.raw?.email || item.email || '-' }}</span>
        </template>

        <!-- Division -->
        <template #item.division="{ item }">
          <span>{{ getDivisionName(item) }}</span>
        </template>

        <!-- Position -->
        <template #item.position.title="{ item }">
          <span>{{ getPositionTitle(item) }}</span>
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <VChip
            label
            size="small"
            color="primary"
            class="text-capitalize"
          >
            {{ getRoleName(item) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            title="Edit User"
            @click="selectData(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn
            title="Reset Password"
            @click="openResetPasswordDialog(item.raw?.id || item.id)"
          >
            <VIcon icon="tabler-key" />
          </IconBtn>

          <IconBtn
            title="Delete User"
            @click="updateDeleteData(item.raw?.id || item.id); isConfirmDialogOpen = true"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalUsers) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalUsers / itemsPerPage) || 1"
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

    <!-- 👉 Add/Edit User Drawer -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      v-model:user-data="detailData"
      @submit="submitProcess"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Apakah Anda yakin ingin menghapus user ini?"
      confirm-title="Terhapus!"
      confirm-msg="User telah berhasil dihapus."
      cancel-title="Batal"
      cancel-msg="Penghapusan user dibatalkan."
      confirm-btn-text="Ya, Hapus"
      cancel-btn-text="Batal"
      @confirm="deleteData"
    />

    <!-- Confirm Reset Password Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isResetPasswordDialogOpen"
      confirmation-question="Apakah Anda yakin ingin me-reset password user ini menjadi default (12345)?"
      confirm-title="Reset Password!"
      confirm-msg="Password user telah berhasil di-reset menjadi 12345."
      cancel-title="Batal"
      cancel-msg="Reset password dibatalkan."
      confirm-btn-text="Ya, Reset Password"
      cancel-btn-text="Batal"
      @confirm="resetPassword"
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
