module.exports = {
  getEstablishmentsWhereUserIsRole: (role, profile) => {
    return profile.roles.map(r => (r.type === role) ? r.establishmentId : null);
  }
};
