export default ({ store, route, redirect }) => {
  const user = store.getters.getUser
  if (route.path === '/auth/applogin') {
    if (user) {
      return redirect('/')
    }
  } else if (!user) {
    return redirect('/auth/applogin')
  }
}
