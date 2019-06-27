import { Router } from 'express'
import graphqlHTTP from 'express-graphql'
import { ApiSchema as schema } from './api.schema'
const router = Router()

router.use('/api', graphqlHTTP(async () => ({
  schema,
  graphiql: true
})))

export { router }
