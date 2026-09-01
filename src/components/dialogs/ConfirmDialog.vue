<script setup lang="ts">
interface Props {
  confirmationQuestion: string
  isDialogVisible: boolean
  confirmTitle?: string
  confirmMsg?: string
  cancelTitle?: string
  cancelMsg?: string
  confirmBtnText?: string
  cancelBtnText?: string
}

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'confirm', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmTitle: 'Success!',
  confirmMsg: 'Action completed successfully.',
  cancelTitle: 'Cancelled',
  cancelMsg: 'Action cancelled.',
  confirmBtnText: 'Ya, Lanjutkan',
  cancelBtnText: 'Batal',
})

const emit = defineEmits<Emit>()

const updateModelValue = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const onConfirmation = () => {
  emit('confirm', true)
  updateModelValue(false)
}

const onCancel = () => {
  emit('confirm', false)
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <!-- 👉 Confirm Dialog -->
  <VDialog
    max-width="500"
    :model-value="props.isDialogVisible"
    @update:model-value="updateModelValue"
  >
    <VCard class="text-center px-10 py-6">
      <VCardText>
        <VBtn
          icon
          variant="outlined"
          color="warning"
          class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;"
        >
          <span class="text-5xl">!</span>
        </VBtn>

        <h6 class="text-lg font-weight-medium mb-0">
          {{ props.confirmationQuestion }}
        </h6>
      </VCardText>

      <VCardText class="d-flex align-center justify-center gap-2">
        <VBtn
          variant="elevated"
          color="primary"
          @click="onConfirmation"
        >
          {{ props.confirmBtnText }}
        </VBtn>

        <VBtn
          color="secondary"
          variant="tonal"
          @click="onCancel"
        >
          {{ props.cancelBtnText }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
