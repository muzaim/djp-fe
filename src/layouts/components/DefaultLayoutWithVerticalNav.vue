<script lang="ts" setup>
import { adminMRK, adminTI, checkerDivisi, makerDivisi } from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

// Create a reactive reference to hold the current time
const currentTime = ref('')
const userData = useCookie<any>('userData')
const divisi = ref('Divisi Teknologi Informasi')

// Update the current time every second
const updateTime = () => {
  const now = new Date()
  const timeString = now.toLocaleTimeString()

  // Mengambil bagian pertama waktu hingga sebelum detik
  const timeWithoutSeconds = timeString.slice(0, timeString.lastIndexOf(':'))

  // Mendapatkan AM atau PM
  const amOrPm = now.getHours() >= 12 ? 'PM' : 'AM'

  // Gabungkan waktu tanpa detik dengan AM atau PM
  currentTime.value = `${timeWithoutSeconds} ${amOrPm}`
}

onMounted(() => {
  updateTime()

  const intervalId = setInterval(updateTime, 1000)

  // Membersihkan interval ketika komponen di-unmounted
  onUnmounted(() => clearInterval(intervalId))
})

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

// watching if the fallback state is active and the refLoadingIndicator component is available
watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()

  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })

// !SECTION

let navItems = adminMRK

if (userData.value.roles_id === '1')
  navItems = adminTI
else if (userData.value.roles_id === '2')
  navItems = adminMRK
else if (userData.value.roles_id === '3')
  navItems = makerDivisi
else if (userData.value.roles_id === '4' || userData.value.roles_id === '5' || userData.value.roles_id === '6' || userData.value.roles_id === '7' || userData.value.roles_id === '8' || userData.value.roles_id === '9' || userData.value.roles_id === '10')
  navItems = checkerDivisi
else
  navItems = adminMRK

onMounted(() => {
  console.log(userData.value)

  // fetchDivision()
})
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <NavbarThemeSwitcher />
        <div
          class="ml-4"
          style=" display: flex; justify-content: center; align-items: center;"
        >
          <span>{{ currentTime }}</span>
        </div>

        <VSpacer />
        <div
          class="mr-5"
          style=" display: flex;flex-direction: column; justify-items: center; align-items: end;"
        >
          <span> <span style="font-weight: bold;">{{ userData.name }}</span></span>
          <span>{{ divisi || '-' }}</span>
        </div>

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
      </div>
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->

    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>
    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
