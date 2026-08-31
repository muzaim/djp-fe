<script lang="ts" setup>
import { VForm } from 'vuetify/components/VForm'
import type { UserDataDetail } from '@/views/incident-management/types'

import avatar1 from '@images/avatars/avatar-14.png'

const props = withDefaults(defineProps<Props>(), {
  userDataDetailInput: () => ({
    id: '',
    username: '',
    email: '',
    fullname: '',
    role_id: '',
    divisi: '',
    divisi_id: '',
    support_group_id: '',
    company: '',
    country: '',
    contact: '',
    status: '',
    avatar: '',
    support_level: '',
  }),
})

interface Props {
  userDataDetailInput?: UserDataDetail
}
interface SelectOption {
  title: string
  value: string
}

const userData = useCookie<any>('userData')
const dataUser = ref([])
const userDataDetailInput = ref<UserDataDetail[]>([])
const searchDivisi = ref()
const refForm = ref<VForm>()
const listDivisi = ref<SelectOption[]>([])
const snackBarText = ref('')
const snackBarColour = ref('')
const isDialogLoading = ref(false)
const isSnackbarVisible = ref(false)
const isDialogVisible = ref(false)
const isFormValid = ref(false)

const accountData = {
  avatarImg: avatar1,
  firstName: 'john',
  lastName: 'Doe',
  email: 'johnDoe@example.com',
  org: 'Pixinvent',
  phone: '+1 (917) 543-9876',
  address: '123 Main St, New York, NY 10001',
  state: 'New York',
  zip: '10001',
  country: 'USA',
  language: 'English',
  timezone: '(GMT-11:00) International Date Line West',
  currency: 'USD',
}

const fetchDivisi = async (query: string, limit: number) => {
  const res = await $api(`user-management/divisi?limit=${limit}&page=1&sortBy=id&orderBy=ASC`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  const data = res.data.data

  listDivisi.value = []
  data.forEach((value: any, key: any) => {
    listDivisi.value[key] = { title: value.name, value: value.id }
  })
}

interface Props {
  userDataDetail?: UserDataDetail
}

const refInputEl = ref<HTMLElement>()

const accountDataLocal = ref(structuredClone(accountData))

// changeAvatar function
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

const fetchUserData = async () => {
  const res = await $api(`user-management/user/${userData.value.id}`, {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  const result = res.data

  userDataDetailInput.value = result
}

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}

watch(searchDivisi, query => {
  query && query !== userData.value?.divisi && fetchDivisi(query, 100)
})

const onSubmit = () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      await $api(`user-management/user/${userData.value.id}`, {
        method: 'PATCH',
        body: userDataDetailInput.value,
        onResponse({ response }: any) {
          if (response?._data.affected === 1 || response?._data.statusCode === 201) {
            snackBarText.value = 'Success, Update Data!'
            snackBarColour.value = 'primary'
            isSnackbarVisible.value = true
            isDialogLoading.value = false

            isDialogVisible.value = false
            fetchUserData()
          }
        },
        onResponseError({ response }) {
          console.log(response)
          snackBarText.value = 'Error, Please check your input & connection!'
          snackBarColour.value = 'error'
          isSnackbarVisible.value = true
          isDialogLoading.value = false
        },
      })
    }
  })
}

onMounted(() => {
  fetchDivisi('', 100)
  fetchUserData()
})
</script>

<template>
  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    transition="scroll-y-reverse-transition"
    location="top end"
    :timeout="2000"
    :color="snackBarColour"
  >
    {{ snackBarText }}
  </VSnackbar>
  <VRow>
    <VCol cols="12">
      <VCard title="Profile Details">
        <!--
          <VCardText class="d-flex">
          <VAvatar
          rounded
          size="100"
          class="me-6"
          :image="accountDataLocal.avatarImg"
          />

          <form class="d-flex flex-column justify-center gap-4">
          <div class="d-flex flex-wrap gap-2">
          <VBtn
          color="primary"
          @click="refInputEl?.click()"
          >
          <VIcon
          icon="tabler-cloud-upload"
          class="d-sm-none"
          />
          <span class="d-none d-sm-block">Upload new photo</span>
          </VBtn>

          <input
          ref="refInputEl"
          type="file"
          name="file"
          accept=".jpeg,.png,.jpg,GIF"
          hidden
          @input="changeAvatar"
          >

          <VBtn
          type="reset"
          color="secondary"
          variant="tonal"
          @click="resetAvatar"
          >
          <span class="d-none d-sm-block">Reset</span>
          <VIcon
          icon="tabler-refresh"
          class="d-sm-none"
          />
          </VBtn>
          </div>

          <p class="text-body-1 mb-0">
          Allowed JPG, GIF or PNG. Max size of 800K
          </p>
          </form>
          </VCardText>
        -->

        <!-- <VDivider /> -->

        <VCardText class="pt-2">
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            class="mt-6"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <AppTextField
                  v-model="userDataDetailInput.fullname"
                  placeholder="John"
                  label="Full name"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userDataDetailInput.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                />
              </VCol>

              <!-- 👉 Organization -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userDataDetailInput.company"
                  label="Organization"
                  placeholder="ThemeSelection"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userDataDetailInput.phone"
                  label="Phone Number"
                  placeholder="+1 (917) 543-9876"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <AppAutocomplete
                  v-model="userDataDetailInput.divisi_id"
                  v-model:search="searchDivisi"
                  :items="listDivisi"
                  prepend-inner-icon="tabler-user"
                  label="Divisi"
                  placeholder="No one assign"
                  hide-no-data
                  hide-selected
                />
              </VCol>

              <!-- 👉 State -->

              <VCol cols="6">
                <AppSelect
                  v-model="userDataDetailInput.country"
                  label="Select Country"
                  placeholder="Select Country"
                  :rules="[requiredValidator]"
                  :items="['USA', 'UK', 'Indonesia', 'Australia']"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn type="submit">
                  Save changes
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
