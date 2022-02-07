import Cookie from 'js-cookie'
import JWTDecode from 'jwt-decode'
import cookieparser from 'cookieparser'

const state = () => ({
  user: null,
  error: null,
  alert: null
})

const getters = {
  getUser (state) {
    return state.user
  },
  getError (state) {
    return state.error
  },
  getAlert (state) {
    return state.alert
  }
}

const mutations = {
  SET_USER (state, user) {
    state.user = user
  },
  SET_ERROR (state, error) {
    state.error = error
  },
  SET_ALERT (state, alert) {
    state.alert = alert
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
      commit('SET_USER', {
        uid: decoded.user_id,
        email: decoded.email,
        displayName: decoded.displayName
      })
    }
  },
  async onAuthStateChangedAction (state, { authUser, claims }) {
    if (!authUser) {
      state.commit('SET_USER', null)
      this.$router.push({
        path: '/auth/login'
      })
    } else {
      const token = await authUser.getIdToken()
      const { uid, email, displayName } = authUser
      Cookie.set('brello_access_token', token)
      state.commit('SET_USER', { uid, email, displayName })
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
