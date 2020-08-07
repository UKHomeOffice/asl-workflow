const { uniq } = require('lodash');

function uniqConcat(a, b) {
  return uniq([
    ...(a || []),
    ...(b || [])
  ]);
}

function normaliseExemptions(exemptions) {
  return exemptions.reduce((cert, exemption) => {
    const exemptionReason = cert.exemptionReason || '';
    return {
      isExemption: true,
      species: uniqConcat(cert.species, exemption.species),
      modules: uniqConcat(cert.modules, [exemption.module]),
      exemptionReason: [
        exemptionReason,
        ...(exemptionReason.length ? ['\n'] : []),
        exemption.description
      ].join('')
    };
  }, {});
}

function flattenModules(certificate) {
  if (!certificate.modules || !certificate.modules.length) {
    return certificate;
  }
  const species = certificate.species || [];
  const speciesFromModules = uniq((certificate.modules || []).reduce((arr, mod) => [ ...arr, ...(mod.species || []) ], []));
  return {
    ...certificate,
    species: uniq([...species, ...speciesFromModules]),
    modules: certificate.modules.map(module => module.module || module)
  };
}

function normaliseTraining(data) {
  const certificates = (data.certificates || []).map(flattenModules);
  const exemptions = normaliseExemptions(data.exemptions || []);

  return [
    ...certificates,
    ...exemptions
  ];
}

module.exports = task => {
  if (task.data.certificates || task.data.exemptions) {
    return {
      ...task,
      data: {
        ...task.data,
        certificates: normaliseTraining(task.data)
      }
    };
  }
  return task;
};
