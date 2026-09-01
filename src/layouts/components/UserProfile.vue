<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const router = useRouter()
const ability = useAbility()

// TODO: Get type from backend
const userData = useCookie<any>('userData')
const accessToken = useCookie<any>('accessToken')
const userAbilityRules = useCookie<any>('userAbilityRules')

const logout = async () => {
  userData.value = null
  accessToken.value = null
  userAbilityRules.value = null

  // Redirect to login page
  await router.push('/login')

  // Reset ability to initial ability
  ability.update([])
  router.go(0)
}

const downloadManualGuide = () => {
  // Construct the URL to the manual guide file in the public directory
  const manualGuideUrl = `${process.env.BASE_URL}/file/manual.pdf`

  // Create a link element
  const link = document.createElement('a')

  link.href = manualGuideUrl
  link.target = '_blank' // Open in a new tab
  link.download = 'manual-guide.pdf' // Set the filename when downloaded
  document.body.appendChild(link)

  // Trigger the download
  link.click()

  // Cleanup
  document.body.removeChild(link)
}

const userProfileList = [
  { type: 'divider' },
  { type: 'navItem', icon: 'tabler-lock', title: 'Ubah Password', to: { name: 'profile-change-password' } },
  { type: 'divider' },
  { type: 'navItem', icon: 'tabler-help-circle', title: 'FAQ', to: { name: 'profile-faq' } },
  { type: 'divider' },
  { type: 'navItem', icon: 'tabler-logout', title: 'Logout', onClick: logout },
]
</script>

<template>
  <VBadge
    v-if="userData"
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      size="34"
      color="primary"
      class="me-3"
      style="cursor: pointer"
    >
      <span>{{ avatarText(userData.name) }}</span>

      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    size="34"
                    color="primary"
                    class="me-3"
                  >
                    <span>{{ avatarText(userData.name) }}</span>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ userData.name || userData.username }}
            </VListItemTitle>
            <VListItemSubtitle>{{ userData.role }}</VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VListItem @click="downloadManualGuide">
              <template #prepend>
                <VIcon
                  class="me-2"
                  icon="tabler-settings"
                  size="22"
                />
              </template>
              <VListItemTitle>Manual Guide</VListItemTitle>
            </VListItem>

            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                @click="item.onClick && item.onClick()"
              >
                <template #prepend>
                  <VIcon
                    class="me-2"
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
