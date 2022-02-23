const nonAuthRoutes = [
  '/auth/login',
  '/auth/signup'
]

export default ({ store, route, redirect }) => {
  const account = store.getters.getAccount
  if (nonAuthRoutes.includes(route.path)) {
    if (account) {
      return redirect('/')
    }
  } else if (!account) {
    return redirect('/auth/login')
  }
}
