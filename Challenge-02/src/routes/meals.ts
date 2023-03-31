import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { z } from 'zod'
import { knex } from '../database'

export async function MealsRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      moment: z.date(),
      on_diet: z.boolean(),
      user_id: z.string().nullable()
    })
    let { userId } = req.cookies
    if (!userId) {
      userId = randomUUID()
      res.cookie('userId', userId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      })
    }
    const { name, description, moment, on_diet, user_id } = createMealSchema.parse(req.body)
    const result = await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      moment: moment.toISOString(),
      on_diet,
      user_id: user_id ?? userId
    }).returning('*')
    return res.status(201).send({ result })
  })
}