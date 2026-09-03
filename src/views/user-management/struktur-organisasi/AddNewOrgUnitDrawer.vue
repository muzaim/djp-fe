<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'
import { useMasterStore } from '@/stores/useMasterStore'

interface Props {
  isDrawerOpen: boolean
  orgUnitData?: any
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'submit', value: any): void
}

interface SelectOption {
  title: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  orgUnitData: null,
})

const emit = defineEmits<Emit>()
const masterStore = useMasterStore()

const defaultOrgUnitData = {
  id: '',
  code: '',
  name: '',
  levelType: 'DIVISION',
  parentId: null,
}

// Level types excluding COMPANY for user selection
const levelTypeOptions = [
  { title: 'Direktorat', value: 'DIRECTORATE' },
  { title: 'Divisi', value: 'DIVISION' },
  { title: 'Departemen', value: 'DEPARTMENT' },
  { title: 'Seksi', value: 'SECTION' },
]

const listParentUnits = ref<SelectOption[]>([])
const formData = ref<any>({ ...defaultOrgUnitData })

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loadingParents = ref(false)

// Fetch candidates for Parent Unit (using masterStore cache)
const fetchParentCandidates = async () => {
  loadingParents.value = true
  try {
    const items = await masterStore.getOrgUnits()

    listParentUnits.value = items
      .filter(u => u.id !== formData.value.id)
      .map(u => ({
        title: `${u.name}`,
        value: String(u.id),
      }))
  }
  catch (err) {
    console.error('Fetch parent candidates error:', err)
  }
  finally {
    loadingParents.value = false
  }
}

const populateForEdit = async (data: any) => {
  formData.value = {
    id: data.id,
    code: data.code || '',
    name: data.name || '',
    levelType: data.levelType || 'DIVISION',
    parentId: data.parentId || data.parent?.id || null,
  }

  await fetchParentCandidates()
}

watch(
  () => props.orgUnitData,
  async newVal => {
    if (newVal && newVal.id) {
      const rawVal = structuredClone(toRaw(newVal))
      await populateForEdit(rawVal)
    }
    else {
      formData.value = { ...defaultOrgUnitData }
      await fetchParentCandidates()
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await fetchParentCandidates()
})

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
      code: formData.value.code,
      name: formData.value.name,
      levelType: formData.value.levelType,
      parentId: formData.value.parentId || undefined,
    }

    // Invalidate masterStore cache on submit
    masterStore.invalidateCache()

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
      :title="formData.id ? 'Edit Unit Organisasi' : 'Tambah Unit Organisasi'"
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
              <!-- 👉 Code (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.code"
                  :rules="[requiredValidator]"
                  label="Kode Unit *"
                  placeholder="DIV-TI"
                />
              </VCol>

              <!-- 👉 Name (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  :rules="[requiredValidator]"
                  label="Nama Unit *"
                  placeholder="Divisi Teknologi Informasi"
                />
              </VCol>

              <!-- 👉 Level Type (Mandatory *) -->
              <VCol cols="12">
                <AppSelect
                  v-model="formData.levelType"
                  :items="levelTypeOptions"
                  :rules="[requiredValidator]"
                  label="Tipe Level *"
                  placeholder="Pilih Tipe Level..."
                />
              </VCol>

              <!-- 👉 Parent Unit (Optional) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.parentId"
                  :loading="loadingParents"
                  :items="listParentUnits"
                  label="Induk Unit / Parent"
                  placeholder="Pilih Induk Unit..."
                  hide-no-data
                  clearable
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
