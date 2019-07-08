import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql'
import { DateType } from '../shared/types'
import { EpisodeService } from '../episode'
import { HostService } from '../host'

// TODO: Figure out a better way to split up types and schemas

const HostType = new GraphQLObjectType({
  name: 'Host',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    episodes: {
      type: EpisodesType,
      resolve: async host => await EpisodeService.getByHostId(host.id)
    }
  })
})

const HostsType = new GraphQLList(HostType)

const EpisodeType = new GraphQLObjectType({
  name: 'Episode',
  fields: () => ({
    id: { type : GraphQLID },
    number: { type : GraphQLInt },
    title: { type : GraphQLString },
    html: { type : GraphQLString },
    description: { type : GraphQLString },
    publishDate: { type : DateType },
    guid: { type : GraphQLString },
    runtime: { type : GraphQLInt },
    hosts: {
      type: HostsType,
      resolve: async episode => await HostService.getByEpisodeId(episode.id)
    }
  })
})

const EpisodesType = new GraphQLList(EpisodeType)

const ApiSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      host: {
        type: HostType,
        args: { id: { type: GraphQLID } },
        resolve: async (source, args) => {
          if (args.id == null) throw new Error('host id is required')
          return await HostService.getById(args.id)
        }
      },
      hosts: {
        type: HostsType,
        resolve: async () => await HostService.getAll()
      },
      episode: {
        type: EpisodeType,
        args: { number: { type: GraphQLInt } },
        resolve: async (source, args) => {
          if (args.number == null) throw new Error('episode number is required')
          return await EpisodeService.getByNumber(args.number)
        }
      },
      episodes: {
        type: EpisodesType,
        resolve: async () => await EpisodeService.getAll()
      }
    }
  })
})

export { ApiSchema }
