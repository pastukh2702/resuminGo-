const WizardScene = require('telegraf/scenes/wizard')
const Composer = require('telegraf/composer')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')

let userModel = require('../mongoose/models/user-model')
const axios = require('axios');
var fs = require('fs');

const temp1 = require('./pdf-temp/temp1');

let imageLoad = false;


let checkData = (ctx, field, reply, back) => {
    if(back){
        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                
            if(ext[field] == undefined){
                ctx.reply(reply, Markup.inlineKeyboard([
                    Markup.callbackButton('Назад', 'back'),
                    Markup.callbackButton('Пропустить', 'next')
                ]).extra())
            }else{
                ctx.reply(`${reply}
    
(${ext[field]}) - уже записано, нажми кнопку пропустить или напиши новое.`, Markup.inlineKeyboard([
                    Markup.callbackButton('Назад', 'back'),
                    Markup.callbackButton('Пропустить', 'next'),
                ]).extra())                           
            }
        })  
    }else{
        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                
            if(ext[field] == undefined){
                ctx.reply(reply, Markup.inlineKeyboard([
                    Markup.callbackButton('Пропустить', 'next'),
                ]).extra())
            }else{
                ctx.reply(`${reply}
    
    (${ext[field]}) - уже записано, нажми кнопку пропустить или напиши новое.`, Markup.inlineKeyboard([
                    Markup.callbackButton('Пропустить', 'next'),
                ]).extra())                           
            }
        })
    }
}

let updateData = async (ctx, value, field) => {
    try {
        if(ctx.message.text !== undefined){
            await userModel.findOneAndUpdate({telegramId: ctx.from.id},
                {
                    [field]: value.message.text,
                }
            )
        }
    } catch (error) {
    } 
}

let checkDataArr = (ctx, field,key, reply) => {
    userModel.findOne({telegramId: ctx.from.id, [field]: {$elemMatch: {type: key}}}, async (err, ext) => {
        if(ext !== null){
            ext.contacts.forEach((con) => {
                if(con.type == key){
                    ctx.reply(`${reply}
    
(${con.value}) - уже записано, нажми кнопку пропустить или напиши новое.`, Markup.inlineKeyboard([
                    Markup.callbackButton('Назад', 'back'),
                    Markup.callbackButton('Пропустить', 'next'),
                ]).extra())  
                }
            })
             
        }else{
            ctx.reply(`${reply}`, Markup.inlineKeyboard([
                    Markup.callbackButton('Назад', 'back'),
                    Markup.callbackButton('Пропустить', 'next'),
                ]).extra())   
        }

    })
}

let checkDataMass = (ctx, field, reply, removeOpt) => {
    userModel.findOne({telegramId: ctx.from.id}, (err, ext) => {
        if(!ext[field].length){
            ctx.reply(reply,
            Markup.inlineKeyboard([
                Markup.callbackButton('Назад', 'back'),
                Markup.callbackButton('Пропустить', 'nextExtra'),
            ]).extra()) 
        }else{
            ctx.reply(reply,
                Markup.inlineKeyboard([
                    Markup.callbackButton('Назад', 'back'),
                    Markup.callbackButton('Пропустить', 'nextExtra'),
                ]).extra()).then(() => {
                    ctx.reply('Уже записано: ')
                    ext[field].forEach((skill) => {
                        ctx.reply(skill.name, Markup.inlineKeyboard([
                            Markup.callbackButton('Удалить', removeOpt),
                        ]).extra())
                    })
                })
        }
    })
}

// let checkDataMassSecond = (ctx, field, reply) => {
//     userModel.findOne({telegramId: ctx.from.id}, (err, ext) => {
//         if(!ext[field].length){
//             ctx.reply(reply,
//             Markup.inlineKeyboard([
//                 Markup.callbackButton('Назад', 'backExtra'),
//                 Markup.callbackButton('Пропустить', 'nextExtra'),
//             ]).extra()) 
//         }else{
//             ctx.reply(reply,
//                 Markup.inlineKeyboard([
//                     Markup.callbackButton('Назад', 'backExtra'),
//                     Markup.callbackButton('Пропустить', 'nextExtra'),
//                 ]).extra()).then(() => {
//                     ctx.reply('Уже записано: ')
//                     ext[field].forEach((skill) => {
//                         ctx.reply(skill.name, Markup.inlineKeyboard([
//                             Markup.callbackButton('Удалить', 'remove'),
//                         ]).extra())
//                     })
//                 })
//         }
//     })
// }


