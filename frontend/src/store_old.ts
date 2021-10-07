import { reactive, computed } from 'vue'
import { User } from './types/User'
// state
const state = reactive({
  user: null as User | null
})
export default () => ({
  user: computed(() => state.user)
})