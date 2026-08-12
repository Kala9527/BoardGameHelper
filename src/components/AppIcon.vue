<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="square"
    stroke-linejoin="miter"
  >
    <path v-if="name === 'home'" d="M3 11 12 3l9 8v9H6v-7h12" />
    <path v-else-if="name === 'dice'" d="M5 4h14v16H5z" />
    <path v-if="name === 'dice'" d="M8 8h.1M12 12h.1M16 16h.1M16 8h.1M8 16h.1" />
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <path v-else-if="name === 'clock'" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v6l4 2" />
    <path v-else-if="name === 'trophy'" d="M7 4h10v4a5 5 0 0 1-10 0V4Zm3 14h4m-2-5v5M5 6H3v2a4 4 0 0 0 4 4M19 6h2v2a4 4 0 0 1-4 4" />
    <path v-else-if="name === 'users'" d="M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm8-1a3 3 0 1 0 0-6M2 21v-2a6 6 0 0 1 12 0v2m1-1h7v-1a5 5 0 0 0-5-5" />
    <path v-else-if="name === 'card'" d="M7 3h10l2 18H5L7 3Zm2 5h6M9 12h6" />
    <path v-else-if="name === 'vote'" d="M5 4h14v8H5zM3 12h18v8H3zm7-4h4" />
    <path v-else-if="name === 'save'" d="M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6" />
    <path v-else-if="name === 'upload'" d="M12 16V4m0 0 5 5m-5-5-5 5M4 20h16" />
    <path v-else-if="name === 'download'" d="M12 4v12m0 0 5-5m-5 5-5-5M4 20h16" />
    <path v-else-if="name === 'trash'" d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    <path v-else-if="name === 'shuffle'" d="M4 7h3l10 10h3M17 7h3m0 0-3-3m3 3-3 3M4 17h3l2-2m8 2h3m0 0-3-3m3 3-3 3" />
    <path v-else-if="name === 'play'" d="M8 5v14l11-7z" />
    <path v-else-if="name === 'pause'" d="M8 5h3v14H8zm5 0h3v14h-3z" />
    <path v-else-if="name === 'eye'" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path v-else-if="name === 'coin'" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-2 6h5M9 12h6m-4 3h3" />
    <path v-else-if="name === 'wheel'" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8m0-12.8L5.6 18.4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
    <path v-else-if="name === 'moon'" d="M19 15.5A8 8 0 0 1 8.5 5 8 8 0 1 0 19 15.5Z" />
    <path v-else-if="name === 'sword'" d="M14 4h6v6L9 21l-6-6L14 4Zm-4 12-2-2m-2 5-3 3" />
    <path v-else-if="name === 'shield'" d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />
    <path v-else-if="name === 'mask'" d="M4 8c4-4 12-4 16 0v6c0 4-3 7-8 7s-8-3-8-7V8Zm4 5h3m2 0h3m-5 4h2" />
    <path v-else d="M4 4h16v16H4z" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>
