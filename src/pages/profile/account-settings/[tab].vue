<script lang="ts" setup>
import AccountSettingsAccount from '@/views/profile/account-settings/AccountSettingsAccount.vue'
import AccountSettingsSecurity from '@/views/profile/account-settings/AccountSettingsSecurity.vue'

const route = useRoute('profile-account-settings-tab')

const activeTab = computed({
  get: () => route.params.tab,
  set: () => route.params.tab,
})

// tabs
const tabs = [
  { title: 'Account', icon: 'tabler-users', tab: 'account' },
  { title: 'Password', icon: 'tabler-lock', tab: 'security' },

  // { title: 'History', icon: 'tabler-history', tab: 'notification' },
]

definePage({
  meta: {
    navActiveLink: 'profile-account-settings-tab',
  },
})
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        :to="{ name: 'profile-account-settings-tab', params: { tab: item.tab } }"
      >
        <VIcon
          size="20"
          start
          :icon="item.icon"
        />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VWindow
      v-model="activeTab"
      class="mt-6 disable-tab-transition"
      :touch="false"
    >
      <!-- Account -->
      <VWindowItem value="account">
        <AccountSettingsAccount />
      </VWindowItem>

      <!-- Security -->
      <VWindowItem value="security">
        <AccountSettingsSecurity />
      </VWindowItem>

      <!-- Notification -->
      <!--
        <VWindowItem value="notification">
        <AccountSettingsNotification />
        </VWindowItem>
      -->
    </VWindow>
  </div>
</template>
