require('dotenv').config({ silent: true });

const server = require('./app/server');
const util = require('./app/util');

server.listen(util.getEnv('APP_PORT', 3000), function() {
  console.log('App start...');
});
