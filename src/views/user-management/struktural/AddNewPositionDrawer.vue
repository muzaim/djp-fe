<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'
import { JobLevelService } from '@/services/job-level.service'
import { PositionService } from '@/services/position.service'

interface Props {
  isDrawerOpen: boolean
  positionData?: any
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
  positionData: null,
})

const emit = defineEmits<Emit>()

const defaultPositionData = {
  id: '',
  title: '',
  organizationUnitId: '',
  jobLevelId: '',
  parentPositionId: null,
}

const listOrgUnits = ref<SelectOption[]>([])
const listJobLevels = ref<SelectOption[]>([])
const listParentPositions = ref<SelectOption[]>([])

const formData = ref<any>({ ...defaultPositionData })

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loadingOrgUnits = ref(false)
const loadingJobLevels = ref(false)
const loadingParents = ref(false)

// Fetch Org Units (Loads all organization units without division filter)
const fetchOrgUnits = async () => {
  loadingOrgUnits.value = true
  try {
    const res = await OrgStructureService.getOrganizationUnits({ limit: 1000 })
    const items = res.data || []

    listOrgUnits.value = items.map(u => ({
      title: u.name,
      value: String(u.id),
    }))
  }
  catch (err) {
    console.error('Fetch org units error:', err)
  }
  finally {
    loadingOrgUnits.value = false
  }
}

// Fetch Job Levels
const fetchJobLevels = async () => {
  loadingJobLevels.value = true
  try {
    const levels = await JobLevelService.getJobLevels()
    listJobLevels.value = levels.map(lvl => ({
      title: `${lvl.name} (${lvl.code})`,
      value: String(lvl.id),
    }))
  }
  catch (err) {
    console.error('Fetch job levels error:', err)
  }
  finally {
    loadingJobLevels.value = false
  }
}

// Fetch parent position candidates
const fetchParentPositions = async () => {
  loadingParents.value = true
  try {
    const res = await PositionService.getPositions({ limit: 1000 })

    listParentPositions.value = res.data
      .filter(p => p.id !== formData.value.id)
      .map(p => ({
        title: p.title,
        value: String(p.id),
      }))
  }
  catch (err) {
    console.error('Fetch parent positions error:', err)
  }
  finally {
    loadingParents.value = false
  }
}

const populateForEdit = async (data: any) => {
  // Safely unwrap detail payload whether raw or nested under data.data
  const itemData = data?.data || data

  if (listJobLevels.value.length === 0)
    await fetchJobLevels()
  if (listOrgUnits.value.length === 0)
    await fetchOrgUnits()

  await fetchParentPositions()

  formData.value = {
    id: itemData.id,
    title: itemData.title || '',
    organizationUnitId: itemData.organizationUnitId || itemData.organizationUnit?.id || '',
    jobLevelId: itemData.jobLevelId || itemData.jobLevel?.id || '',
    parentPositionId: itemData.parentPositionId || itemData.parentPosition?.id || null,
  }
}

watch(
  () => props.positionData,
  async newVal => {
    if (newVal && (newVal.id || newVal.data?.id)) {
      const rawVal = structuredClone(toRaw(newVal))

      await populateForEdit(rawVal)
    }
    else {
      formData.value = { ...defaultPositionData }
      if (listOrgUnits.value.length === 0)
        await fetchOrgUnits()
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await Promise.all([fetchOrgUnits(), fetchJobLevels(), fetchParentPositions()])
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
      title: formData.value.title,
      organizationUnitId: formData.value.organizationUnitId,
      jobLevelId: formData.value.jobLevelId,
      parentPositionId: formData.value.parentPositionId || undefined,
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
      :title="formData.id ? 'Edit Fungsi' : 'Tambah Fungsi'"
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
              <!-- 👉 Title -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.title"
                  :rules="[requiredValidator]"
                  label="Nama Fungsi / Posisi Jabatan"
                  placeholder="Kepala Bagian Perencanaan..."
                />
              </VCol>

              <!-- 👉 Organization Unit -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.organizationUnitId"
                  :loading="loadingOrgUnits"
                  :items="listOrgUnits"
                  :rules="[requiredValidator]"
                  label="Unit Organisasi"
                  placeholder="Pilih Unit Organisasi..."
                  hide-no-data
                />
              </VCol>

              <!-- 👉 Job Level -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.jobLevelId"
                  :loading="loadingJobLevels"
                  :items="listJobLevels"
                  :rules="[requiredValidator]"
                  label="Job Level"
                  placeholder="Pilih Job Level..."
                  hide-no-data
                />
              </VCol>

              <!-- 👉 Parent Position -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.parentPositionId"
                  :loading="loadingParents"
                  :items="listParentPositions"
                  label="Atasan Langsung (Parent Position)"
                  placeholder="Pilih Atasan Langsung (Opsional)..."
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
