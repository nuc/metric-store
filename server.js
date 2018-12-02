const { BOT_ACCESS_TOKEN } = process.env
const axios = require('axios')

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

router.get('/air/latest', (ctx, next) => {
  ctx.body = JSON.stringify(db.getState())
})

router.post('/air/bot', (ctx, next) => {
  const { body: { challenge } } = ctx.request

  if (challenge) {
    ctx.set('Content-type', 'application/json')
    return (ctx.body = JSON.stringify({ challenge }))
  }

  const { body: { event } } = ctx.request
  if (event) {
    const { temp, co2 } = db.getState()
    const { type, channel, user} = event
    if (type === 'app_mention') {
      axios({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        data: {
          text: `Hello <@${user}>! Current CO2 level is ${co2}ppm and temperature is ${temp}C. Rejoice!`,
          channel
        },
        headers: {
          Authorization: `Bearer ${BOT_ACCESS_TOKEN}`
        }
      })
    }
  }
  ctx.status = 200
})

router.get('/air/post/temp/:temp', ctx => {
  db.set('temp', ctx.params.temp).write()
  ctx.body = 'done'
})

router.get('/air/post/co2/:co2', ctx => {
  db.set('co2', ctx.params.co2).write()
  ctx.body = 'done'
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(8080)
