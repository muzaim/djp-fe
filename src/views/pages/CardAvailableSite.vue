<script setup lang="ts">
import girlWithLaptop from '@images/illustrations/laptop-girl.png'

interface DataProperties {
  title: string
  description?: string
  url: string
}

interface Props {
  detailData?: DataProperties
}

const props = withDefaults(defineProps<Props>(), {
  detailData: () => ({
    title: '',
    description: '',
    url: '',
  }),
})

const detailData = ref<DataProperties>(structuredClone(toRaw(props.detailData)))

watch(props, () => {
  detailData.value = structuredClone(toRaw(props.detailData))
})
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-center  align-start pb-0 px-3 pt-3 mb-4 bg-light-primary rounded">
        <VImg
          :src="girlWithLaptop"
          width="145"
          height="140"
        />
      </div>
      <div>
        <h4 class="text-h4 mb-1">
          {{ detailData.title }}
        </h4>
        <span class="text-body-2">{{ detailData.description }}</span>
        <br>
        <span class="text-body-2">URL: {{ detailData.url }}</span>
        <div class="d-flex justify-space-between my-4 flex-wrap">
          <div
            v-for="{ icon, title, value } in [{ icon: 'tabler-book', title: 'User Guide', value: '' }]"
            :key="title"
            class="d-flex gap-x-3 align-center"
          >
            <VAvatar
              color="primary"
              variant="tonal"
              rounded
            >
              <VIcon :icon="icon" />
            </VAvatar>
            <div>
              <h6 class="text-h6 text-high-emphasis">
                {{ title }}
              </h6>
              <div class="text-sm">
                {{ value }}
              </div>
            </div>
          </div>
        </div>
        <VBtn
          block
          :href="detailData.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go To Site
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
