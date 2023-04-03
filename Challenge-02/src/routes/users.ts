import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserExists } from '../middlewares/check-user-exists'

export async function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserSchema = z.object({
      name: z.string()
    })
    const { name } = createUserSchema.parse(req.body)
    const result = await knex('users').insert({
      id: randomUUID(),
      name
    }).returning('id')
    const createdUserId = result[0].id
    let userIdInSession = req.cookies.userId
    if (!userIdInSession) {
      res.cookie('userId', createdUserId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      })
    }
    return res.status(201).send({ id: createdUserId })
  })

  app.post('/login',async (req, res) => {
    let { userIdInSession } = req.cookies
    const loginSchema = z.object({
      name: z.string()
    })
    const { name } = loginSchema.parse(req.body)
    const user = await knex('users').where({
      'name': name
    }).first()
    if (!user && !userIdInSession) {
      res.status(404).send()
    } else if (user && !userIdInSession) {
      res.cookie('userId', user.id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      })
    } else if (user && userIdInSession) {
      const userId = user.id
      if (userId !== userIdInSession) {
        res.cookie('userId', user.id, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 // 24 hours
        })
      }
    }
  })

  app.get('/:id/metrics', { preHandler: [checkUserExists] },async (req, res) => {
    const getUserMetricsParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getUserMetricsParamsSchema.parse(req.params)
    const totalRegisteredMeals = await knex('meals').where({
      'user_id': id
    }).count().first()
    const totalRegisteredMealsOnDiet = await knex('meals').where({
      'user_id': id,
      'on_diet': true
    }).count().first()
    const totalRegisteredMealsOutDiet = await knex('meals').where({
      'user_id': id,
      'on_diet': false
    }).count().first()
    const registeredMeals = totalRegisteredMeals ? totalRegisteredMeals.count : 0
    const registeredMealsOnDiet = totalRegisteredMealsOnDiet ? totalRegisteredMealsOnDiet.count : 0
    const registeredMealsOutDiet = totalRegisteredMealsOutDiet ? totalRegisteredMealsOutDiet.count : 0

    const meals = await knex('meals').where({
      'user_id': id
    }).select().orderBy('moment', 'desc')

    const bestSequenceMap = new Map()
    if (meals.length > 0) {
      const bestSequenceSet = new Set(
        meals.map(meal => new Date(meal.moment).toLocaleDateString())
      )
      for (const mealDay of bestSequenceSet.keys()) {
        let sequence = 0
        let maxSequence = 0
        let daySequence = meals
          .filter(ml => new Date(ml.moment).toLocaleDateString() === mealDay)
          .reduce((_, meal) => {
            if (meal.on_diet) {
              ++sequence
              maxSequence = Math.max(maxSequence, sequence)
            } else {
              sequence = 0
            }
            return maxSequence
          }, 0)
        if (daySequence > 0) {
          bestSequenceMap.set(mealDay, daySequence)
        }
      }
    }
    return res.status(200).send({
      registeredMeals,
      registeredMealsOnDiet,
      registeredMealsOutDiet,
      bestSequence: bestSequenceMap.size > 0 ? Object.fromEntries(bestSequenceMap) : null
    })
  })
}