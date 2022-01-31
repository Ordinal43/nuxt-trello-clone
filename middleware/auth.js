export default ({ store, route, redirect }) => {
  const user = store.getters.getUser
  if (route.path === '/auth/login') {
    if (user) {
      return redirect('/')
    }
  } else if (!user) {
    return redirect('/auth/login')
  }
}
