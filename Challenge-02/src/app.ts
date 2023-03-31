import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { MealsRoutes } from './routes/meals'
import { UsersRoutes } from './routes/users'

export const app = fastify()

app.register(cookie)

app.register(UsersRoutes, {
  prefix: 'users'
})
app.register(MealsRoutes, {
  prefix: 'meals'
})