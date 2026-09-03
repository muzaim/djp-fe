<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'
import { useMasterStore } from '@/stores/useMasterStore'

interface Props {
  isDrawerOpen: boolean
  responsibilityData?: any
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
  responsibilityData: null,
})

const emit = defineEmits<Emit>()
const masterStore = useMasterStore()

const defaultResponsibilityData = {
  id: '',
  positionId: '',
  code: '',
  name: '',
  isActive: true,
}

const listDivisions = ref<SelectOption[]>([])
const listDepartments = ref<SelectOption[]>([])
const listPositions = ref<SelectOption[]>([])

const selectedDivisionId = ref<string>('')
const selectedDepartmentId = ref<string>('')

const formData = ref<any>({ ...defaultResponsibilityData })

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loadingDivisions = ref(false)
const loadingDepartments = ref(false)
const loadingPositions = ref(false)

// 1. Fetch Divisions (cached via masterStore)
const fetchDivisions = async () => {
  loadingDivisions.value = true
  try {
    const divisions = await masterStore.getDivisions()

    listDivisions.value = divisions.map(div => ({
      title: div.name,
      value: String(div.id),
    }))
  }
  catch (err) {
    console.error('Fetch divisions error:', err)
  }
  finally {
    loadingDivisions.value = false
  }
}

// 2. Fetch Departments by Division ID
const fetchDepartments = async (divisionId: string) => {
  if (!divisionId) {
    listDepartments.value = []

    return
  }

  loadingDepartments.value = true
  try {
    const depts = await OrgStructureService.getDepartmentsByDivision(divisionId)

    listDepartments.value = depts.map(d => ({
      title: d.name,
      value: String(d.id),
    }))
  }
  catch (err) {
    console.error('Fetch departments error:', err)
    listDepartments.value = []
  }
  finally {
    loadingDepartments.value = false
  }
}

// 3. Fetch Positions by Department ID or Division ID
const fetchPositions = async (divisionId: string, departmentId?: string) => {
  if (!divisionId && !departmentId) {
    listPositions.value = []

    return
  }

  loadingPositions.value = true
  try {
    let positions: any[] = []

    if (departmentId)
      positions = await OrgStructureService.getPositionsByDepartment(departmentId)

    else if (divisionId)
      positions = await OrgStructureService.getPositionsByDivision(divisionId)

    listPositions.value = positions.map(pos => ({
      title: pos.title,
      value: String(pos.id),
    }))
  }
  catch (err) {
    console.error('Fetch positions error:', err)
    listPositions.value = []
  }
  finally {
    loadingPositions.value = false
  }
}

// Handler on Division change
const handleDivisionChange = async (newDivId: string) => {
  selectedDepartmentId.value = ''
  formData.value.positionId = ''
  listDepartments.value = []
  listPositions.value = []

  if (newDivId) {
    await Promise.all([
      fetchDepartments(newDivId),
      fetchPositions(newDivId),
    ])
  }
}

// Handler on Department change
const handleDepartmentChange = async (newDeptId: string) => {
  formData.value.positionId = ''
  if (newDeptId)
    await fetchPositions(selectedDivisionId.value, newDeptId)

  else if (selectedDivisionId.value)
    await fetchPositions(selectedDivisionId.value)
}

const populateForEdit = async (data: any) => {
  const itemData = data?.data || data
  const pos = itemData.position || {}

  const divId = pos.division?.id
    || pos.organizationUnit?.parent?.id
    || (pos.organizationUnit?.levelType === 'DIVISION' ? pos.organizationUnit?.id : '')
    || ''

  const isDept = pos.organizationUnit?.levelType === 'DEPARTMENT'
  const deptId = isDept ? pos.organizationUnit?.id : ''
  const posId = itemData.positionId || pos.id || ''

  if (listDivisions.value.length === 0)
    await fetchDivisions()

  selectedDivisionId.value = String(divId || '')
  selectedDepartmentId.value = String(deptId || '')

  if (divId) {
    await fetchDepartments(String(divId))
    await fetchPositions(String(divId), deptId ? String(deptId) : undefined)
  }

  if (posId && !listPositions.value.some(p => p.value === String(posId))) {
    listPositions.value.unshift({
      title: pos.title || 'Selected Position',
      value: String(posId),
    })
  }

  formData.value = {
    id: itemData.id || '',
    positionId: posId ? String(posId) : '',
    code: itemData.code || '',
    name: itemData.name || '',
    isActive: typeof itemData.isActive === 'boolean' ? itemData.isActive : true,
  }
}

watch(
  () => props.responsibilityData,
  async newVal => {
    if (newVal && (newVal.id || newVal.data?.id)) {
      const rawVal = structuredClone(toRaw(newVal))

      await populateForEdit(rawVal)
    }
    else {
      formData.value = { ...defaultResponsibilityData }
      selectedDivisionId.value = ''
      selectedDepartmentId.value = ''
      listDepartments.value = []
      listPositions.value = []
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await fetchDivisions()
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
      positionId: formData.value.positionId,
      code: formData.value.code || undefined,
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
      :title="formData.id ? 'Edit Tanggung Jawab' : 'Tambah Tanggung Jawab'"
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
              <!-- 👉 1. Divisi Select (Mandatory *) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="selectedDivisionId"
                  :loading="loadingDivisions"
                  :items="listDivisions"
                  :rules="[requiredValidator]"
                  label="Divisi *"
                  placeholder="Pilih Divisi..."
                  clearable
                  hide-no-data
                  @update:model-value="handleDivisionChange"
                />
              </VCol>

              <!-- 👉 2. Bagian / Departemen Select (Optional) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="selectedDepartmentId"
                  :loading="loadingDepartments"
                  :items="listDepartments"
                  :disabled="!selectedDivisionId"
                  label="Bagian"
                  placeholder="Pilih Bagian..."
                  clearable
                  hide-no-data
                  @update:model-value="handleDepartmentChange"
                />
              </VCol>

              <!-- 👉 3. Fungsi / Posisi Jabatan Select (Mandatory *) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="formData.positionId"
                  :loading="loadingPositions"
                  :items="listPositions"
                  :rules="[requiredValidator]"
                  :disabled="!selectedDivisionId"
                  label="Fungsi*"
                  placeholder="Pilih Fungsi..."
                  hide-no-data
                />
              </VCol>

              <!-- 👉 4. Kode Tanggung Jawab (Optional) -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.code"
                  label="Kode Tanggung Jawab"
                  placeholder="TJU-001"
                />
              </VCol>

              <!-- 👉 5. Nama Tanggung Jawab (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  :rules="[requiredValidator]"
                  label="Nama Tanggung Jawab *"
                  placeholder="Administrasi Karyawan Join/Resign..."
                />
              </VCol>

              <!-- 👉 6. Status Switch -->
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
