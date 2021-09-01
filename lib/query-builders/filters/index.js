const filterByAction = require('./by-action');
const filterByLicenceType = require('./by-licence-type');
const filterByPplType = require('./by-ppl-type');
const filterByModel = require('./by-model');
const filterByIsAmendment = require('./by-is-amendment');
const filterBySchemaVersion = require('./by-schema-version');
const filterByInitiator = require('./by-initiator');
const myTasks = require('./my-tasks');

module.exports = {
  filterByAction,
  filterByLicenceType,
  filterByPplType,
  filterByIsAmendment,
  filterBySchemaVersion,
  filterByInitiator,
  filterByModel,
  myTasks
};
