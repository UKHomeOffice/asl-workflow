const Schema = require('@asl/schema');

module.exports = settings => {

  return {
    init: (populate, keepAlive) => {
      const schema = Schema(settings);
      const tables = [
        'Notification',
        'TrainingPil',
        'TrainingCourse',
        'AsruEstablishment',
        'ProjectVersion',
        'Project',
        'Permission',
        'Authorisation',
        'PilTransfer',
        'PIL',
        'PlaceRole',
        'Place',
        'Role',
        'Exemption',
        'Certificate',
        'EmailPreferences',
        'Profile',
        'Invitation',
        'Establishment'
      ];
      return tables.reduce((p, table) => {
        return p.then(() => {
          if (typeof schema[table].queryWithDeleted === 'function') {
            return schema[table].queryWithDeleted().hardDelete();
          }
          return schema[table].query().truncate();
        });
      }, Promise.resolve())
        .then(() => populate && populate(schema))
        .then(() => !keepAlive && schema.destroy())
        .then(() => schema)
        .catch(err => {
          schema.destroy();
          throw err;
        });
    }

  };

};
