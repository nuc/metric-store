const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('../db.json')
const db = low(adapter)

db.defaults({ temp: 0, co2: 0 }).write()

const app = new Koa()
const router = new Router()

app.use(bodyParser())

router.get('/', (ctx, next) => {
  ctx.body = 'Hello from Air Quality Manager'
})

router.get('/latest', (ctx, next) => {
  ctx.body = JSON.stringify(db.getState())
})

router.get('/bot', (ctx, next) => {
  const { temp, co2 } = db.getState()
  ctx.body = `Current CO2 level is ${co2}ppm and temperature is ${temp}℃.`
})

router.post('/bot', (ctx, next) => {
  if (ctx.request.challenge) {
    return (ctx.body = ctx.request.challenge)
  }
  const { temp, co2 } = db.getState()
  ctx.body = `Current CO2 level is ${co2}ppm and temperature is ${temp}℃.`
})

router.get('/post/temp/:temp', ctx => {
  db.set('temp', ctx.params.temp).write()
  ctx.body = 'done'
})

router.get('/post/co2/:co2', ctx => {
  db.set('co2', ctx.params.co2).write()
  ctx.body = 'done'
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(8080)
