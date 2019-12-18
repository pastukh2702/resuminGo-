const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
let userModel = require('../mongoose/models/user-model')



const start = new WizardScene('start-scene',
    (ctx) => {
        ctx.reply('Как я могу к тебе обращаться? 🧐')
        return ctx.wizard.next()
    },
    async (ctx) => {
        try {
            await userModel.findOneAndUpdate({telegramId: ctx.from.id},
                {
                    name: ctx.message.text
                })
        } catch (error) {
            ctx.reply(`Что-то пошло не так 😔 
Перезапусти бота /start`)
        }
        

        ctx.reply(`Отлично! 🎯 ${ctx.message.text}, приятно познакомиться 😊`)
        setTimeout(()=>{ctx.scene.enter('menu-scene')}, 500)
        ctx.scene.leave()
        
        }
    )

module.exports = start




// , Markup.inlineKeyboard([
//     Markup.callbackButton('Create', 'start'),
//     ]).extra())