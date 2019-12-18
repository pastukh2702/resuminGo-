var UserModel = require('../mongoose/models/user-model');

var UserService = {
    getAll: function (callback) {

        UserModel.find({}, (err, users) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, users);
            }
        })
    },

    isNew: function (telegramId, callback) {

        UserModel.findOne({telegramId: telegramId}, (err, extUser) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (extUser) {
                callback(null, false);
            } else {
                callback(null, true);
            }
        })
    },

    saveUser: function (userInfo, callback) {

        this.isNew(userInfo.telegramId, (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (result) {
                var newUserModel = new UserModel({
                    telegramId: userInfo.telegramId,
                    userName: userInfo.userName
                })

                newUserModel.save((err) => {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, true)
                    }
                })
            } else {
                callback(null, false)
            }
        })
    }
}

module.exports = UserService;