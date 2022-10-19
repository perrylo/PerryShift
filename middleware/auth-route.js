/* eslint-disable */
export default function (context) {
  const routes = [
    {
      name: 'index',
      requiresAuthentication: false,
      adminOnly: false
    },
    {
      name: 'users',
      requiresAuthentication: true,
      adminOnly: true
    },
    {
      name: 'viewSchedule',
      requiresAuthentication: true,
      adminOnly: false
    },
    {
      name: 'editSchedule',
      requiresAuthentication: true,
      adminOnly: true
    },
  ]

  const { redirect, route, store } = context
  const { isAdmin, isLoggedIn } = store.getters

  const r = routes.find(r => r.name === route.name)

  if (r?.requiresAuthentication && !isLoggedIn) {
    redirect('/')
  }

  if (r?.adminOnly && !isAdmin) {
    redirect('/viewSchedule')
  }

  if (route.name === 'index' && isLoggedIn) {
    if (isAdmin) {
      redirect('/users')
    } else {
      redirect('/viewSchedule')
    }
  }
}
