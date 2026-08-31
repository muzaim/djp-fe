<script setup lang="ts">
import logoMedium from '@images/logo-medium.svg?raw'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'

// import { RecaptchaV2 } from 'vue3-recaptcha-v2'
definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

// const isReCapthca = ref(false)
const isPasswordVisible = ref(false)
const isSnackbarVisible = ref(false)
const snackBarText = ref('')
const snackBarColour = ref('')
const route = useRoute()
const router = useRouter()

const ability = useAbility()

const errors = ref<Record<string, string | undefined>>({
  username: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()

const credentials = ref({
  username: '',
  password: '',
})

/*
const handleWidgetId = (widgetId: number) => {
  console.log('Widget ID: ', widgetId)
}

const handleErrorCalback = () => {
  console.log('Error callback')
  isReCapthca.value = false
}

const handleExpiredCallback = () => {
  console.log('Expired callback')
  isReCapthca.value = false
}

const handleLoadCallback = (response: unknown) => {
  console.log('Load callback', response)
  isReCapthca.value = true
} */

const login = async () => {
  try {
    const formData = new FormData()

    const userDataInput: any = {
      username: credentials.value.username,
      password: credentials.value.password,
    }

    const jsonData = await JSON.stringify(userDataInput)
    const encryptedData = await encryptMessage(jsonData)

    console.log(encryptedData)
    formData.append('encryptedMessage', encryptedData)

    const res = await $api('/auth/login', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(res)

    const { accessToken, userData, userAbilityRules } = res

    useCookie('userAbilityRules').value = userAbilityRules
    ability.update(userAbilityRules)

    useCookie('userData').value = userData
    useCookie('accessToken').value = accessToken

    // Redirect to `to` query if exist or redirect to index route
    // ❗ nextTick is required to wait for DOM updates and later redirect
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  catch (err) {
    console.error(err)
    snackBarText.value = 'Failed, Please check your username and password'
    snackBarColour.value = 'error'
    isSnackbarVisible.value = true

    return false
  }
}

const loginv2 = async () => {
  console.log('masukk')

  const userData = {
    id: 387,
    username: 'helpdesk.ti',
    email: 'helpdesk.ti@smf-indonesia.co.id',
    name: 'Helpdesk TI',
    phone: null,
    support_group_id: 4,
    divisi_id: 8,
    support_level: 'L0',
    avatar: '/images/avatars/avatar-1.png',
    role: 'users',
    roles_id: '1',
  }

  const userAbilityRules = [
    {
      action: 'manage',
      subject: 'all',
    },
  ]

  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mzg3LCJ1c2VybmFtZSI6ImhlbHBkZXNrLnRpIiwiZW1haWwiOiJoZWxwZGVzay50aUBzbWYtaW5kb25lc2lhLmNvLmlkIiwibmFtZSI6IkhlbHBkZXNrIFRJIiwicGhvbmUiOm51bGwsInN1cHBvcnRfZ3JvdXBfaWQiOjQsImRpdmlzaV9pZCI6OCwic3VwcG9ydF9sZXZlbCI6IkwwIiwiYXZhdGFyIjoiL2ltYWdlcy9hdmF0YXJzL2F2YXRhci0xLnBuZyIsInJvbGUiOiJ1c2VycyIsImlhdCI6MTcyNDIxNTA2MywiZXhwIjoxNzI0MjE2ODYzfQ.8-RmPfUpAJPY7GlBMWWkNe9IWYs_9Q1azw2g4cb1YhE'

  useCookie('userAbilityRules').value = JSON.stringify(userAbilityRules)
  ability.update(userAbilityRules)

  useCookie('userData').value = JSON.stringify(userData)
  useCookie('accessToken').value = JSON.stringify(accessToken)

  // Redirect to `to` query if exist or redirect to index route
  // ❗ nextTick is required to wait for DOM updates and later redirect

  await nextTick(() => {
    router.replace(route.query.to ? String(route.query.to) : '/')
  })
}

const onSubmit = () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid)

        // login()
      // user loginv2 to by pass username & password validation
        loginv2()
    })
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />
      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card pa-4"
        max-width="448"
      >
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex">
              <VNodeRenderer :nodes="h('div', { innerHTML: logoMedium })" />
            </div>
          </template>
        </VCardItem>

        <VCardText class="pt-1">
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.username"
                  autofocus
                  label="Username"
                  placeholder="username"
                  type="text"
                  :rules="[requiredValidator]"
                  :error-messages="errors.username"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!--
                  <div class="d-flex align-center justify-space-between flex-wrap mt-2 mb-4">
                  <RecaptchaV2
                  @widget-id="handleWidgetId"
                  @error-callback="handleErrorCalback"
                  @expired-callback="handleExpiredCallback"
                  @load-callback="handleLoadCallback"
                  />
                  </div>
                -->
                <br>
                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                >
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
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
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
