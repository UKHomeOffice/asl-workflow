const filterByAction = require('./by-action');
const filterByLicenceType = require('./by-licence-type');
const filterByModel = require('./by-model');
const filterByIsAmendment = require('./by-is-amendment');
const filterBySchemaVersion = require('./by-schema-version');
const filterByInitiator = require('./by-initiator');

module.exports = {
  filterByAction,
  filterByLicenceType,
  filterByIsAmendment,
  filterBySchemaVersion,
  filterByInitiator,
  filterByModel
};
