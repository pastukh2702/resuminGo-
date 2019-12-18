const Markup = require('telegraf/markup')
const Composer = require('telegraf/composer')
const WizardScene = require('telegraf/scenes/wizard')

const stepHandler = new Composer()


const education = new WizardScene('education-scene',
    (ctx) => {
        ctx.reply('После ответа на следующие вопросы тебе будет выслан pdf файл резюме, но перед этим тебе нужно подтвердить Соглашение об обработке персональных данных')

        return ctx.wizard.next()
    }
    
)

module.exports = education