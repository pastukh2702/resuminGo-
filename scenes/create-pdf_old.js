const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
let userModel = require('../mongoose/models/user-model')
const axios = require('axios');
var fs = require('fs');

const temp1 = require('./pdf-temp/temp1');

let imageLoad = false;
let userData;

const create_pdf_old = new WizardScene('create-pdf_old',

     //FIRSTNAME
    (ctx) => {

        ctx.reply('Твоя фотография',
        Markup.inlineKeyboard([
            Markup.callbackButton('Пропустить', 'next'),
        ]).extra())                           

        return ctx.wizard.next()
    }, 
    async (ctx) => {
        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            userData = ext.data[0]
        })

        try {
            const files = ctx.update.message.photo;
            fileId = files[1].file_id
            ctx.telegram.getFileLink(fileId).then(url => {    
                axios({url, responseType: 'stream'}).then(response => {
                    return new Promise((resolve, reject) => {
                        console.log(response)
                        response.data.pipe(fs.createWriteStream(`${ctx.update.message.from.id}.jpg`))
                                    .on('finish', (res) => { 
                                        imageLoad = true;
                                        ctx.reply(userData.firstName+', вот твое резюме. Удачи!');

                                        temp1.create(userData, ctx, imageLoad)

                                        ctx.telegram.sendDocument(ctx.from.id, {
                                            source: fs.createReadStream(`${ctx.from.id}.pdf`),
                                            filename: `${ctx.from.id}.pdf`
                                        }).then(()=>{
                                            ctx.reply(`Ну как? Понравилось?)`,
                                            Markup.inlineKeyboard([
                                                Markup.callbackButton('Назад в меню', 'menu-scene'),
                                            ]).extra()) 
                                        }).then(() => {
                                            fs.unlink(`${ctx.from.id}.pdf`, (err) => {
                                                if (err) throw err;
                                            })
                    
                                            fs.unlink(`${ctx.update.message.from.id}.jpg`, (err) => {
                                                if (err) throw err;
                                                })
                                                
                                        })


                                        console.log(userData)
                                        return ctx.scene.leave() 
                                    })
                                    .on('error', e => {
                                        ctx.reply(`Чето пошло не так (`)
                                        return ctx.scene.leave() 
                                    })
                            });
                        })
            })

        } catch (error) {
            imageLoad = false;
            ctx.reply(userData.firstName+', вот твое резюме. Удачи!');

            temp1.create(userData, ctx, imageLoad)

            ctx.telegram.sendDocument(ctx.from.id, {
                source: fs.createReadStream(`${ctx.from.id}.pdf`),
                filename: `${ctx.from.id}.pdf`
            }).then(()=>{
                ctx.reply(`Ну как? Понравилось?)`,
                Markup.inlineKeyboard([
                    Markup.callbackButton('Назад в меню', 'menu-scene'),
                ]).extra()) 
            }).then(() => {
                fs.unlink(`${ctx.from.id}.pdf`, (err) => {
                    if (err) throw err;
                })
                    
            })

            console.log(userData)
            return ctx.scene.leave() 
        }
    }
)

module.exports = create_pdf_old
