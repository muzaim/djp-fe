<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'
import { useMasterStore } from '@/stores/useMasterStore'

interface Props {
  isDrawerOpen: boolean
  userData?: any
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
  userData: null,
})

const emit = defineEmits<Emit>()
const masterStore = useMasterStore()

const defaultUserData = {
  id: '',
  name: '',
  email: '',
  positionId: '',
  roleIds: [] as string[],
  isActive: true,
}

const listDivisions = ref<SelectOption[]>([])
const listPositions = ref<SelectOption[]>([])
const listRoles = ref<SelectOption[]>([])

const selectedDivisionId = ref<string>('')
const userData = ref<any>({ ...defaultUserData })

const isFormValid = ref(false)
const refForm = ref<VForm>()
const loadingDivisions = ref(false)
const loadingPositions = ref(false)
const loadingRoles = ref(false)

// 1. Fetch all divisions using masterStore cache
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

// 2. Fetch positions by Division ID
const fetchPositionsByDivision = async (divisionId: string) => {
  if (!divisionId) {
    listPositions.value = []
    return
  }

  loadingPositions.value = true
  try {
    const positions = await OrgStructureService.getPositionsByDivision(divisionId)

    listPositions.value = positions.map(pos => ({
      title: pos.title,
      value: String(pos.id),
    }))
  }
  catch (err) {
    console.error('Fetch positions by division error:', err)
    listPositions.value = []
  }
  finally {
    loadingPositions.value = false
  }
}

// 3. Fetch roles using masterStore cache
const fetchRoles = async () => {
  loadingRoles.value = true
  try {
    const items = await masterStore.getRoles()

    listRoles.value = items.map((item: any) => ({
      title: item.name || item.code || 'Role',
      value: String(item.id),
    }))
  }
  catch (err) {
    console.error('Fetch roles error:', err)
  }
  finally {
    loadingRoles.value = false
  }
}

// Handle manual user interaction on Division dropdown change
const handleDivisionChange = async (newDivisionId: string) => {
  userData.value.positionId = ''
  await fetchPositionsByDivision(newDivisionId)
}

const populateForEdit = async (data: any) => {
  const currentPos = data.position || {}

  const divId = currentPos.division?.id
    || currentPos.organizationUnit?.parent?.id
    || (currentPos.organizationUnit?.levelType === 'DIVISION' ? currentPos.organizationUnit?.id : '')
    || data.divisionId
    || ''

  const posId = currentPos.id || data.positionId || data.position_id || ''

  // Extract multiple role IDs safely
  let extractedRoleIds: string[] = []
  if (Array.isArray(data.userRoles) && data.userRoles.length > 0) {
    extractedRoleIds = data.userRoles.map((ur: any) => String(ur.roleId || ur.role?.id || ur.id)).filter(Boolean)
  }
  else if (Array.isArray(data.roles) && data.roles.length > 0) {
    extractedRoleIds = data.roles.map((r: any) => String(r.id || r)).filter(Boolean)
  }
  else if (data.roleId) {
    extractedRoleIds = [String(data.roleId)]
  }

  selectedDivisionId.value = String(divId)

  if (listDivisions.value.length === 0)
    await fetchDivisions()
  if (listRoles.value.length === 0)
    await fetchRoles()

  if (divId) {
    await fetchPositionsByDivision(String(divId))
  }

  if (posId && !listPositions.value.some(p => p.value === String(posId))) {
    listPositions.value.unshift({
      title: currentPos.title || 'Selected Position',
      value: String(posId),
    })
  }

  userData.value = {
    id: data.id,
    name: data.name || data.full_name || '',
    email: data.email || '',
    positionId: posId ? String(posId) : '',
    roleIds: extractedRoleIds,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
  }
}

watch(
  () => props.userData,
  async newVal => {
    if (newVal && newVal.id) {
      const rawVal = structuredClone(toRaw(newVal))
      await populateForEdit(rawVal)
    }
    else {
      userData.value = { ...defaultUserData }
      selectedDivisionId.value = ''
      listPositions.value = []
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await Promise.all([fetchDivisions(), fetchRoles()])
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
      id: userData.value.id || undefined,
      name: userData.value.name,
      email: userData.value.email,
      positionId: userData.value.positionId || undefined,
      roleIds: userData.value.roleIds || [],
      isActive: userData.value.isActive,
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
      :title="userData.id ? 'Edit User' : 'Add User'"
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
              <!-- 👉 Full Name (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="userData.name"
                  :rules="[requiredValidator]"
                  label="Full Name *"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email (Mandatory *) -->
              <VCol cols="12">
                <AppTextField
                  v-model="userData.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email *"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Division Select (Optional) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="selectedDivisionId"
                  :loading="loadingDivisions"
                  :items="listDivisions"
                  label="Divisi"
                  placeholder="Pilih Divisi..."
                  clearable
                  hide-no-data
                  @update:model-value="handleDivisionChange"
                />
              </VCol>

              <!-- 👉 Position Select (Optional) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="userData.positionId"
                  :loading="loadingPositions"
                  :items="listPositions"
                  :disabled="!selectedDivisionId"
                  label="Posisi / Struktural"
                  placeholder="Pilih Posisi..."
                  hide-no-data
                />
              </VCol>

              <!-- 👉 Multi-Select Role Hak Akses (Optional - Support 1 or More Roles) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="userData.roleIds"
                  :loading="loadingRoles"
                  :items="listRoles"
                  label="Role Hak Akses"
                  placeholder="Pilih Role (Bisa Lebih Dari 1)..."
                  multiple
                  chips
                  closable-chips
                  hide-no-data
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
