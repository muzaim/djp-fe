<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { VForm } from 'vuetify/components/VForm'

import type { StrukturalProperties } from '@/views/user-management/struktural/types'

interface Props {
  isDrawerOpen: boolean
  strukturalData?: StrukturalProperties
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: StrukturalProperties): void
}

interface SelectOption {
  title: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  strukturalData: () => ({
    id: 0,
    code: '',
    description: '',
    struct_id: '',
  }),
})

const emit = defineEmits<Emit>()

// 👉 List Option
const listStruktural = ref<SelectOption[]>([])

const strukturalData = ref<StrukturalProperties>(structuredClone(toRaw(props.strukturalData)))

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loading = ref(false)
const searchStruktural = ref()

// 👉 Fetching divisi
const fetchStruktural = async (query: string, limit: number) => {
  loading.value = true

  const res = await $api(`admin/master/getallstruktural?page=1&limit=${limit}&orderby=id&term=${query}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  const data = res.data.data

  listStruktural.value = []
  data.forEach((value: any, key: any) => {
    listStruktural.value[key] = { title: value.description, value: value.id }
  })
  loading.value = false

  console.log(listStruktural.value)
}

watch(searchStruktural, query => {
  query && query !== strukturalData.value?.id && fetchStruktural(query, 100)
})

watch(props, () => {
  strukturalData.value = structuredClone(toRaw(props.strukturalData))
})

onMounted(() => {
  fetchStruktural('', 999999)
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('submit', strukturalData.value)
      emit('update:isDrawerOpen', false)
      fetchStruktural('', 100)
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="strukturalData.code"
                  :rules="[requiredValidator]"
                  label="Code"
                  placeholder="Code"
                />
              </VCol>

              <!-- 👉 Username -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="strukturalData.struct_id"
                  v-model:search-input="searchStruktural"
                  :loading="loading"
                  :rules="[requiredValidator]"
                  :items="listStruktural"
                  label="Select Struct"
                  placeholder="Select Struct"
                  hide-no-data
                  hide-selected
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="strukturalData.description"
                  :rules="[requiredValidator]"
                  label="Nama"
                  placeholder="Nama"
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
                  variant="outlined"
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
