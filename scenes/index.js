const Composer = require('telegraf/composer')
const Stage = require('telegraf/stage')

const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const WizardScene = require('telegraf/scenes/wizard')

const userModel = require('../mongoose/models/user-model')
const stepHandler = new Composer()
const stepHandler2 = new Composer()

let create_scene = require('./create-scene')
let start_scene = require('./start-scene')
let create_pdf = require('./create-pdf')
let education_scene = require('./education-scene')
let create_pdf_old = require('./create-pdf_old')

stepHandler.action('create', (ctx) => {
    ctx.scene.enter('create-scene')
})

stepHandler.action('create_old', (ctx) => {
  ctx.scene.enter('create-pdf_old')
})





const menu = new WizardScene('menu-scene',
  (ctx) => {

    userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
      if(ext.createdResume) {

        ctx.reply('Как тебе помочь? 👇',
        Extra.markup((markup) => {
          return markup.resize()
            .inlineKeyboard([
              markup.callbackButton('Создай новое резюме 👶', 'create'),
              markup.callbackButton('Загрузи старое резюме 👴', 'create_old')
            ],{ columns: 1 })
        }))

        ctx.deleteMessage(ctx.id)
        return ctx.wizard.next()

      }else{

        ctx.reply('Как тебе помочь? 👇',
        Extra.markup((markup) => {
          return markup.resize()
            .inlineKeyboard([
              markup.callbackButton('Создай новое резюме 👶', 'create'),
            ],{ columns: 1 })
        }))

        ctx.deleteMessage(ctx.id)
        return ctx.wizard.next()

      }
  })

    
  },
  stepHandler
)

const stages = new Stage([menu, create_scene, start_scene, create_pdf, education_scene, create_pdf_old])

module.exports = stages
