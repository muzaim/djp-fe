<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import AddNewMasterSODrawer from '@/views/user-management/master-so/AddNewData.vue'
import type { DataProperties } from '@/views/user-management/master-so/types'
import { paginationMeta } from '@api-utils/paginationMeta'

// 👉 Store
const searchQuery = ref('')
const resData = ref<any>([])
const totalData = ref(0)
const idDelete = ref(0)
const masterSOData = ref<DataProperties>()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('ASC')
const orderBy = ref('parent_id')

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
  { title: 'Code', key: 'code' },
  { title: 'Name', key: 'name' },
  { title: 'Parent Name', key: 'struct_name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// 👉 Fetching users
const fetchUser = async () => {
  await $api(`admin/master/getallmasterso?page=${page.value}&limit=${itemsPerPage.value}&orderby=id_msso&term=`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onResponse({ response }: any) {
      if (response._data.statusCode === 200) {
        resData.value = response._data.data.data.map(
          (items: any, index: number) => ({
            ...items,
            index: (page.value - 1) * itemsPerPage.value + index + 1,
          }))
      }
      totalData.value = response._data.data.totalItems
      console.log(resData.value)
    },

    onResponseError({ response }) {
      console.log(response)
    },
  })
}

const isAddNewMasterSODrawerVisible = ref(false)
const isConfirmDialogOpen = ref(false)

const addData = () => {
  masterSOData.value = {
    id_msso: '',
    name: '',
    description: '',
    code: '',
    struct_id: '',
  }
  isAddNewMasterSODrawerVisible.value = true
}

// 👉 Add new data or edit data
const submitProcess = async (dataDetail: any) => {
  const formData = new FormData()

  for (const key in dataDetail) {
    if (Object.hasOwnProperty.call(dataDetail, key))
      formData.append(key, dataDetail[key])
  }

  const id = (dataDetail.id_msso !== null && dataDetail.id_msso !== undefined) ? dataDetail.id_msso : ''

  if (id === '' || Number(id) === 0) {
    try {
      await $api('admin/master/createmasterso', {
        method: 'POST',
        body: formData,
        onResponse(response) {
          console.log(response)
          snackBarText.value = 'Success, Add new data!'
          snackBarColour.value = 'primary'
          isSnackbarVisible.value = true
        },
        onResponseError({ response }) {
          console.log(response)
          snackBarText.value = 'Error, Please check your input & connection!'
          snackBarColour.value = 'error'
          isSnackbarVisible.value = true
        },
      })
    }
    catch (err) {
      console.error(err)
      snackBarText.value = 'Error, Please check your connection!'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true

      return false
    }
  }
  else {
    try {
      await $api(`admin/master/updatemasterso/${id}`, {
        method: 'POST',
        body: formData,
        onResponse(response) {
          console.log(response)
          snackBarText.value = 'Success, Update your data!'
          snackBarColour.value = 'primary'
          isSnackbarVisible.value = true
        },
        onResponseError({ response }) {
          console.log(response)
          snackBarText.value = 'Error, Please check your connection!'
          snackBarColour.value = 'error'
          isSnackbarVisible.value = true
        },
      })
    }
    catch (err) {
      console.error(err)
      snackBarText.value = 'Error, Please check your connection'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true

      return false
    }
  }

  // refetch Data
  fetchUser()
}

const selectData = async (id: number) => {
  const res = await $api(`admin/master/getdetailmasterso/${id}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  masterSOData.value = res.data
}

const updateDeleteData = (id: number) => {
  idDelete.value = id
}

// 👉 Delete data
const deleteData = async (confirm: boolean) => {
  const id = idDelete.value
  if (confirm) {
    await $api(`admin/master/deletemasterso/${id}`, {
      method: 'POST',
      onResponseError({ response }) {
        console.log(response)
      },
    })
  }

  // refetch Data
  // TODO: Make this async
  fetchUser()
  idDelete.value = 0
}

watch(itemsPerPage, () => {
  fetchUser()
})
watch(page, () => {
  fetchUser()
})
watch(searchQuery, () => {
  fetchUser()
})

onMounted(() => {
  fetchUser()
})
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

          <!-- 👉 Add user button -->
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
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="selectData(item.id_msso);isAddNewMasterSODrawerVisible = !isAddNewMasterSODrawerVisible">
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn @click="updateDeleteData(item.id_msso); isConfirmDialogOpen = true">
            <VIcon icon="tabler-trash" />
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
    <!-- 👉 Add New User -->

    <AddNewMasterSODrawer
      v-model:isDrawerOpen="isAddNewMasterSODrawerVisible"
      v-model:so-data="masterSOData"
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
