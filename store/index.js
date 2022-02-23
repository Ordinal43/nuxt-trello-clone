import Cookie from 'js-cookie'
import JWTDecode from 'jwt-decode'
import cookieparser from 'cookieparser'

const state = () => ({
  account: null,
  user: {},
  workspaces: [],
  error: null,
  alert: null
})

const getters = {
  getAccount (state) {
    return state.account
  },
  getUser (state) {
    return state.user
  },
  getWorkspaceCollection (state) {
    return state.workspaces
  },
  getError (state) {
    return state.error
  },
  getAlert (state) {
    return state.alert
  }
}

const mutations = {
  SET_ACCOUNT (state, account) {
    state.account = account
  },
  SET_USER (state, user) {
    state.user = user
  },
  SET_WORKSPACE_COLLECTION (state, workspaces) {
    state.workspaces = workspaces
  },
  SET_ERROR (state, error) {
    state.error = error
  },
  SET_ALERT (state, alert) {
    state.alert = alert
  },
  RESET_ALERT_ERROR (state) {
    state.alert = null
    state.error = null
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
      commit('SET_ACCOUNT', {
        uid: decoded.user_id,
        email: decoded.email,
        displayName: decoded.displayName
      })
    }
  },
  async onAuthStateChangedAction (state, { authUser, claims }) {
    if (!authUser) {
      state.commit('SET_ACCOUNT', null)
      this.$router.push({
        path: '/auth/login'
      })
    } else {
      const token = await authUser.getIdToken()
      const { uid, email, displayName } = authUser
      Cookie.set('brello_access_token', token)
      state.commit('SET_ACCOUNT', { uid, email, displayName })
    }
  },
  async fetchUser ({ state, commit }) {
    const docUser = await this.$fire.firestore
      .collection('users')
      .doc(state.account.uid)
      .get()

    if (docUser.exists) {
      commit('SET_USER', docUser.data())
    }
  },
  setUserListener ({ state, commit }) {
    this.$fire.firestore
      .collection('users')
      .doc(state.account.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          commit('SET_USER', doc.data())
        }
      })
  },
  async updateUser ({ state }, user) {
    await this.$fire.firestore
      .collection('users')
      .doc(state.account.uid)
      .set(user)
  },
  async fetchWorkspaceCollection ({ state, commit }) {
    const snapshotWorkspaces = await this.$fire.firestore
      .collection('users')
      .doc(state.account.uid)
      .collection('workspaces')
      .orderBy('title', 'asc')
      .get()

    commit('SET_WORKSPACE_COLLECTION',
      snapshotWorkspaces.docs.map(doc => doc.data())
    )
  },
  setWorkspaceCollectionListener ({ state, commit }) {
    this.$fire.firestore
      .collection('users')
      .doc(state.account.uid)
      .collection('workspaces')
      .orderBy('title', 'asc')
      .onSnapshot((querySnapshot) => {
        commit('SET_WORKSPACE_COLLECTION',
          querySnapshot.docs.map(doc => doc.data())
        )
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
