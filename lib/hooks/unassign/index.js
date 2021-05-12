module.exports = settings => {

  return model => {
    if (model.assignedTo) {
      return model.assign(null);
    }
  };

};
