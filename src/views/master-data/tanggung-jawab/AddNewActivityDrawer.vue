<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { VForm } from 'vuetify/components/VForm'

interface Props {
  isDrawerOpen: boolean
  activityData?: any
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  activityData: null,
})

const emit = defineEmits<Emit>()

const defaultActivityData = {
  id: '',
  responsibilityId: '',
  name: '',
  isActive: true,
}

const formData = ref<any>({ ...defaultActivityData })

const isFormValid = ref(false)
const refForm = ref<VForm>()

const populateForEdit = (data: any) => {
  const itemData = data?.data || data

  formData.value = {
    id: itemData.id || '',
    responsibilityId: itemData.responsibilityId || '',
    name: itemData.name || '',
    isActive: typeof itemData.isActive === 'boolean' ? itemData.isActive : true,
  }
}

watch(
  () => props.activityData,
  newVal => {
    if (newVal && (newVal.id || newVal.name)) {
      const rawVal = structuredClone(toRaw(newVal))
      populateForEdit(rawVal)
    }
    else {
      formData.value = { ...defaultActivityData }
    }
  },
  { immediate: true, deep: true },
)

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid, errors }) => {
    if (!valid) {
      console.warn('Form validation failed:', errors)
      return
    }

    const payload = {
      id: formData.value.id || undefined,
      responsibilityId: formData.value.responsibilityId,
      name: formData.value.name,
      isActive: formData.value.isActive,
    }

    emit('submit', payload)
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
      :title="formData.id ? 'Edit Aktivitas' : 'Tambah Aktivitas'"
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
              <!-- 👉 Nama Aktivitas (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  :rules="[requiredValidator]"
                  label="Nama Aktivitas *"
                  placeholder="Melakukan verifikasi berkas karyawan..."
                />
              </VCol>

              <!-- 👉 Status Switch -->
              <VCol cols="12">
                <VSwitch
                  v-model="formData.isActive"
                  label="Status Aktif"
                  color="primary"
                  hide-details
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