const create_pdf = new WizardScene('create-pdf',

     //FIRSTNAME
    async (ctx) => {
        await checkData(ctx, 'firstName', 'И так, для начала напиши свое имя <БЕЗ ФАМИЛИИ> (1/9)', false)

        return ctx.wizard.next()
    }, 

    //LASTNAME
    async (ctx) => {
        updateData(ctx, ctx, 'firstName', false)

        await checkData(ctx, 'lastName', 'Теперь фамилию (2/11)', true)

        return ctx.wizard.next()
    },

    //WORKNAME
    async (ctx) => {
        updateData(ctx, ctx, 'lastName', false)

        await checkData(ctx, 'workName', 'Твоя специальность 👩‍🚀 (3/11)', true)

        return ctx.wizard.next();
    },

    //ABOUT
    async (ctx) => {
        updateData(ctx, ctx, 'workName', false)

        await checkData(ctx, 'about', 'Расскажи о себе 👩‍💻 1-2 предложения (4/11)', true)        
        
        return ctx.wizard.next()
    },
    
    //PHONE
    async (ctx) => {
        updateData(ctx, ctx, 'about', false)

        ctx.reply('Твои контакты (5/11)').then(
            await checkDataArr(ctx, 'contacts', 'phone', 'Телефон 📞 (пр. +38099486757)')
        )
        
        return ctx.wizard.next()                           
    },

    //EMAIL
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'phone'}}}, async (err, ext) => {
                if(ext == null){
                    userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                        ext.contacts.push( {
                            type: 'phone',
                            caption: 'Phone',
                            value: ctx.message.text
                        });
                        await ext.save();
                    })
                }else{
                    await userModel.findOneAndUpdate({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'phone'}}},{ $set: { "contacts.$.value":  ctx.message.text, "contacts.$.type":  'phone', "contacts.$.caption":  'Phone'}},(err, ext) => {
                        console.log(err)
                    })
                }
            })
        } catch (error) {  
        }

        await checkDataArr(ctx, 'contacts', 'email', 'Email 💌 (пр. interns@go.com)')

        return ctx.wizard.next()                           
    },

    //LINKEDIN
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'email'}}}, async (err, ext) => {
                if(ext == null){
                    userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                        ext.contacts.push( {
                            type: 'email',
                            caption: 'Email',
                            value: ctx.message.text
                        });
                        await ext.save();
                    })
                }else{
                    await userModel.findOneAndUpdate({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'email'}}},{ $set: { "contacts.$.value":  ctx.message.text, "contacts.$.type":  'email', "contacts.$.caption":  'Email'}})

                }
            })
        } catch (error) {  
        }

        await checkDataArr(ctx, 'contacts', 'linkedin', 'LinkedIn 💼 (пр. linkedin.com/pastukh)')

        return ctx.wizard.next()                           
    },

    //TELEGRAM
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'linkedin'}}}, async (err, ext) => {
                if(ext == null){
                    userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                        ext.contacts.push( {
                            type: 'linkedin',
                            caption: 'LinkedIn',
                            value: ctx.message.text
                        });
                        await ext.save();
                    })
                }else{
                    await userModel.findOneAndUpdate({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'linkedin'}}},{ $set: { "contacts.$.value":  ctx.message.text, "contacts.$.type":  'linkedin', "contacts.$.caption":  'LinkedIn'}})
                }
            })
        } catch (error) {  
        }

        await checkDataArr(ctx, 'contacts', 'telegram', 'Телеграм 🛩 (пр. @bob_pasta)')
        
        return ctx.wizard.next()                           
    },

    //proskills
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'telegram'}}}, async (err, ext) => {
                if(ext == null){
                    userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                        ext.contacts.push( {
                            type: 'telegram',
                            caption: 'Telegram',
                            value: ctx.message.text
                        });
                        await ext.save();
                    })
                }else{
                    await userModel.findOneAndUpdate({telegramId: ctx.from.id,contacts: {$elemMatch: {type: 'telegram'}}},{ $set: { "contacts.$.value":  ctx.message.text, "contacts.$.type":  'telegram', "contacts.$.caption":  'Telegram'}})
                }
            })
        } catch (error) {  
        }
        
        await checkDataMass(ctx, 'proskills', 'Твои профессиональные навыки 🔆 2-5 навыка (6/11)', 'removePros')
        
        return ctx.wizard.next()                  
    },
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                ext.proskills.push({
                    name: ctx.message.text,
                });
                await ext.save();
            })
        } catch (error) {  
        }
        ctx.reply('Напиши еще, или нажми кнопку хватит 👇',
        Markup.inlineKeyboard([
            Markup.callbackButton('Хватит', 'nextExtra'),
        ]).extra())                
    },
    
    
    //LANGUAGE
    async (ctx) => {
        
        await checkDataMass(ctx, 'languages', 'Твои знания языка 🈵 (7/11)', "removeLang")
        
        return ctx.wizard.next()                           
    },
    async (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                ext.languages.push({
                    name: ctx.message.text,
                });
                await ext.save();
            })
        } catch (error) {  
        }
    
        ctx.reply('Напиши еще, или нажми кнопку хватит 👇',
        Markup.inlineKeyboard([
            Markup.callbackButton('Хватит', 'nextExtra'),
        ]).extra())              
    },

    //EDUCATION
    (ctx) => {
        ctx.reply(`Твое образование. 🎓 (8/11)`, Markup.inlineKeyboard([
            Markup.callbackButton('Назад', 'backExtra'),
            Markup.callbackButton('Пропустить', 'nextEdu'),
        ]).extra())
        .then(async () => {
            try {
                await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                    if(ext.education.length){
                        ext.education.forEach((edu) => {
                            ctx.reply(edu.univerName, Markup.inlineKeyboard([
                                Markup.callbackButton('Удалить', 'removeUniver'),
                            ]).extra())
                        })
                    }
                })
            } catch (error) {
                
            }
        })
        .then(() => {
            ctx.reply(`Для начала добавления напиши название университета или школы:`, Markup.inlineKeyboard([
                Markup.callbackButton('Пропустить добавление университета', 'nextEdu'),
            ]).extra())
        })
        
        return ctx.wizard.next()                       
    },

    (ctx) => {
        try {
            userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                ext.education.push( {
                    univerName: ctx.message.text,
                });
                await ext.save();
            })
        } catch (error) {  
        }


        ctx.reply(`Специальность: `)
        
        return ctx.wizard.next()                       
    },

    (ctx) => {

        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.education.forEach(async (univ) => {
                if(univ.univerName !== undefined){
                    if(univ.workName == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id,education: {$elemMatch: {univerName: univ.univerName}}},{ $set: { "education.$.workName":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Город: `)
        
        return ctx.wizard.next()                       
    },

    (ctx) => {

        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.education.forEach(async (univ) => {
                if(univ.workName !== undefined){
                    if(univ.city == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id,education: {$elemMatch: {workName: univ.workName}}},{ $set: { "education.$.city":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Страна: `)
        
        return ctx.wizard.next()                       
    },

    (ctx) => {

        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.education.forEach(async (univ) => {
                if(univ.city !== undefined){
                    if(univ.country == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, education: {$elemMatch: {city: univ.city}}},{ $set: { "education.$.country":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Год начала обучения: `)
        
        return ctx.wizard.next()                       
    },
    (ctx) => {

        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.education.forEach(async (univ) => {
                if(univ.country !== undefined){
                    if(univ.timeFrom == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, education: {$elemMatch: {country: univ.country}}},{ $set: { "education.$.timeFrom":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Год конца обучения: `)
        
        return ctx.wizard.next()                       
    },

    (ctx) => {

        userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.education.forEach(async (univ) => {
                if(univ.timeFrom !== undefined){
                    if(univ.timeTo == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, education: {$elemMatch: {timeFrom: univ.timeFrom}}},{ $set: { "education.$.timeTo":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Хочешь добавить еще? Или нажми кнопку пропустить`, Markup.inlineKeyboard([
            Markup.callbackButton('Добавить еще', 'backUltra'),
            Markup.callbackButton('Пропустить', 'next'),
        ]).extra()) 
        
        return ctx.wizard.next()                       
    },


    //EXPERIENCE
    async (ctx) => {
        ctx.reply(`Твой опыт работы. 💼 (9/11)`, Markup.inlineKeyboard([
            Markup.callbackButton('Назад', 'backEdu'),
            Markup.callbackButton('Пропустить', 'nextExp'),
        ]).extra())
        .then(async () => {
            try {
                await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                    if(ext.experience.length){
                        ext.experience.forEach((edu) => {
                            ctx.reply(edu.companyName, Markup.inlineKeyboard([
                                Markup.callbackButton('Удалить', 'removeWork'),
                            ]).extra())
                        })
                    }
                })
            } catch (error) {
                
            }
        })
        .then(() => {
            ctx.reply(`Для начала добавления напиши название компании:`, Markup.inlineKeyboard([
                Markup.callbackButton('Пропустить добавление опыта работы', 'nextExp'),
            ]).extra())
        })
        
        return ctx.wizard.next()                       
    },

    async (ctx) => {
        try {
            await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
                ext.experience.push( {
                    companyName: ctx.message.text,
                });
                await ext.save();
            })
        } catch (error) {  
        }


        ctx.reply(`Специальность: `)
        
        return ctx.wizard.next()                       
    },

    async (ctx) => {

        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.experience.forEach(async (univ) => {
                if(univ.companyName !== undefined){
                    if(univ.workName == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id,experience: {$elemMatch: {companyName: univ.companyName}}},{ $set: { "experience.$.workName":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Город: `)
        
        return ctx.wizard.next()                       
    },

    async (ctx) => {

        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.experience.forEach(async (univ) => {
                if(univ.workName !== undefined){
                    if(univ.city == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id,experience: {$elemMatch: {workName: univ.workName}}},{ $set: { "experience.$.city":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Страна: `)
        
        return ctx.wizard.next()                       
    },

    async (ctx) => {

        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.experience.forEach(async (univ) => {
                if(univ.city !== undefined){
                    if(univ.country == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, experience: {$elemMatch: {city: univ.city}}},{ $set: { "experience.$.country":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Год начала работы: `)
        
        return ctx.wizard.next()                       
    },
    async (ctx) => {

        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.experience.forEach(async (univ) => {
                if(univ.country !== undefined){
                    if(univ.timeFrom == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, experience: {$elemMatch: {country: univ.country}}},{ $set: { "experience.$.timeFrom":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Год конца работы: `)
        
        return ctx.wizard.next()                       
    },

    async (ctx) => {

        await userModel.findOne({telegramId: ctx.from.id}, async (err, ext) => {
            ext.experience.forEach(async (univ) => {
                if(univ.timeFrom !== undefined){
                    if(univ.timeTo == undefined){
                        await userModel.findOneAndUpdate({telegramId: ctx.from.id, experience: {$elemMatch: {timeFrom: univ.timeFrom}}},{ $set: { "experience.$.timeTo":  ctx.message.text}})
                    }
                }
            })
        })

        ctx.reply(`Хочешь добавить еще? Или нажми кнопку пропустить`, Markup.inlineKeyboard([
            Markup.callbackButton('Добавить еще', 'backUltra'),
            Markup.callbackButton('Пропустить', 'next'),
        ]).extra()) 
        
        return ctx.wizard.next()                       
    },

    //ACHIVEMENTS
    (ctx) => {
        ctx.reply(`Твои достижения. 🔥 (10/11)

2-4 достижений

Формат заполнения - Название достижения, Краткое описание`,
        Markup.inlineKeyboard([
            Markup.callbackButton('Пропустить', 'next'),
        ]).extra()) 
        
        return ctx.wizard.next()                       
    },


    //photo
    (ctx) => { 
        ctx.reply(`Твоя фотография. 🏙 (11/11)

Рекомендую использовать фотографии формата JPG`,
        Markup.inlineKeyboard([
            Markup.callbackButton('Пропустить', 'next'),
        ]).extra()) 

        return ctx.wizard.next();
    },

    //EXIT
    async (ctx) => {
        userModel.findOneAndUpdate({telegramId: ctx.from.id},
            {
                data: userData
            })
        try {
            const files = ctx.update.message.photo;
            fileId = files[1].file_id
            ctx.telegram.getFileLink(fileId).then(url => {    
                axios({url, responseType: 'stream'}).then(response => {
                    return new Promise((resolve, reject) => {
                        
                        response.data.pipe(fs.createWriteStream(`${ctx.update.message.from.id}.jpg`))
                                    .on('finish', (res) => { 
                                        imageLoad = true;
                                        ctx.reply('Загружаю резюме...');
                                        

                                        temp1.create(userData, ctx, imageLoad)

                                        ctx.telegram.sendDocument(ctx.from.id, {
                                            source: fs.createReadStream(`${ctx.from.id}.pdf`),
                                            filename: `${ctx.from.id}.pdf`
                                        }).then(()=>{
                                            ctx.reply('И вот твое резюме) Удачи! 😉',
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
                                            } 
                                        )

                                        return ctx.scene.leave() 
                                    })
                                    .on('error', e => {
                                        ctx.reply("Что-то пошло не так 😔 Перезапусти бота /start")
                                        return ctx.scene.leave() 
                                    })
                            });
                        })
            })

        } catch (error) {
            imageLoad = false;

            temp1.create(userData, ctx, imageLoad)

            ctx.telegram.sendDocument(ctx.from.id, {
                source: fs.createReadStream(`${ctx.from.id}.pdf`),
                filename: `${ctx.from.id}.pdf`
            }).then(()=>{
                ctx.reply('И вот твое резюме) Удачи! 😉',
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
                } 
            )

            return ctx.scene.leave() 
        }

        

                                
    },
).action('back', (ctx) => {
    ctx.wizard.cursor = ctx.wizard.cursor-2
    ctx.wizard.selectStep(ctx.wizard.cursor) 
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})
.action('removePros', async (ctx) => {
    await userModel.findOneAndUpdate({telegramId: ctx.from.id}, {$pull: {proskills: {name: ctx.callbackQuery.message.text}}})
    ctx.deleteMessage(ctx.id)
})
.action('removeLang', async (ctx) => {
    await userModel.findOneAndUpdate({telegramId: ctx.from.id}, {$pull: {languages: {name: ctx.callbackQuery.message.text}}})
    ctx.deleteMessage(ctx.id)
})
.action('removeUniver', async (ctx) => {
    await userModel.findOneAndUpdate({telegramId: ctx.from.id}, {$pull: {education: {univerName: ctx.callbackQuery.message.text}}})
    ctx.deleteMessage(ctx.id)
})
.action('removeWork', async (ctx) => {
    await userModel.findOneAndUpdate({telegramId: ctx.from.id}, {$pull: {experience: {companyName: ctx.callbackQuery.message.text}}})
    ctx.deleteMessage(ctx.id)
})
.action('nextExtra', (ctx) => {
    
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})
.action('nextEdu', (ctx) => {
    ctx.wizard.selectStep(19) 
    return ctx.wizard.steps[19](ctx);
})
.action('backEdu', (ctx) => {
    ctx.wizard.selectStep(12) 
    return ctx.wizard.steps[12](ctx);
})
.action('nextExp', (ctx) => {
    ctx.wizard.selectStep(26) 
    return ctx.wizard.steps[26](ctx);
})
.action('backExtra', (ctx) => {
    ctx.wizard.cursor = ctx.wizard.cursor-3
    ctx.wizard.selectStep(ctx.wizard.cursor) 
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})
.action('backUltra', (ctx) => {
    ctx.wizard.cursor = ctx.wizard.cursor-7
    ctx.wizard.selectStep(ctx.wizard.cursor) 
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})



module.exports = create_pdf

