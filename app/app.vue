<template>
  <div>
    <NuxtRouteAnnouncer />
    <UApp :toaster="{ position: 'top-right' }">
      <NuxtPage />
    </UApp>
  </div>
</template>
