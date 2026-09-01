<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'

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

const defaultOrgUnitData = {
  id: '',
  code: '',
  name: '',
  levelType: 'DIVISION',
  parentId: '',
}

// Level type options translated to Indonesian (Without 'COMPANY')
const levelTypeOptions = [
  { title: 'Direktorat', value: 'DIRECTORATE' },
  { title: 'Divisi', value: 'DIVISION' },
  { title: 'Bagian', value: 'DEPARTMENT' },
]

const listParentOrgUnits = ref<SelectOption[]>([])
const formData = ref<any>({ ...defaultOrgUnitData })

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loadingParents = ref(false)

// Fetch parent candidates from GET /organization-units
const fetchParentCandidates = async () => {
  loadingParents.value = true
  try {
    const res = await OrgStructureService.getOrganizationUnits({ limit: 100 })

    listParentOrgUnits.value = res.data
      .filter(item => item.id !== formData.value.id)
      .map(item => ({
        title: `${item.name} `,
        value: String(item.id),
      }))
  }
  catch (err) {
    console.error('Fetch parent units error:', err)
  }
  finally {
    loadingParents.value = false
  }
}

watch(
  () => props.orgUnitData,
  async newVal => {
    await fetchParentCandidates()
    if (newVal && newVal.id) {
      const rawVal = structuredClone(toRaw(newVal))

      formData.value = {
        ...defaultOrgUnitData,
        ...rawVal,
        parentId: rawVal.parentId || rawVal.parent?.id || '',
      }
    }
    else {
      formData.value = { ...defaultOrgUnitData }
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  fetchParentCandidates()
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
              <!-- 👉 Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.code"
                  :rules="[requiredValidator]"
                  label="Kode Unit"
                  placeholder="DIV-TI"
                />
              </VCol>

              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  :rules="[requiredValidator]"
                  label="Nama Unit"
                  placeholder="Divisi Teknologi Informasi"
                />
              </VCol>

              <!-- 👉 Level Type -->
              <VCol cols="12">
                <AppSelect
                  v-model="formData.levelType"
                  :items="levelTypeOptions"
                  :rules="[requiredValidator]"
                  label="Tipe Level"
                  placeholder="Pilih Tipe Level..."
                />
              </VCol>

              <!-- 👉 Parent Unit -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.parentId"
                  :loading="loadingParents"
                  :items="listParentOrgUnits"
                  label="Induk Unit (Parent)"
                  placeholder="Pilih Induk Unit (Opsional)..."
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
