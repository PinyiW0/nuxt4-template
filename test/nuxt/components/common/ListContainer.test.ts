import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ListContainer from '~/components/common/ListContainer.vue'

describe('listContainer', () => {
  it('應渲染 slot 內容', async () => {
    const wrapper = await mountSuspended(ListContainer, {
      props: { total: 50, pageSize: 10, page: 1 },
      slots: { default: '<div data-testid="slot-content">表格內容</div>' },
    })

    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true)
  })

  it('應渲染分頁元件', async () => {
    const wrapper = await mountSuspended(ListContainer, {
      props: { total: 50, pageSize: 10, page: 1 },
    })

    // UPagination 應該被渲染
    expect(wrapper.html()).toContain('nav')
  })
})
