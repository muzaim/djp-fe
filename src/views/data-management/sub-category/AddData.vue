<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import { onMounted } from 'vue'
import { VForm } from 'vuetify/components/VForm'
import type { DataProperties } from '@/views/data-management/sub-category/types'

interface Props {
  isDrawerOpen: boolean
  categoryData?: DataProperties
}

interface SelectOption {
  title: string
  value: string
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: DataProperties): void
}

const props = withDefaults(defineProps<Props>(), {
  categoryData: () => ({
    id: '',
    name: '',
    descirption: '',
    category_id: '',
    sla: '',
    status: '',
  }),
})

const emit = defineEmits<Emit>()
const categoryData = ref<DataProperties>(structuredClone(toRaw(props.categoryData)))

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loading = ref(false)
const listCategory = ref<SelectOption[]>([])
const searchCategory = ref()
const selectedTicketType = ref('')

watch(props, () => {
  categoryData.value = structuredClone(toRaw(props.categoryData))
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onChangeCategory = async () => {
  const id = categoryData.value.category_id !== undefined ? categoryData.value.category_id : 0
  if (id !== null) {
    const res = await $api(`data-management/category/${id}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })

    categoryData.value.category_id = res.data?.id.toString()
  }
}

const truncateText = (text: string) => {
  return text.length > 40 ? `${text.slice(0, 40)}...` : text
}

const onChangeIncidentType = async () => {
  categoryData.value.category_id = ''

  const incidentType = selectedTicketType.value !== undefined ? selectedTicketType.value : 0
  if (incidentType !== null) {
    const res = await $api(`data-management/category?sortBy=id&orderBy=ASC&limit=-1&page=1&incident_type=${incidentType}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })

    const data = res.data.data

    listCategory.value = []
    data.forEach((value: any, key: any) => {
      listCategory.value[key] = { title: truncateText(value.name), value: value.id }
    })
    loading.value = false
  }
}

// 👉 Fetching Category
const fetchCategory = async (query: string) => {
  loading.value = true

  const IncidentType = selectedTicketType.value !== undefined ? selectedTicketType.value : 0

  const res = await $api(`data-management/category?limit=10&page=1&sortBy=id&orderBy=ASC&incident_type=${IncidentType}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  const data = res.data.data

  if (data) {
    listCategory.value = []
    data.forEach((value: any, key: any) => {
      listCategory.value[key] = { title: truncateText(value.name), value: value.id }
    })
  }
  loading.value = false
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('submit', categoryData.value)
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}

watch(searchCategory, query => {
  query !== categoryData.value.category_id && fetchCategory(query)
})

onMounted(() => {
  fetchCategory('')
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Form Data"
      @cancel="closeNavigationDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol
                cols="12"
                md="12"
              >
                <AppSelect
                  v-model="selectedTicketType"
                  prepend-inner-icon="tabler-pencil"
                  label=" Ticket Type"
                  placeholder="Ticket Type"
                  :rules="[requiredValidator]"
                  :items="[{ title: 'Incident Request', value: 'Incident' }, { title: 'Service Request', value: 'Request' }]"
                  @update:model-value="onChangeIncidentType"
                />
              </VCol>

              <!--
                <VCol cols="12">
                <AppAutocomplete
                v-model="categoryData.category_id"
                v-model:search="searchCategory"
                :loading="loading"
                :rules="[requiredValidator]"
                :items="listCategory"
                prepend-inner-icon="tabler-category"
                label="Ticket Category"
                placeholder="Ticket Category"
                @update:model-value="onChangeCategory"
                />
                </VCol>
              -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="categoryData.category_id"
                  v-model:search="searchCategory"
                  :rules="[requiredValidator]"
                  :items="listCategory"
                  prepend-inner-icon="tabler-category"
                  label="Ticket Category"
                  placeholder="Ticket Category"
                />
              </VCol>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="categoryData.name"
                  :rules="[requiredValidator]"
                  label="Name"
                  placeholder="Name"
                />
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12">
                <AppTextField
                  v-model="categoryData.description"
                  :rules="[requiredValidator]"
                  label="Description"
                  placeholder="Description"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="categoryData.sla"
                  :rules="[requiredValidator]"
                  label="SLA"
                  placeholder="SLA"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="categoryData.status"
                  label="Select Status"
                  placeholder="Select Status"
                  :rules="[requiredValidator]"
                  :items="[{ title: 'Active', value: 'Active' }, { title: 'Inactive', value: 'Inactive' }]"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
