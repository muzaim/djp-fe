<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'

import { computed, ref } from 'vue'
import AddNewDataDrawer from '@/views/data-management/support-group/AddNewData.vue'
import type { DataProperties } from '@/views/data-management/support-group/types'
import { paginationMeta } from '@api-utils/paginationMeta'

// 👉 Store
const searchQuery = ref('')
const idDelete = ref(0)
const detailData = ref<DataProperties>()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('id')
const orderBy = ref('ASC')

const isSnackbarVisible = ref(false)
const snackBarText = ref('')
const snackBarColour = ref('')

// Update data table options
const updateOptions = (options: any) => {
  page.value = options.page

  if (options.sortBy[0]?.key)
    sortBy.value = options.sortBy[0]?.key
  else
    sortBy.value = 'id'

  if (options.sortBy[0]?.order)
    orderBy.value = options.sortBy[0]?.order.toUpperCase()
  else
    orderBy.value = 'ASC'
}

// Headers
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// 👉 Fetching Support Group
const { data: listData, execute: fetchData } = await useApi<any>(createUrl('data-management/support-group', {
  query: {
    term: searchQuery,
    limit: itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const resData = computed(() => listData.value.data.data.map(
  (items: any, index: number) => ({
    ...items,
    index: (page.value - 1) * itemsPerPage.value + index + 1,
  })))

const totalData = computed(() => listData.value.data.totalItems)

const resolveSupportGroupStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

const isAddNewDataDrawerVisible = ref(false)
const isConfirmDialogOpen = ref(false)

const addData = () => {
  detailData.value = {
    id: '',
    name: '',
    description: '',
    status: '',
  }
  isAddNewDataDrawerVisible.value = true
}

// 👉 Add new data or edit data
const submitProcess = async (dataDetail: DataProperties) => {
  const id = (dataDetail.id !== null && dataDetail.id !== undefined) ? dataDetail.id : ''

  if (id === '') {
    delete dataDetail.id
    await $api('data-management/support-group', {
      method: 'POST',
      body: dataDetail,
      onResponseError({ response }) {
        console.log(response)
        snackBarText.value = 'Error, Please check your input or connection'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      },
      onResponse() {
        // Log response
        snackBarText.value = 'Success, Data has been saved!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        setTimeout(() => {
          // refetch Data
          fetchData()
        }, 1000)
      },
    })
  }
  else {
    await $api(`data-management/support-group/${id}`, {
      method: 'PATCH',
      body: dataDetail,
      onResponseError({ response }) {
        console.log(response)
        snackBarText.value = 'Error, Please check your input or connection'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      },
      onResponse() {
        snackBarText.value = 'Success, Data has been changed!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true

        // refetch Data
        fetchData()
      },
    })
  }
}

const selectData = async (id: number) => {
  const res = await $api(`data-management/support-group/${id}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  detailData.value = res.data
}

const updateDeleteData = (id: number) => {
  idDelete.value = id
}

// 👉 Delete data
const deleteData = async (confirm: boolean) => {
  const id = idDelete.value
  if (confirm) {
    await $api(`data-management/support-group/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        console.log(response)
      },
    })
  }

  // refetch Data
  // TODO: Make this async
  fetchData()
  idDelete.value = 0
}
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap py-4 gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 10rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search"
              density="compact"
            />
          </div>

          <!-- 👉 Add Support Group button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addData"
          >
            Add
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="resData"
        :items-length="totalData"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- No -->
        <template #item.no="{ item }">
          <div class="d-flex align-center">
            <div class="d-flex flex-column">
              <span class="font-weight-small">{{ item.index }}</span>
            </div>
          </div>
        </template>

        <!-- Name -->
        <template #item.name="{ item }">
          <span class="font-weight-small">{{ item.name }}</span>
        </template>

        <!-- Description -->
        <template #item.descriptions="{ item }">
          <span class="font-weight-small">
            {{ item.description }}
          </span>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveSupportGroupStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="updateDeleteData(item.id); isConfirmDialogOpen = true">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn @click="selectData(item.id);isAddNewDataDrawerVisible = !isAddNewDataDrawerVisible">
            <VIcon icon="tabler-edit" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalData) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalData / itemsPerPage)"
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
    <!-- 👉 Add New Support Group -->
    <AddNewDataDrawer
      v-model:isDrawerOpen="isAddNewDataDrawerVisible"
      v-model:roles-data="detailData"
      @submit="submitProcess"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogOpen"
      confirmation-question="Are you sure you want to delete this data?"
      confirm-title="Deleted!"
      confirm-msg="Your data has been deleted successfully."
      cancel-title="Cancelled"
      cancel-msg="Data Deletion Cancelled!"
      @confirm="deleteData"
    />
  </section>

  <!-- Snackbar -->
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
@/views/data-management/support-group/types
