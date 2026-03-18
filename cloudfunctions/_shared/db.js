const cloud = require('wx-server-sdk');

let initialized = false;

function initCloudDb() {
  if (!initialized) {
    cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
    initialized = true;
  }

  return cloud.database();
}

module.exports = {
  cloud,
  initCloudDb,
};
