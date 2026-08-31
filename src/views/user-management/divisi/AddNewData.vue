<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import { VForm } from 'vuetify/components/VForm'
import type { DataProperties } from '@/views/user-management/divisi/types'

interface Props {
  isDrawerOpen: boolean
  divisiData?: DataProperties
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: DataProperties): void
}

const props = withDefaults(defineProps<Props>(), {
  divisiData: () => ({
    id: '',
    code: '',
    name: '',
    description: '',
    status: '',
  }),
})

const emit = defineEmits<Emit>()
const divisiData = ref<DataProperties>(structuredClone(toRaw(props.divisiData)))

const isFormValid = ref(false)
const refForm = ref<VForm>()

watch(props, () => {
  divisiData.value = structuredClone(toRaw(props.divisiData))
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
  console.log('dsadsa')
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('submit', divisiData.value)
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
              <!-- 👉 Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="divisiData.code"
                  :rules="[requiredValidator]"
                  label="Code"
                />
              </VCol>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="divisiData.name"
                  :rules="[requiredValidator]"
                  label="Name"
                />
              </VCol>

              <!-- 👉 descriptions -->
              <VCol cols="12">
                <AppTextField
                  v-model="divisiData.description"
                  label="Descriptions"
                />
              </VCol>

              <!-- 👉 Status -->

              <VCol cols="12">
                <AppSelect
                  v-model="divisiData.status"
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
