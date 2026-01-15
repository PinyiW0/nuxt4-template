<script setup lang="ts">
useHead({
  title: '儀表板範本 - Nuxt UI Templates',
  meta: [
    { name: 'description', content: '瀏覽並探索各種 NuxtUI 儀表板範本' },
  ],
})

interface Template {
  title: string
  description: string
  icon: string
  framework: string
  features: Array<{ title: string, icon: string }>
  deploy_links: Array<{ label: string, to: string, target: string, icon: string }>
  links: Array<{ label: string, to: string, target: string, icon: string }>
}

const templates = ref<Template[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Simulating the NuxtUI templates API call
    // In a real scenario, this would be fetched from the NuxtUI API
    const allTemplates: Template[] = [
      {
        title: 'Dashboard',
        description: 'A dashboard template with multi-column layout for building sophisticated admin interfaces.',
        icon: 'i-lucide-bar-chart-big',
        framework: 'nuxt',
        features: [
          { title: 'Works with SaaS template', icon: 'i-lucide-puzzle' },
          { title: 'Charts and date pickers', icon: 'i-lucide-bar-chart-big' },
          { title: 'Multi-column layout', icon: 'i-lucide-columns-3' },
        ],
        deploy_links: [
          {
            label: 'Vercel',
            to: 'https://vercel.com/new/clone?repository-name=dashboard&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fdashboard',
            target: '_blank',
            icon: 'i-simple-icons-vercel',
          },
          {
            label: 'Netlify',
            to: 'https://app.netlify.com/start/deploy?repository=https://github.com/nuxt-ui-templates/dashboard',
            target: '_blank',
            icon: 'i-simple-icons-netlify',
          },
        ],
        links: [
          { label: 'Preview', to: 'https://dashboard-template.nuxt.dev', target: '_blank', icon: 'i-lucide-link' },
          { label: 'GitHub', to: 'https://github.com/nuxt-ui-templates/dashboard', target: '_blank', icon: 'i-simple-icons-github' },
        ],
      },
      {
        title: 'Dashboard',
        description: 'A dashboard template with multi-column layout for building sophisticated admin interfaces.',
        icon: 'i-lucide-bar-chart-big',
        framework: 'vue',
        features: [
          { title: 'Charts and date pickers', icon: 'i-lucide-bar-chart-big' },
          { title: 'Multi-column layout', icon: 'i-lucide-columns-3' },
        ],
        deploy_links: [
          {
            label: 'Vercel',
            to: 'https://vercel.com/new/clone?repository-name=dashboard-vue&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fdashboard-vue',
            target: '_blank',
            icon: 'i-simple-icons-vercel',
          },
          {
            label: 'Netlify',
            to: 'https://app.netlify.com/start/deploy?repository=https://github.com/nuxt-ui-templates/dashboard-vue',
            target: '_blank',
            icon: 'i-simple-icons-netlify',
          },
        ],
        links: [
          { label: 'Preview', to: 'https://dashboard-vue-template.nuxt.dev', target: '_blank', icon: 'i-lucide-link' },
          { label: 'GitHub', to: 'https://github.com/nuxt-ui-templates/dashboard-vue', target: '_blank', icon: 'i-simple-icons-github' },
        ],
      },
      {
        title: 'SaaS',
        description: 'A SaaS template with landing, pricing, docs and blog powered by Nuxt Content.',
        icon: 'i-lucide-cloud',
        framework: 'nuxt',
        features: [
          { title: 'Landing, pricing, docs & blog sections', icon: 'i-lucide-grid-2x2-plus' },
          { title: 'Authentication pages', icon: 'i-lucide-user-round-check' },
          { title: 'YAML content', icon: 'i-simple-icons-yaml' },
        ],
        deploy_links: [
          {
            label: 'Vercel',
            to: 'https://vercel.com/new/clone?repository-name=saas&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fsaas',
            target: '_blank',
            icon: 'i-simple-icons-vercel',
          },
          {
            label: 'Netlify',
            to: 'https://app.netlify.com/start/deploy?repository=https://github.com/nuxt-ui-templates/saas',
            target: '_blank',
            icon: 'i-simple-icons-netlify',
          },
        ],
        links: [
          { label: 'Preview', to: 'https://saas-template.nuxt.dev', target: '_blank', icon: 'i-lucide-link' },
          { label: 'GitHub', to: 'https://github.com/nuxt-ui-templates/saas', target: '_blank', icon: 'i-simple-icons-github' },
        ],
      },
    ]

    // Filter for dashboard-related templates
    templates.value = allTemplates.filter(t =>
      t.title.toLowerCase().includes('dashboard') || t.title.toLowerCase().includes('saas'),
    )
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '載入範本時發生錯誤'
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-16">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
          儀表板範本
        </h1>
        <p class="mb-8 text-xl text-gray-600 dark:text-gray-300">
          使用 NuxtUI 建立專業的儀表板應用程式
        </p>
        <UButton
          to="/"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="返回首頁"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        :title="error"
        icon="i-lucide-alert-circle"
        class="mx-auto max-w-2xl"
      />

      <!-- Templates Grid -->
      <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="(template, index) in templates"
          :key="index"
          class="flex flex-col"
        >
          <template #header>
            <div class="flex items-center gap-3">
              <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <UIcon :name="template.icon" class="size-6 text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ template.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ template.framework === 'nuxt' ? 'Nuxt' : 'Vue' }}
                </p>
              </div>
            </div>
          </template>

          <div class="flex-1">
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {{ template.description }}
            </p>

            <!-- Features -->
            <div class="mb-4 space-y-2">
              <div
                v-for="(feature, featureIndex) in template.features"
                :key="featureIndex"
                class="flex items-center gap-2 text-sm"
              >
                <UIcon :name="feature.icon" class="size-4 text-primary" />
                <span class="text-gray-700 dark:text-gray-300">{{ feature.title }}</span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="space-y-3">
              <!-- Preview and GitHub Links -->
              <div class="flex gap-2">
                <UButton
                  v-for="(link, linkIndex) in template.links"
                  :key="linkIndex"
                  :to="link.to"
                  :target="link.target"
                  :icon="link.icon"
                  size="sm"
                  variant="soft"
                  :label="link.label"
                  class="flex-1"
                />
              </div>

              <!-- Deploy Links -->
              <div class="flex gap-2">
                <UButton
                  v-for="(deployLink, deployIndex) in template.deploy_links"
                  :key="deployIndex"
                  :to="deployLink.to"
                  :target="deployLink.target"
                  :icon="deployLink.icon"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :label="deployLink.label"
                  class="flex-1"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && templates.length === 0" class="py-12 text-center">
        <UIcon name="i-lucide-inbox" class="mx-auto mb-4 size-16 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400">
          目前沒有可用的儀表板範本
        </p>
      </div>
    </div>
  </div>
</template>
