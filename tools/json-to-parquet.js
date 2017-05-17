var File = require('pull-file')
var Split = require('pull-split')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var Encode = require('../encode')
var Group = require('pull-group')
var MapLast = require('pull-map-last')
var fs = require('fs')

function parseJsonLines () {
  return Split('\n', JSON.parse, null, true)
}

module.exports = Parquet

function Parquet (schema, rows) {
  var headers = Object.keys(schema)
  var types = headers.map(function (key) { return schema[key] })
  var encoder = Encode(headers, types)

  return pull(
    pull.map(function (e) {
      return headers.map(function (key) { return e[key] })
    }),
    Group(rows || 1000),
    MapLast(encoder, encoder)
  )
}

if(!module.parent) {
  pull(
    File(process.argv[2]),
    parseJsonLines(),
    Parquet(JSON.parse(fs.readFileSync(process.argv[3]))),
    toPull.sink(process.stdout)
  )
}




