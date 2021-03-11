'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      uid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        autoIncrement: false,
        unique: true
      },
      refcode: {
        type: Sequelize.STRING,
        unique: true,
        set: function (val) {
          refCode = voucher_codes.generate({
            prefix: `${val}-`,
            length: 6
          })
          this.setDataValue("refcode", refCode);
        }
      },
      referrer: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
     })
    .then(() => {
      queryInterface.addConstraint('Users',{
        type: 'foreign key',
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
        fields: ['referrer'],
        references: {
            table: 'Users',
            field: 'refcode'
        },
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};