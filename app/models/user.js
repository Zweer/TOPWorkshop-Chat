const config = require('config');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      get() { return ''; },
      set(password) {
        const salt = crypto.randomBytes(config.get('security.saltLength')).toString('hex');
        const hash = this.hashPassword(password, salt);

        this.setDataValue('salt', salt);
        this.setDataValue('password', hash);
      },
    },

    salt: {
      type: DataTypes.STRING,
      set() {},
    },
  });

  Model.hashPassword = function hashPassword(password, salt) {
    return crypto
      .pbkdf2Sync(password, salt, config.get('security.iterations'), config.get('security.hashDigest'), config.get('security.hashDigest'))
      .toString('hex');
  };

  Model.validatePassword = function validatePassword(password) {
    return password === this.hashPassword(password, this.salt);
  };

  return Model;
};
