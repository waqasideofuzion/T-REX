const  deployIdentityProxy = require('../test/helpers/proxy');
const  updateJsonFile = require('update-json-file')
const EVMRevert = require('../test/helpers/VMExceptionRevert');
require('chai').use(require('chai-as-promised')).should();
const onchainid = require('@onchain-id/solidity');
const Web3 = require("web3");
const web3 = new Web3()

const {
    ClaimTopicsRegistry,
    // CountryAllowModule,
    ModularCompliance,
    // CountryRestrictModule,
    IdentityRegistry,
    IdentityRegistryStorage,
    Implementation,
    IssuerIdentity,
    Token,
    TrustedIssuersRegistry,
    TREXFactory,
} = require('../test/helpers/artifacts');

// eslint-disable-next-line func-names
module.exports = async function (deployer, network, accounts) {

    web3.setProvider(new Web3.providers.HttpProvider(process.env.INFURA_API_KEY))

    let claimTopicsRegistry;
    let identityRegistry;
    let identityRegistryStorage;
    let trustedIssuersRegistry;
    let token;
    let modularCompliance;
    let crModule;
    let tokenDetails;
    let claimDetails;
    let factory;
    let claimIssuerContract;
    let implementationSC;
    const signer = web3.eth.accounts.create();
    const signerKey = web3.utils.keccak256(web3.eth.abi.encodeParameter('address', signer.address));
    const tokeny = accounts[0];
    const claimIssuer = accounts[1];
    const user1 = accounts[2];
    const user2 = accounts[3];
    const claimTopics = [7];
    let user1Contract;
    let user2Contract;
    const agent = accounts[8];


    // Tokeny deploying all implementations
    await deployer.deploy(ClaimTopicsRegistry).then(() => {
        updateAddressJSON('ClaimTopicsRegistry', ClaimTopicsRegistry.address);
    });
    claimTopicsRegistry = await ClaimTopicsRegistry.deployed();

    await deployer.deploy(TrustedIssuersRegistry).then(() => {
        updateAddressJSON('TrustedIssuersRegistry', TrustedIssuersRegistry.address);
    });
    trustedIssuersRegistry = await TrustedIssuersRegistry.deployed();

    await deployer.deploy(IdentityRegistryStorage).then(() => {
        updateAddressJSON('IdentityRegistryStorage', IdentityRegistryStorage.address);
    });
    identityRegistryStorage = await IdentityRegistryStorage.deployed();

    await deployer.deploy(IdentityRegistry, identityRegistryStorage.address).then(() => {
        updateAddressJSON('IdentityRegistry', IdentityRegistry.address);
    });
    identityRegistry = await IdentityRegistry.deployed();

    await deployer.deploy(ModularCompliance).then(() => {
        updateAddressJSON('ModularCompliance', ModularCompliance.address);
    });
    modularCompliance = await ModularCompliance.deployed();

    await deployer.deploy(Token).then(() => {
        updateAddressJSON('Token', Token.address);
    });
    token = await Token.deployed();

    // setting the implementation authority
    await deployer.deploy(Implementation).then(() => {
        updateAddressJSON('Implementation', Implementation.address);
    });
    implementationSC = await Implementation.deployed();

    await implementationSC.setCTRImplementation(claimTopicsRegistry.address);
    await implementationSC.setTIRImplementation(trustedIssuersRegistry.address);
    await implementationSC.setIRSImplementation(identityRegistryStorage.address);
    await implementationSC.setIRImplementation(identityRegistry.address);
    await implementationSC.setTokenImplementation(token.address);
    await implementationSC.setMCImplementation(modularCompliance.address);

    // deploy Factory
    await deployer.deploy(TREXFactory, implementationSC.address).then(() => {
        updateAddressJSON('TREXFactory', TREXFactory.address);
    });
    // eslint-disable-next-line no-unused-vars
    factory = await TREXFactory.deployed();

    // deploy Claim Issuer contract
    await deployer.deploy(IssuerIdentity, claimIssuer).then(() => {
        updateAddressJSON('ClaimIssuer', IssuerIdentity.address);
    });
    claimIssuerContract = await IssuerIdentity.deployed();

    // await claimIssuerContract.addKey(signerKey, 3, 1, { from: claimIssuer });

    // // users deploy their identity contracts
    // user1Contract = await deployIdentityProxy(user1);
    // user2Contract = await deployIdentityProxy(user2);

    // // user1 gets signature from claim issuer
    // const hexedData1 = await web3.utils.asciiToHex('kyc approved');
    // const hashedDataToSign1 = web3.utils.keccak256(
    //     web3.eth.abi.encodeParameters(['address', 'uint256', 'bytes'], [user1Contract.address, 7, hexedData1]),
    // );
    // const signature1 = (await signer.sign(hashedDataToSign1)).signature;

    // // user1 adds claim to identity contract
    // await user1Contract.addClaim(7, 1, claimIssuerContract.address, signature1, hexedData1, '', { from: user1 });

    // // user2 gets signature from claim issuer
    // const hexedData2 = await web3.utils.asciiToHex('kyc approved');
    // const hashedDataToSign2 = web3.utils.keccak256(
    //     web3.eth.abi.encodeParameters(['address', 'uint256', 'bytes'], [user2Contract.address, 7, hexedData2]),
    // );
    // const signature2 = (await signer.sign(hashedDataToSign2)).signature;

    // // user2 adds claim to identity contract
    // await user2Contract.addClaim(7, 1, claimIssuerContract.address, signature2, hexedData2, '', { from: user2 }).should.be.fulfilled;


    // token details
    tokenDetails = {
        owner: tokeny,
        name: 'TREXDINO',
        symbol: 'TREX',
        decimals: 8,
        irs: '0x0000000000000000000000000000000000000000',
        ONCHAINID: '0x0000000000000000000000000000000000043113', // avax fuji
        irAgents: [tokeny, agent],
        tokenAgents: [tokeny, agent],
        // complianceModules: [caModule.address, caModule.address, crModule.address, crModule.address],
        complianceModules: [],
        // complianceSettings: [callData1, callData2, callData3, callData4],
        complianceSettings: [],
    };

    // claim details
    claimDetails = { claimTopics: claimTopics, issuers: [claimIssuerContract.address], issuerClaims: [claimTopics] };
    // claimDetails = { claimTopics: claimTopics, issuers: ["0xc44aA534d3c6C9D17fdF4d8e56Ec840C6bDaDBFA"], issuerClaims: [claimTopics] };


    // factory = await TREXFactory.at("0xf3f489B2B31A8A46B57B539AED1fACf51352736C");

    // deploy token on Factory
    let deploySuite = await factory.deployTREXSuite('test1', tokenDetails, claimDetails, { from: tokeny });

    // console.log(deploySuite);


};


// This function saves the provided contract address to the "build/contract/addresses.json" JSON file
function updateAddressJSON(name, address) {
    const filePath = './build/contracts/addresses.json';
    const options = { defaultValue: () => ({}) }; // Default is an empty object

    updateJsonFile(filePath, (data) => {
        data[name] = address; // "defaultValue" factory function is run each time, so `data` is a new object each time
        return data;
    }, options);
}