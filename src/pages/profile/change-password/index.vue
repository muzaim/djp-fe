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

// Reactive checklist criteria evaluations
const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowercase = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const hasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword.value))

const passwordRules = [
  (val: string) => !!val || 'Password baru wajib diisi',
  (val: string) => val.length >= 8 || 'Password minimal 8 karakter',
  (val: string) => /[A-Z]/.test(val) || 'Password harus mengandung minimal 1 huruf kapital (A-Z)',
  (val: string) => /[a-z]/.test(val) || 'Password harus mengandung minimal 1 huruf kecil (a-z)',
  (val: string) => /[0-9]/.test(val) || 'Password harus mengandung minimal 1 angka (0-9)',
  (val: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val) || 'Password harus mengandung minimal 1 simbol / karakter khusus',
]

const confirmPasswordValidator = (val: string) => {
  if (!val)
    return 'Konfirmasi password wajib diisi'
  if (val !== newPassword.value)
    return 'Konfirmasi password tidak cocok'

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
  <VRow class="w-100 ma-0">
    <!-- 👉 Left Column: Change Password Form (Equal Width 6 cols) -->
    <VCol
      cols="12"
      md="6"
      class="ps-0"
    >
      <VCard class="pa-2 h-100">
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
                  :rules="passwordRules"
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
                  :rules="[confirmPasswordValidator]"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- Buttons -->
              <VCol
                cols="12"
                class="d-flex gap-4 mt-2"
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

    <!-- 👉 Right Column: Password Rules Guide (Equal Width 6 cols) -->
    <VCol
      cols="12"
      md="6"
      class="pe-0"
    >
      <VCard class="pa-2 h-100">
        <VCardText>
          <div class="d-flex align-center gap-4 mb-6">
            <VAvatar
              size="48"
              color="info"
              variant="tonal"
              class="rounded"
            >
              <VIcon
                size="28"
                icon="tabler-shield-check"
              />
            </VAvatar>
            <div>
              <h4 class="text-h5 font-weight-semibold mb-0">
                Panduan & Aturan Password
              </h4>
              <span class="text-subtitle-2 text-disabled">
                Syarat keamanan password baru
              </span>
            </div>
          </div>

          <p class="text-body-2 mb-4">
            Untuk menjaga keamanan akun Anda, pastikan password baru memenuhi seluruh syarat di bawah ini:
          </p>

          <VList class="py-0">
            <!-- 1. Min 8 Chars -->
            <VListItem class="px-0 py-2">
              <template #prepend>
                <VIcon
                  size="20"
                  class="me-3"
                  :color="hasMinLength ? 'success' : 'secondary'"
                  :icon="hasMinLength ? 'tabler-circle-check-filled' : 'tabler-circle'"
                />
              </template>
              <VListItemTitle :class="hasMinLength ? 'text-success font-weight-medium' : 'text-medium-emphasis'">
                Minimal 8 karakter
              </VListItemTitle>
            </VListItem>

            <!-- 2. Uppercase -->
            <VListItem class="px-0 py-2">
              <template #prepend>
                <VIcon
                  size="20"
                  class="me-3"
                  :color="hasUppercase ? 'success' : 'secondary'"
                  :icon="hasUppercase ? 'tabler-circle-check-filled' : 'tabler-circle'"
                />
              </template>
              <VListItemTitle :class="hasUppercase ? 'text-success font-weight-medium' : 'text-medium-emphasis'">
                Minimal 1 huruf kapital / besar (A-Z)
              </VListItemTitle>
            </VListItem>

            <!-- 3. Lowercase -->
            <VListItem class="px-0 py-2">
              <template #prepend>
                <VIcon
                  size="20"
                  class="me-3"
                  :color="hasLowercase ? 'success' : 'secondary'"
                  :icon="hasLowercase ? 'tabler-circle-check-filled' : 'tabler-circle'"
                />
              </template>
              <VListItemTitle :class="hasLowercase ? 'text-success font-weight-medium' : 'text-medium-emphasis'">
                Minimal 1 huruf kecil (a-z)
              </VListItemTitle>
            </VListItem>

            <!-- 4. Number -->
            <VListItem class="px-0 py-2">
              <template #prepend>
                <VIcon
                  size="20"
                  class="me-3"
                  :color="hasNumber ? 'success' : 'secondary'"
                  :icon="hasNumber ? 'tabler-circle-check-filled' : 'tabler-circle'"
                />
              </template>
              <VListItemTitle :class="hasNumber ? 'text-success font-weight-medium' : 'text-medium-emphasis'">
                Minimal 1 angka (0-9)
              </VListItemTitle>
            </VListItem>

            <!-- 5. Special Character -->
            <VListItem class="px-0 py-2">
              <template #prepend>
                <VIcon
                  size="20"
                  class="me-3"
                  :color="hasSpecialChar ? 'success' : 'secondary'"
                  :icon="hasSpecialChar ? 'tabler-circle-check-filled' : 'tabler-circle'"
                />
              </template>
              <VListItemTitle :class="hasSpecialChar ? 'text-success font-weight-medium' : 'text-medium-emphasis'">
                Minimal 1 simbol / karakter khusus (!@#$%^&*)
              </VListItemTitle>
            </VListItem>
          </VList>
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
