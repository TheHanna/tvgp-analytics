'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const now = Date.now()
    return queryInterface.bulkInsert('hosts', [
      { createdAt: now, updatedAt: now, id: null, firstName: 'Michael', displayName: 'Boston', lastName: 'Hannon' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Brad', lastName: 'Fellers' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Ricky', lastName: 'Martin' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Ryan', lastName: 'Pratt' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Kurtis', lastName: 'Bockoven' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'John', displayName: 'Knobs', lastName: 'Knoblach' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Dan', lastName: 'Capri' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Steve', lastName: 'Hannon' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Matthew', lastName: 'Wagner' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Andrew', lastName: 'Yoder' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Shawn', lastName: 'Isley' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'John', displayName: 'AlmightyTooth', lastName: 'Blake' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'John', displayName: 'Musim', lastName: 'Beauchamp' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Scott', displayName: 'Nintendork', lastName: 'Jeffries' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Brian', displayName: 'TheHanna', lastName: 'Hanna' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Paul', displayName: 'Moonpir', lastName: 'Carver-Smith' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Jon', displayName: 'MonkeySenior', lastName: 'Vidal' },
      { createdAt: now, updatedAt: now, id: null, firstName: 'Alexander', displayName: 'TheNimp', lastName: 'Jolly' }
    ])
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
