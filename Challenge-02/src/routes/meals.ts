import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserExists } from '../middlewares/check-user-exists'

export async function MealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkUserExists] }, async (req, res) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      moment: z.coerce.date(),
      on_diet: z.boolean(),
    })
    const { userId } = req.cookies
    const { name, description, moment, on_diet } = createMealSchema.parse(req.body)
    const result = await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      moment: moment.toISOString(),
      on_diet,
      user_id: userId
    }).returning('*')
    return res.status(201).send({ result })
  })

  app.put('/:id', { preHandler: [checkUserExists] }, async (req, res) => {
    let { userId } = req.cookies
    const getMealsUpdateParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealsUpdateParamsSchema.parse(req.params)
    const meal = await knex('meals').where({
      'id': id,
      'user_id': userId
    }).first()
    if (!meal) {
      return res.status(404).send()
    }
    if (meal.user_id !== userId) {
      return res.status(403).send()
    }
    const updateMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      moment: z.coerce.date(),
      on_diet: z.boolean(),
    })
    const { name, description, moment, on_diet } = updateMealSchema.parse(req.body)
    await knex('meals').update({
      name,
      description,
      moment: moment.toISOString(),
      on_diet
    }).where({
      'id': id,
      'user_id': userId
    })
    return res.status(204).send()
  })

  app.delete('/:id', { preHandler: [checkUserExists] },async (req, res) => {
    let { userId } = req.cookies
    const getMealsDeleteParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealsDeleteParamsSchema.parse(req.params)
    const meal = await knex('meals').where({
      'id': id,
      'user_id': userId
    }).first()
    if (!meal) {
      return res.status(404).send()
    }
    if (meal.user_id !== userId) {
      return res.status(403).send()
    }
    await knex('meals').delete().where({
      'id': id,
      'user_id': userId
    })
    return res.status(204).send()
  })

  app.get('/', { preHandler: [checkUserExists] },async (req, res) => {
    const { userId } = req.cookies
    const meals = await knex('meals').where({
      'user_id': userId
    }).select()
    return res.status(200).send({ meals })
  })

  app.get('/:id', { preHandler: [checkUserExists] },async (req, res) => {
    const { userId } = req.cookies
    const getMealDetailedParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getMealDetailedParamsSchema.parse(req.params)
    const meal = await knex('meals').where({
      'id': id,
      'user_id': userId
    }).first()
    return res.status(200).send({ meal })
  })
}