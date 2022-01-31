const nonAuthRoutes = [
  '/auth/login',
  '/auth/signup'
]

export default ({ store, route, redirect }) => {
  const user = store.getters.getUser
  if (nonAuthRoutes.includes(route.path)) {
    if (user) {
      return redirect('/')
    }
  } else if (!user) {
    return redirect('/auth/login')
  }
}
