require('dotenv').config();
let mongoose = require('mongoose')
let botInit = require('./bot')

let userModel = require('./mongoose/models/user-model')

mongoose.connect('mongodb+srv://pastukh:Vova123@resumingo-rzvlg.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false  });


userModel.findOne({telegramId: 419575710}, (err, ext) => {
    console.log(ext.experience[1].country)
})
//     if(!ext.contacts.length){
//         ext.contacts.push( {
//             type: 'phone',
//                 caption: 'Phone',
//                 value: '4355454353'
//         });
//         ext.save(function(err){
//             console.log('Write yes')
//         });
        
//     }else{
//         b(ext)
//     }
// })
// let b = async (exp) => {
    // await userModel.findOneAndUpdate({telegramId: 419575710,contacts: {$elemMatch: {type: 'phone'}}},{ $set: { "contacts.$.value": 'phadasdsaone'}})
// }





botInit.register()