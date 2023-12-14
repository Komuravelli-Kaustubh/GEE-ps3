// Require client library and private key.
// var droughtThis = require("./drought_gee.js");
var ee = require('@google/earthengine');
// var privateKey = require('./geeps-401105-60c9a5d62fd5.json');
var privateKey = require('./ee-shankarkaustubh1k3-309c1fd4ff3f.json');
const droughtThis = require("./drought_gee");

async function getDrought(d_FarmerId,d_TYear,d_TMonth) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(d_FarmerId,d_TYear,d_TMonth);
        ee.initialize(null, null, async function () {
          try {
            const res = await droughtThis(d_FarmerId,d_TYear,d_TMonth);
            resolve(res);
          } catch (e) {
            console.error('Analysis error: ' + e);
            reject(e);
          }
          // ... run analysis ...
        }, function (e) {
          console.error('Initialization error: ' + e);
          reject(e);
        });
      } catch (e) {
        console.error('Authentication error: ' + e);
        reject(e);
      }
    });
  }

// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, getDrought, function (e) {
    console.error('Authentication error: ' + e);
});

module.exports=getDrought;