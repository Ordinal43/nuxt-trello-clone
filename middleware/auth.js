export default ({ app, route, redirect }) => {
  if (route.path === '/auth/applogin') {
    if (app.$fire.auth.currentUser) {
      return redirect('/')
    }
  } else if (!app.$fire.auth.currentUser) {
    return redirect('/auth/applogin')
  }
}
