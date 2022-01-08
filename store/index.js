import Cookie from 'js-cookie'
import JWTDecode from 'jwt-decode'
import cookieparser from 'cookieparser'

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
  nuxtServerInit ({ commit }, { req }) {
    if (process.server && process.static) { return }
    if (!req.headers.cookie) { return }

    const parsed = cookieparser.parse(req.headers.cookie)
    const accessTokenCookie = parsed.brello_access_token

    if (!accessTokenCookie) { return }

    const decoded = JWTDecode(accessTokenCookie)

    if (decoded) {
      commit('setUser', {
        uid: decoded.user_id,
        email: decoded.email
      })
    }
  },
  async onAuthStateChangedAction (state, { authUser, claims }) {
    if (!authUser) {
      state.commit('setUser', null)
      this.$router.push({
        path: '/auth/applogin'
      })
    } else {
      const token = await authUser.getIdToken()
      const { uid, email } = authUser

      Cookie.set('brello_access_token', token)
      state.commit('setUser', { uid, email })

      this.$router.push('/')
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
