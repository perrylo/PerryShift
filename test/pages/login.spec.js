import { mount } from '@vue/test-utils'
import loginPage from '@/pages/index.vue'

describe('Login page', () => {

  const mockRouter = Object.freeze({
    push: jest.fn()
  })
  const mockStore = Object.freeze({
    commit: jest.fn(),
  })
  const mockFireModule = Object.freeze({
    auth: jest.fn(() => ({
      currentUser: {
        getIdTokenResult: () => Promise.resolve({claims:{}})
      }
    }))
  })

  describe('HTML', () => {
    const wrapper = mount(loginPage)

    it('has an email field', () => {
      expect(wrapper.findComponent('[label="Email"]').exists()).toBeTruthy()
    })

    it('has a password field', () => {
      expect(wrapper.findComponent('[label="Password"]').exists()).toBeTruthy()
    })

    it('should show a message when failing to log in', () => {
      wrapper.vm.handleFailedLogin('Mock error')

      expect(wrapper.findComponent('v-snackbar').isVisible()).toBe(true)
    })
  })

  describe('Successful login', () => {
    it('should redirect regular users to view schedule', async () => {
        const mockStoreRegularUser = {
          ...mockStore,
          getters: { isAdmin:false }
        }
        const wrapper = mount(loginPage, {
          mocks: {
            $router: mockRouter,
            $fireModule: mockFireModule,
            $store: mockStoreRegularUser
          }
        })
        await wrapper.vm.handleSuccessfulLogin({})

        expect(mockRouter.push).toHaveBeenCalledTimes(1)
        expect(mockRouter.push).toHaveBeenCalledWith('/viewSchedule')
      })

    it('should redirect admin users to users list', async () => {
      const mockStoreRegularUser = {
        ...mockStore,
        getters: { isAdmin:true }
      }
      const wrapper = mount(loginPage, {
        mocks: {
          $router: mockRouter,
          $fireModule: mockFireModule,
          $store: mockStoreRegularUser
        }
      })
      await wrapper.vm.handleSuccessfulLogin({})

      expect(mockRouter.push).toHaveBeenCalledTimes(2)
      expect(mockRouter.push).toHaveBeenCalledWith('/users')
    })
  })
})
