const Markup = require('telegraf/markup')
let userModel = require('../../mongoose/models/user-model')

let StartHandler = {

    register: function (bot) {

        bot.action('menu-scene', (ctx) => {
            ctx.scene.enter('menu-scene')
        })

        bot.action('start-scene', (ctx) => {
            ctx.scene.enter('start-scene')
        })

        bot.start((ctx) => {
            userModel.findOneAndUpdate({telegramId: ctx.from.id}, {
                createdResume: false
            });
            userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                if(ext == null) {

                    var newUserModel = new userModel({
                        telegramId: ctx.from.id,
                        userName: ctx.from.username
                    })

                    await newUserModel.save((err) => {
                        if (err) {
                            console.log(err, null)
                        } else {
                            ctx.reply(`Привет!🥳 
Рад тебя здесь видеть 😊 
Ты один из первых бета-тестеров этого чудесного бота и я буду твоим резюме-гидом 🤓`)
                            setTimeout(()=>{ctx.scene.enter('start-scene')}, 500)
                        }
                    })

                }else{
                    ctx.reply("Привет 👋, "+ext.name+". Как дела?")
                    setTimeout(()=>{ctx.scene.enter('menu-scene')}, 500)
                }
            })
            
        })
    }
}

module.exports = StartHandler

