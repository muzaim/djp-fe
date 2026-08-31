<script setup lang="ts">
import { computed, ref } from 'vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { DataProperties } from '@/views/data-management/category/types'
import AddDataComponent from '@/views/data-management/sub-category/AddData.vue'
import { paginationMeta } from '@api-utils/paginationMeta'
import * as helperDate from '@/helpers/dateFormatting'

// 👉 Store
const searchQuery = ref('')
const idDelete = ref(0)
const detailData = ref<DataProperties>()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('id')
const orderBy = ref('DESC')
const resDataAll = ref<any>([])
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

const dateFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }

// Headers
const headers = [
  { title: 'No', key: 'index', sortable: false },
  { title: 'User', key: 'user' },
  { title: 'Activity', key: 'activity' },
  { title: 'Time', key: 'created_at' },
]

// 👉 Fetching users
const { data: listData, execute: fetchData } = await useApi<any>(createUrl('activity-log', {
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

const isAddDataComponentVisible = ref(false)
const isConfirmDialogOpen = ref(false)

const formattedDate = (dateString: string): string => helperDate.formattedDate(dateString)

const addData = () => {
  detailData.value = {
    id: '',
    name: '',
    description: '',
    incident_type: '',
    sla: 0,
    status: '',
  }
  isAddDataComponentVisible.value = true
}

// 👉 Add new data or edit data
const submitProcess = async (dataDetail: DataProperties) => {
  const id = (dataDetail.id !== null && dataDetail.id !== undefined) ? dataDetail.id : ''

  if (id === '') {
    delete dataDetail.id
    await $api('activity-log', {
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
    await $api(`data-management/sub-category/${id}`, {
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

const truncateText = (text: string) => {
  return text.length > 50 ? `${text.slice(0, 50)}...` : text
}

const selectData = async (id: number) => {
  const res = await $api(`data-management/sub-category/${id}`, {
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

const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

const formatDate = (inputDate: string, outputFormat: any) => {
  const dateObject = new Date(inputDate)

  return dateObject.toLocaleDateString('en-US', outputFormat)
}

const fetchAllData = async () => {
  await $api('activity-log?sortBy=id&orderBy=DESC&limit=-1&page=1', {
    method: 'GET',
    onResponse({ response }: any) {
      if (response?._data.statusCode === 200 || response?._data.statusCode === 201)
        resDataAll.value = response?._data.data.data
    },

    onResponseError({ response }) {
      console.log(response)
    },
  })
}

const exportToExcel = async () => {
  console.log(resDataAll.value)
  if (resDataAll.value.length === 0)

    return

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  const headernya = ['Tanggal', 'User', 'Activity']

  const headerRow = worksheet.addRow(headernya)

  headerRow.eachCell((cell, index) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD700' },
    }
    cell.font = { bold: true }
  })

  const data = await Promise.all(resDataAll.value.map(async item => {
    return [
      formatDate(item.created_at, dateFormatOptions),
      item.userId.fullname,
      item.activity,
    ]
  }))

  data.forEach(row => {
    worksheet.addRow(row)
  })

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    saveAs(blob, 'Laporan Aktivitas.xlsx')
  })
}

// 👉 Delete data
const deleteData = async (confirm: boolean) => {
  const id = idDelete.value
  if (confirm) {
    await $api(`data-management/sub-category/${id}`, {
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

onMounted(() => {
  fetchAllData()
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
          <!--
            <div style="inline-size: 10rem;">
            <AppTextField
            v-model="searchQuery"
            placeholder="Search"
            density="compact"
            />
            </div>
          -->

          <VBtn
            color="primary"
            @click="exportToExcel"
          >
            Export
          </VBtn>

          <!-- 👉 Add user button -->
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
        <template #item.user="{ item }">
          <span class="font-weight-small">{{ item.userId.fullname }}</span>
        </template>
        <template #item.created_at="{ item }">
          <span class="font-weight-small"> {{ formattedDate(item.created_at) }} </span>
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
    <AddDataComponent
      v-model:isDrawerOpen="isAddDataComponentVisible"
      v-model:category-data="detailData"
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
