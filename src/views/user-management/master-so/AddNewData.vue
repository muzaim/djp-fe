<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import type { DataProperties } from '@/views/user-management/master-so/types'

interface Props {
  isDrawerOpen: boolean
  soData?: DataProperties
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: DataProperties): void
}

interface SelectOption {
  title: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  soData: () => ({
    id_msso: '',
    name: '',
    description: '',
    code: '',
    struct_id: '',
  }),
})

const emit = defineEmits<Emit>()
const soData = ref<DataProperties>(structuredClone(toRaw(props.soData)))

const isFormValid = ref(false)
const refForm = ref<VForm>()
const searchParent = ref()
const loading = ref(false)

const listParent = ref<SelectOption[]>([])

watch(props, () => {
  soData.value = structuredClone(toRaw(props.soData))
})

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
      emit('submit', soData.value)
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const fetchParent = async (query: string, limit: number) => {
  loading.value = true

  const res = await $api(`admin/master/getallstruktural?page=1&limit=${limit}&orderby=id&term=${query}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  const data = res.data.data

  console.log(data)
  listParent.value = []
  data.forEach((value: any, key: any) => {
    listParent.value[key] = { title: value.description, value: value.id }
  })
  loading.value = false

  console.log(listParent.value)
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}

onMounted(() => {
  fetchParent('', 100)
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
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="soData.name"
                  :rules="[requiredValidator]"
                  label="Name"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="soData.code"
                  :rules="[requiredValidator]"
                  label="Code"
                />
              </VCol>

              <!-- 👉 descriptions -->
              <VCol cols="12">
                <AppTextField
                  v-model="soData.description"
                  :rules="[requiredValidator]"
                  label="Descriptions"
                />
              </VCol>

              <VCol cols="12">
                <AppAutocomplete
                  v-model="soData.struct_id"
                  v-model:search-input="searchParent"
                  :rules="[requiredValidator]"
                  :loading="loading"
                  :items="listParent"
                  label="Select Parent"
                  placeholder="Select Parent"
                  hide-no-data
                  hide-selected
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
