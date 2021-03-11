'use strict';
const {
  Model
} = require('sequelize');
const voucher_codes = require('voucher-code-generator');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       User.hasMany(models.User, {as: 'referrals', sourceKey: 'refcode',foreignKey: {name:'referrer', allowNull: true}, constraints: false});
       User.belongsTo(models.User, {foreignKey: {name:'referrer', allowNull: true}, targetKey: 'refcode', as: 'referee',constraints: false});
    }
  };
  User.init({
    uid: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      autoIncrement: false,
      unique: true
    },
    refcode:{
      type:DataTypes.STRING,
      allowNull: false,
      set: function (val) {
        let refCode = voucher_codes.generate({
          prefix: `${val}-`,
          length: 6
      })
        this.setDataValue("refcode", refCode[0]);
      }
    },
    referrer: DataTypes.STRING,
    email: DataTypes.STRING,
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};