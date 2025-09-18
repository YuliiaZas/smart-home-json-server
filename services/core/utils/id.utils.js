function getId(identifier) {
  return `${identifier}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

module.exports = { getId };