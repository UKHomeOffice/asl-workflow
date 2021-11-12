module.exports = profile => query => {
  query
    .where('assignedTo', profile.id);
};
