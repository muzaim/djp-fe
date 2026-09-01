<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
import { AuthService } from '@/services/auth.service'

const refForm = ref<VForm>()
const isFormValid = ref(false)
const isLoading = ref(false)

const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')

const isSnackbarVisible = ref(false)
const snackBarText = ref('')
const snackBarColour = ref('')

const confirmPasswordValidator = (val: string) => {
  if (!val)
    return 'Konfirmasi password wajib diisi'
  if (val !== newPassword.value)
    return 'Password tidak cocok / re-type password salah'

  return true
}

const onSubmit = async () => {
  const { valid } = await refForm.value?.validate() || { valid: false }
  if (!valid)
    return

  isLoading.value = true
  try {
    await AuthService.changePassword({
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    })

    snackBarText.value = 'Password berhasil diubah!'
    snackBarColour.value = 'primary'
    isSnackbarVisible.value = true

    newPassword.value = ''
    confirmPassword.value = ''
    refForm.value?.resetValidation()
  }
  catch (err: any) {
    console.error('Change password error:', err)
    const msg = err?.data?.message || err?.message || 'Gagal mengubah password'
    snackBarText.value = Array.isArray(msg) ? msg.join(', ') : msg
    snackBarColour.value = 'error'
    isSnackbarVisible.value = true
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VRow justify="center">
    <VCol
      cols="12"
      md="8"
      lg="6"
    >
      <VCard class="pa-2">
        <VCardText>
          <div class="d-flex align-center gap-4 mb-6">
            <VAvatar
              size="48"
              color="primary"
              variant="tonal"
              class="rounded"
            >
              <VIcon
                size="28"
                icon="tabler-lock"
              />
            </VAvatar>
            <div>
              <h4 class="text-h5 font-weight-semibold mb-0">
                Ubah Password
              </h4>
              <span class="text-subtitle-2 text-disabled">
                Masukkan password baru Anda di bawah ini
              </span>
            </div>
          </div>

          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- Password Baru -->
              <VCol cols="12">
                <AppTextField
                  v-model="newPassword"
                  label="Password Baru"
                  placeholder="••••••••"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator, (val: string) => val.length >= 5 || 'Password minimal 5 karakter']"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <!-- Ulangi Password Baru -->
              <VCol cols="12">
                <AppTextField
                  v-model="confirmPassword"
                  label="Ulangi Password Baru"
                  placeholder="••••••••"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator, confirmPasswordValidator]"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- Buttons -->
              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn
                  type="submit"
                  :loading="isLoading"
                >
                  Simpan Password
                </VBtn>

                <VBtn
                  type="reset"
                  variant="tonal"
                  color="secondary"
                  @click="newPassword = ''; confirmPassword = ''; refForm?.resetValidation()"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    transition="scroll-y-reverse-transition"
    location="top end"
    :timeout="2500"
    :color="snackBarColour"
  >
    {{ snackBarText }}
  </VSnackbar>
</template>
