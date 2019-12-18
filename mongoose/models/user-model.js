var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ContactSchema = new Schema({
    type: String,
    caption: String,
    value: String
})

var UserSchema = new Schema({
    telegramId: String,
    userName: String,
    name: String,

    createdResume: Boolean,
    firstName: String,
    lastName: String,
    workName: String,
    about: String,
    contacts: [],
    proskills: [],
    languages: [],
    education: [],
    experience: [],
    achievements: []
});



var User = mongoose.model('user', UserSchema);

module.exports = User;