<script setup lang="ts">
import CardAvailableSite from '@/views/pages/CardAvailableSite.vue'

const userData = useCookie<any>('userData')

const CardAvailableData1 = {
  title: 'SIM',
  description: 'Next Generation Frontend Architecture Using Layout Engine And Vue.',
  url: 'https://sim.smf-indonesia.co.id',
}

const CardAvailableData2 = {
  title: 'System Syariah',
  description: 'Next Generation Frontend Architecture Using Layout Engine And Vue.',
  url: 'https://sysya.smf-indonesia.co.id/',
}

const CardAvailableData3 = {
  title: 'HRIS',
  description: 'Next Generation Frontend Architecture Using Layout Engine And Vue.',
  url: 'https://smfhris.smf-indonesia.co.id',
}

const CardAvailableData4 = {
  title: 'OSTS',
  description: 'Next Generation Frontend Architecture Using Layout Engine And Vue.',
  url: 'https://treasury.smf-indonesia.co.id/SSTS/index.jsp',
}

const donutChartColors = {
  donut: {
    series1: '#22A95E',
    series2: '#24B364',
    series3: '#56CA00',
    series4: '#53D28C',
    series5: '#7EDDA9',
    series6: '#A9E9C5',
  },
}

// Donuts Chart Config
const timeSpendingChartConfig = {
  chart: {
    height: 157,
    width: 130,
    parentHeightOffset: 0,
    type: 'donut',
  },
  labels: ['36h', '56h', '16h', '32h', '56h', '16h'],
  colors: [
    donutChartColors.donut.series1,
    donutChartColors.donut.series2,
    donutChartColors.donut.series3,
    donutChartColors.donut.series4,
    donutChartColors.donut.series5,
    donutChartColors.donut.series6,
  ],
  stroke: {
    width: 0,
  },
  dataLabels: {
    enabled: false,
    formatter(val: string) {
      return `${Number.parseInt(val)}%`
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: false,
  },
  grid: {
    padding: {
      top: 0,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '1.5rem',
            color: 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))',
            fontWeight: 500,
            offsetY: -15,
            formatter(val: string) {
              return `${Number.parseInt(val)}%`
            },
          },
          name: {
            offsetY: 20,
          },
          total: {
            show: true,
            fontSize: '.7rem',
            label: 'Total',
            color: 'rgba(var(--v-theme-on-background), var(--v-disabled-opacity))',
            formatter() {
              return '231h'
            },
          },
        },
      },
    },
  },
}

const timeSpendingChartSeries = [23, 35, 10, 20, 35, 23]
</script>

<template>
  <div>
    <VRow class="py-6">
      <!-- 👉 Welcome -->
      <VCol
        cols="12"
        md="8"
        :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'"
      >
        <div class="pe-3">
          <h3 class="text-h3 text-high-emphasis mb-1">
            Welcome back,<span class="font-weight-medium"> {{ userData.name || userData.username }} 👋🏻 </span>
          </h3>

          <div
            class="mb-2 text-wrap"
            style="max-inline-size: 400px;"
          >
            Your progress this week is Awesome. let's keep it up
            and get a lot of points reward!
          </div>

          <div class="d-flex justify-space-between flex-wrap gap-4 flex-column flex-md-row">
            <div
              v-for="{ title, value, icon, color } in [
                { title: 'New', value: '4', icon: 'tabler-ad-2', color: 'primary' },
                { title: 'In Progress', value: '15', icon: 'custom-laptop', color: 'info' },
                { title: 'Resolved', value: '10', icon: 'custom-lightbulb', color: 'warning' },
                { title: 'Pending', value: '1', icon: 'tabler-clock', color: 'secondary' },
                { title: 'Closed', value: '14', icon: 'custom-check', color: 'success' },
              ]"
              :key="title"
            >
              <div class="d-flex">
                <VAvatar
                  variant="tonal"
                  :color="color"
                  rounded
                  size="54"
                  class="text-primary me-4"
                >
                  <VIcon
                    :icon="icon"
                    size="38"
                  />
                </VAvatar>
                <div>
                  <span class="text-base">{{ title }}</span>
                  <h4
                    class="text-h4 font-weight-medium"
                    :class="`text-${color}`"
                  >
                    {{ value }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VCol>

      <!-- 👉 Time Spendings -->
      <VCol
        cols="12"
        md="4"
      >
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex flex-column ps-3">
            <h5 class="text-h5 text-high-emphasis mb-2 text-no-wrap">
              Time Spendings
            </h5>
            <span class="mb-7">Weekly Report</span>
            <div class="text-h3 mb-2">
              231<span class="text-h4 text-medium-emphasis">h</span> 14<span class="text-h4 text-medium-emphasis">m</span>
            </div>
            <div>
              <VChip
                color="success"
                label
              >
                +18.4%
              </VChip>
            </div>
          </div>
          <div>
            <VueApexCharts
              type="donut"
              height="150"
              width="150"
              :options="timeSpendingChartConfig"
              :series="timeSpendingChartSeries"
            />
          </div>
        </div>
      </VCol>

      <VRow class="match-height">
        <!-- 👉 Academy Upcoming Webinar -->
        <VCol
          cols="12"
          md="3"
          sm="6"
        >
          <CardAvailableSite v-model:detail-data="CardAvailableData1" />
        </VCol>
        <!-- 👉 Academy Upcoming Webinar -->
        <VCol
          cols="12"
          md="3"
          sm="6"
        >
          <CardAvailableSite v-model:detail-data="CardAvailableData2" />
        </VCol>
        <!-- 👉 Academy Upcoming Webinar -->
        <VCol
          cols="12"
          md="3"
          sm="6"
        >
          <CardAvailableSite v-model:detail-data="CardAvailableData3" />
        </VCol>
        <!-- 👉 Academy Upcoming Webinar -->
        <VCol
          cols="12"
          md="3"
          sm="6"
        >
          <CardAvailableSite v-model:detail-data="CardAvailableData4" />
        </VCol>
      </VRow>
    </VRow>
  </div>
</template>
