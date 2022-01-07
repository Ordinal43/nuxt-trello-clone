const state = () => ({
  user: null
})

const getters = {
  getUser (state) {
    return state.user
  }
}

const mutations = {
  setUser (state, user) {
    state.user = user
  }
}

const actions = {
  onAuthStateChangedAction (state, { authUser, claims }) {
    if (!authUser) {
      state.commit('setUser', null)
      this.$router.push({
        path: '/auth/applogin'
      })
    } else {
      const { uid, email } = authUser
      state.commit('setUser', { uid, email })
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
