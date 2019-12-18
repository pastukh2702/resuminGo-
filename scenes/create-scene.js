const Extra = require('telegraf/extra')
const Composer = require('telegraf/composer')
const WizardScene = require('telegraf/scenes/wizard')

const stepHandler = new Composer()
stepHandler.action('createPdf', (ctx) => {
    ctx.deleteMessage(ctx.id)
    ctx.scene.enter('create-pdf')
})

const create = new WizardScene('create-scene',
    (ctx) => {
        ctx.reply(`ResuminGo! β-test

1) Далее запустится программа создания резюме. Так как это бета-версия могут быть ошибки, для перезагрузки бота всегда работает команда /start.
2) После успешного ответа на все вопросы ты получишь pdf файл с резюме, а так же станет доступна функция получать его постоянно из данных которые ты вводил ранее.
3) Прошу весь фидбэк (ошибки, идеи, предложения) писать @bob_pasta

Спасибо, удачи в поиске работы 🤝`,

        Extra.markup((markup) => {
          return markup.resize()
            .inlineKeyboard([
              markup.callbackButton('Поехали! 🔥', 'createPdf'),
              markup.callbackButton('Назад в меню', 'menu-scene')
            ],{ columns: 1 })
        }))

        ctx.deleteMessage(ctx.id)
        return ctx.wizard.next()
    },
    stepHandler
    
)

module.exports = create