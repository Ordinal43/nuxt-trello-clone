import Cookie from 'js-cookie'
import JWTDecode from 'jwt-decode'
import cookieparser from 'cookieparser'

const state = () => ({
  user: null,
  error: null
})

const getters = {
  getUser (state) {
    return state.user
  },
  getError (state) {
    return state.error
  }
}

const mutations = {
  setUser (state, user) {
    state.user = user
  },
  setError (state, error) {
    state.error = error
  }
}

const actions = {
  async nuxtServerInit ({ commit, dispatch }, { req, res }) {
    // Make auth user object available on server side
    if (res && res.locals && res.locals.user) {
      const { allClaims: claims, ...authUser } = res.locals.user
      await dispatch('onAuthStateChangedAction', {
        authUser,
        claims
      })
    }

    // Store auth user on client side with Vuex and cookie
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
        path: '/auth/login'
      })
    } else {
      const token = await authUser.getIdToken()
      const { uid, email } = authUser

      Cookie.set('brello_access_token', token)
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
