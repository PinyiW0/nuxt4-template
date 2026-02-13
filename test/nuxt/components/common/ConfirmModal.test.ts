import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ConfirmModal from '~/components/common/ConfirmModal.vue'

describe('confirmModal', () => {
  const defaultProps = {
    open: true,
    title: '確認刪除',
    description: '確定要刪除嗎？',
  }

  it('handleCancel 應 emit cancel 並關閉 modal', async () => {
    const wrapper = await mountSuspended(ConfirmModal, { props: defaultProps })
    const vm = wrapper.vm as any

    vm.handleCancel()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('isOpen 應與 open prop 同步', async () => {
    const wrapper = await mountSuspended(ConfirmModal, { props: defaultProps })
    const vm = wrapper.vm as any

    expect(vm.isOpen).toBe(true)
  })

  it('open=false 時 isOpen 應為 false', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      props: { ...defaultProps, open: false },
    })
    const vm = wrapper.vm as any

    expect(vm.isOpen).toBe(false)
  })
})
