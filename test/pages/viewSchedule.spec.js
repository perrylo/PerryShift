import { shallowMount } from '@vue/test-utils'
import viewSchedulePage from '@/pages/viewSchedule.vue'

describe('View Schedule page', () => {
  /*
  const mockStore = Object.freeze({
    commit: jest.fn(),
    getters: {
      authUser: {
        claims: {
          name: 'test name'
        }
      }
    }
  })
  const mockFireModule = Object.freeze({
    auth: jest.fn(() => ({
      currentUser: {
        getIdTokenResult: () => Promise.resolve({claims:{}})
      }
    }))
  })
  */

  const wrapper = shallowMount(viewSchedulePage)
/*
  it('has a calendar view', () => {
    expect(wrapper.findComponent('v-calendar').exists()).toBeTruthy()
  })
*/
})
