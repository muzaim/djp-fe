<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { OrgStructureService } from '@/services/org-structure.service'

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

// Canonical single-key default model
const defaultUserData = {
  id: '',
  name: '',
  email: '',
  phoneNumber: '',
  positionId: '',
  roleId: '',
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

// 1. Fetch all divisions from GET /organization-units/divisions
const fetchDivisions = async () => {
  loadingDivisions.value = true
  try {
    const divisions = await OrgStructureService.getDivisions()

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

// 2. Fetch positions by Division ID from GET /positions/by-division/:divisionId
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

// 3. Fetch roles from GET /roles
const fetchRoles = async () => {
  loadingRoles.value = true
  try {
    const res = await $api('/roles', {
      method: 'GET',
      params: { limit: 100 },
    })

    const payload = res?.data || res
    const items = payload?.items || (Array.isArray(payload) ? payload : [])

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

  if (newDivisionId)
    await fetchPositionsByDivision(newDivisionId)

  else
    listPositions.value = []
}

// Populate user data deterministically when editing using position.division object
const populateUserForEdit = async (user: any) => {
  const divisionId = user.position?.division?.id
    || user.position?.organizationUnit?.parent?.id
    || (user.position?.organizationUnit?.levelType === 'DIVISION' ? user.position?.organizationUnit?.id : '')
    || ''

  const positionId = user.positionId || user.position?.id || ''
  const roleId = user.roleIds?.[0] || user.userRoles?.[0]?.roleId || user.userRoles?.[0]?.role?.id || ''

  // Pre-load divisions & roles if not loaded
  if (listDivisions.value.length === 0)
    await fetchDivisions()

  if (listRoles.value.length === 0)
    await fetchRoles()

  // Pre-fetch positions for division
  if (divisionId)
    await fetchPositionsByDivision(divisionId)

  // Set canonical models
  selectedDivisionId.value = divisionId
  userData.value = {
    id: user.id,
    name: user.name || user.full_name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    positionId,
    roleId,
  }
}

// Watch props.userData for Edit vs Add
watch(
  () => props.userData,
  async newVal => {
    if (newVal && newVal.id) {
      const rawVal = structuredClone(toRaw(newVal))

      await populateUserForEdit(rawVal)
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
      phoneNumber: userData.value.phoneNumber || undefined,
      positionId: userData.value.positionId ? String(userData.value.positionId) : undefined,
      roleId: userData.value.roleId ? String(userData.value.roleId) : undefined,
      isActive: true,
    }

    emit('submit', payload)
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
  if (!val) {
    selectedDivisionId.value = ''
    listPositions.value = []
  }
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="userData.name"
                  :rules="[requiredValidator]"
                  label="Nama Lengkap"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="userData.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                />
              </VCol>

              <!-- 👉 Phone -->
              <!--
                <VCol cols="12">
                <AppTextField
                v-model="userData.phoneNumber"
                label="Phone"
                placeholder="08123456789"
                />
                </VCol>
              -->

              <!-- 👉 Select Division (1st level) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="selectedDivisionId"
                  :loading="loadingDivisions"
                  :items="listDivisions"
                  label="Divisi"
                  placeholder="Select Division first..."
                  hide-no-data
                  clearable
                  @update:model-value="handleDivisionChange"
                />
              </VCol>

              <!-- 👉 Select Position (2nd level based on Division) -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="userData.positionId"
                  :loading="loadingPositions"
                  :items="listPositions"
                  :disabled="!selectedDivisionId"
                  :rules="[requiredValidator]"
                  label="Fungsi"
                  placeholder="Select Position..."
                  hide-no-data
                />
              </VCol>

              <!-- 👉 Select Role -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="userData.roleId"
                  :loading="loadingRoles"
                  :items="listRoles"
                  label="Role"
                  placeholder="Select Role..."
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
