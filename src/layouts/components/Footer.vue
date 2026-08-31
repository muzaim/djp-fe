<template>
  <div class="h-100 d-flex align-center justify-space-between">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      V 1.0.0
      &copy;
      {{ new Date().getFullYear() }}
      Copyright
      <VIcon
        icon="tabler-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="https://www.smf-indonesia.co.id/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >PT Sarana Multigriya Finansial (Persero)</a>
    </span>
  </div>
</template>
