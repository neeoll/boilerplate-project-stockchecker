'use strict';
const axios = require('axios')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })

const Schema = mongoose.Schema
const stockSchema = new Schema({
  symbol: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  likes: [String]
})

let Stock = mongoose.model("Stocks", stockSchema)

const saltRounds = 12

// Create new stock entry
const createStockEntries = (stocks) => {
  for (let i = 0; i < stocks.length; i++) {
    Stock.find({ symbol: stocks[i] }, (error, docs) => {
      if (docs.length) {
        return // console.log(stocks[i] + " already exists")
      } else {
        let newStock = new Stock({ symbol: stocks[i] })
        newStock.save((error, data) => {
          if (error) return console.error(error)
          return // console.log('Add: ' + data)
        })
      }
    })
  }
}

// IP hash and like increment
const likeStocks = async(req, stocks) => {
  if (!req.query.like || req.query.like == false) return
  let ip = req.ip.substring(7)
  let hash = bcrypt.hashSync(ip, saltRounds);
  
  for (let i = 0; i < stocks.length; i++) {
    Stock.findOne({ symbol: stocks[i] }, (error, stock) => {
      if (error) return console.error(error)
      if (stock.likeCount == 0) {
        stock.likeCount += 1
        stock.likes.push(hash)
  
        stock.save((error, updatedStock) => {
          if (error) return console.error(error)
          return // console.log('Like: ' + updatedStock)
        })
      } else {
        for (let j = 0; j < stock.likes.length; j++) {
          if (bcrypt.compareSync(ip, stock.likes[j]) == true) continue
          else {
            stock.likeCount += 1
            stock.likes.push(hash)
      
            stock.save((error, updatedStock) => {
              if (error) return console.error(error)
              return // console.log('Like: ' + updatedStock)
            })
          }
        }
      }
    })
  }
}

// Get and respond with data
const getStockData = async(query, res) => {
  let stockData = []
  let stockQuery = query.length == 2 ? { $or: [{ symbol: query[0] }, { symbol: query[1] }] } : { symbol: query[0] }

  let stocks = await Stock.find(stockQuery)
  for (let i = 0; i < stocks.length; i++) {
    let response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[i].symbol}/quote`)
    stockData.push({
      stock: stocks[i].symbol,
      price: response.data.latestPrice,
      likes: stocks[i].likeCount
    })
  }

  if (stockData.length == stocks.length) {
    let likesDifference = stockData.length == 2 ? stockData[0].likes - stockData[1].likes : null
    let response = stockData.length == 1 ? 
    stockData[0] : 
    [
      {
        stock: stockData[0].stock,
        price: stockData[0].price,
        rel_likes: likesDifference
      },
      {
        stock: stockData[1].stock,
        price: stockData[1].price,
        rel_likes: likesDifference * -1
      }
    ]
    res.json({ stockData: response })
  }
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async (req, res) => {
    let stocks = Array.isArray(req.query.stock) == true ? req.query.stock : [req.query.stock]
    
    createStockEntries(stocks)
    await likeStocks(req, stocks)
    await getStockData(stocks, res)
  });   
};
