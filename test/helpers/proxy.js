/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const Identity = artifacts.require('@onchain-id/solidity/contracts/Identity.sol');
const IdentityImplementation = artifacts.require('@onchain-id/solidity/contracts/proxy/ImplementationAuthority.sol');
const onchainid = require('@onchain-id/solidity');
const Web3 = require("web3");
const web3 = new Web3()


async function deployIdentityProxy(identityIssuer) {

  web3.setProvider(new Web3.providers.HttpProvider(process.env.INFURA_API_KEY))

  const identityImplementation = await Identity.new(identityIssuer, true, { from: identityIssuer });
  const implementation = await IdentityImplementation.new(identityImplementation.address);

  const contractProxy = new web3.eth.Contract(onchainid.contracts.IdentityProxy.abi);

  const proxy = contractProxy
    .deploy({
      data: onchainid.contracts.IdentityProxy.bytecode,
      arguments: [implementation.address, identityIssuer],
    })
    .send({
      from: identityIssuer,
      gas: 3000000,
      gasPrice: '800000000',
    })
    .then(
      (newContractInstance) => newContractInstance.options.address, // instance with the new contract address
    );
  return Identity.at(await proxy);
}

module.exports = {
  deployIdentityProxy,
};
