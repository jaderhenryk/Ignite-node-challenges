import { knex as knexSetup, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: 'pg',
  connection: env.DATABASE_URL,
  searchPath: ['ignite_node_challenge_02', 'public'],
  migrations: {
    extension: 'ts'
  }
}

export const knex = knexSetup(config)