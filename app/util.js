module.exports = {
  getEnv(key, defaultValue = '') {
    if (!key) {
      return defaultValue;
    }

    const value = process.env[key] || defaultValue;

    return value;
  }
};
