const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // #1 
  test('Viewing one stock', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function(error, res) {
        assert.equal(res.status, 200, 'Response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(res.body.stockData.stock, "GOOG", 'res.body.stockData.stock should be "GOOG"')
        done()
      })
  })
  // #2
  test('Viewing one stock and liking it', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function(error, res) {
        assert.equal(res.status, 200, 'Response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(res.body.stockData.stock, "GOOG", 'res.body.stockData.stock should be "GOOG"')
        done()
      })
  })
  // #3
  test('Viewing the same stock and liking it again', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function(error, res) {
        assert.equal(res.status, 200, 'Response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(res.body.stockData.stock, "GOOG", 'res.body.stockData.stock should be "GOOG"')
        done()
      })
  })
  // #4
  test('Viewing two stocks', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT')
      .end(function(error, res) {
        assert.equal(res.status, 200, 'Response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(res.body.stockData[0].stock, "GOOG", 'res.body.stockData[0].stock should be "GOOG"')
        assert.equal(res.body.stockData[1].stock, "MSFT", 'res.body.stockData[1].stock should be "MSFT"')
        done()
      })
  })
  // #5
  test('Viewing two stocks and liking them', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
      .end(function(error, res) {
        assert.equal(res.status, 200, 'Response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(res.body.stockData[0].stock, "GOOG", 'res.body.stockData[0].stock should be "GOOG"')
        assert.equal(res.body.stockData[1].stock, "MSFT", 'res.body.stockData[1].stock should be "MSFT"')
        done()
      })
  })
});
