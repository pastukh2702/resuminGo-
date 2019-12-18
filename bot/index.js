const Telegraf = require('telegraf')

const bot = new Telegraf('1011709240:AAF7R7KFrjaH6Hhf-kA-x5XOPI0VZrPjmaQ')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
let stages = require('../scenes')
let startHandler = require('./handlers/start')
const session = require('telegraf/session')

let BotInit = {
    register: function () {

        bot.use(session())
        bot.use(stages.middleware())
        bot.launch()
        startHandler.register(bot)

        
        
    }
}

module.exports = BotInit
