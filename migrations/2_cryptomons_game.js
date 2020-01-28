const CryptomonsGame = artifacts.require("CryptomonsGame");

module.exports = function(deployer) {
  deployer.deploy(CryptomonsGame);
};
