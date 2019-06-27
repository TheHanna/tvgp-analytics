import { GraphQLScalarType } from 'graphql'

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date from MySQL',
  serialize(value) {
    return value
  },
  parseValue(value) {
    console.log(`parsing date ${value}`)
    const date = new Date(value)
    console.log(`parsed date to ${date}`)
    return date
  },
  parseLiteral(value) {
    console.log(`parsing literal ${value}`)
    const date = new Date(value)
    console.log(`parsed literal to ${date}`)
    return date
  }
})

export { DateType }
