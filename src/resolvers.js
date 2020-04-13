const { buildModelInstancesMapping } = require('./utils')
const camelCase = require('camelcase')
const { CONTEXT_KEY } = require('./constants')
const { parseResolveInfo } = require('graphql-parse-resolve-info')
const _ = require('lodash')

function addResolvers (resolvers, models) {
  const modelInstancesMapping = buildModelInstancesMapping(models)
  const resolversGenerated = Object.values(modelInstancesMapping).map(
    model => buildResolver(model, modelInstancesMapping)
  ).filter(x => !_.isEmpty(x))
  resolvers.push(...resolversGenerated)
  return resolvers
}

function buildResolver (model, modelInstancesMapping) {
  const query = {}
  model.queryToGenerate.forEach(method => {
    if (['GET', 'QUERY', 'FETCH', 'BULK_FETCH'].includes(method)) {
      addMethod(query, model, method, modelInstancesMapping)
    }
  })

  const mutation = {}
  model.queryToGenerate.forEach(method => {
    if (['INSERT', 'DELETE', 'UPDATE', 'BULK_INSERT', 'BULK_UPDATE', 'BULK_DELETE'].includes(method)) {
      addMethod(mutation, model, method, modelInstancesMapping)
    }
  })

  const res = {
    Query: query,
    Mutation: mutation
  }

  if (_.isEmpty(res.Query)) {
    delete res.Query
  }

  if (_.isEmpty(res.Mutation)) {
    delete res.Mutation
  }
  return res
}

function addMethod (selection, model, method, modelInstancesMapping) {
  const modelName = model.constructor.name
  if (model.queryToGenerate.includes(method)) {
    selection[`${camelCase(method)}${modelName}`] = async (obj, args, context, info) => {
      args.parsedResolveInfo = parseResolveInfo(info)
      // console.dir(args.parsedResolveInfo, { depth: 5 })
      context[CONTEXT_KEY] = {
        actionName: method,
        modelInstancesMapping: modelInstancesMapping
      }
      await model.before(args, context, info)
      const res = await model[camelCase(method)](args, context, info)
      await model.after(args, context, info)
      return res
    }
  }
}

module.exports = {
  addResolvers
}