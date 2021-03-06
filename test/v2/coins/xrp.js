var assert = require('assert');
var crypto = require('crypto');
var should = require('should');

var common = require('../../../src/common');
var prova = require('../../../src/prova');
const rippleKeypairs = require('ripple-keypairs');
var TestV2BitGo = require('../../lib/test_bitgo');

describe('XRP:', function() {
  var bitgo;
  var basecoin;

  before(function() {
    bitgo = new TestV2BitGo({ env: 'test' });
    bitgo.initializeTestVars();
    return bitgo.authenticateTestUser(bitgo.testUserOTP())
    .then(function() {
      basecoin = bitgo.coin('txrp');
    })
  });

  it('Should verify addresses', function() {
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=1893500718') === true);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8') === true);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?r=a') === false);
    assert(basecoin.isValidAddress('xrp://r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=4294967296') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=4294967295') === true);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=0x123') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=0x0') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=0') === true);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=-1') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=1.5') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=a') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=b') === false);
    assert(basecoin.isValidAddress('r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=a54b') === false);
    assert(basecoin.isValidAddress('xrp://r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=4294967295') === false);
    assert(basecoin.isValidAddress('http://r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?dt=4294967295') === false);
    assert(basecoin.isValidAddress('http://r2udSsspYjWSoUZxzxLzV6RxGcbygngJ8?a=b&dt=4294967295') === false);
  });

  it('Should generate wallet with custom root address', function() {
    var hdNode = prova.HDNode.fromSeedBuffer(crypto.randomBytes(32));
    var params = {
      passphrase: TestV2BitGo.V2.TEST_WALLET1_PASSCODE,
      label: 'Ripple Root Address Test',
      disableTransactionNotifications: true,
      rootPrivateKey: hdNode.getKey().getPrivateKeyBuffer().toString('hex')
    };
    var expectedAddress = rippleKeypairs.deriveAddress(hdNode.getKey().getPublicKeyBuffer().toString('hex'));

    return basecoin.wallets().generateWallet(params)
    .then(function(res) {
      res.should.have.property('wallet');
      res.should.have.property('userKeychain');
      res.should.have.property('backupKeychain');
      res.should.have.property('bitgoKeychain');

      res.userKeychain.should.have.property('pub');
      res.userKeychain.should.have.property('prv');
      res.userKeychain.should.have.property('encryptedPrv');

      res.backupKeychain.should.have.property('pub');
      res.backupKeychain.should.have.property('prv');

      res.bitgoKeychain.should.have.property('pub');
      res.bitgoKeychain.isBitGo.should.equal(true);
      res.bitgoKeychain.should.not.have.property('prv');
      res.bitgoKeychain.should.not.have.property('encryptedPrv');

      res.wallet._wallet.receiveAddress.address.should.startWith(expectedAddress + '?');
    });
  });

});
