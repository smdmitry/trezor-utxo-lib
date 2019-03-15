var pushdata = require('pushdata-bitcoin')
var varuint = require('varuint-bitcoin')
var BigInteger = require('bigi')

// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint (value, max) {
  if (typeof value !== 'number') throw new Error('cannot write a non-number as a number')
  if (value < 0) throw new Error('specified a negative value for writing an unsigned value')
  if (value > max) throw new Error('RangeError: value out of range')
  if (Math.floor(value) !== value) throw new Error('value has a fractional component')
}

function readUInt64LE (buffer, offset) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readUInt32LE(offset + 4)
  b *= 0x100000000

  verifuint(b + a, 0x001fffffffffffff)

  return b + a
}

function readUInt64LEasString (buffer, offset) {
  var a = new BigInteger(buffer.readUInt32LE(offset).toString())
  var b = new BigInteger(buffer.readUInt32LE(offset + 4).toString())
  var m = new BigInteger(Number(0x100000000).toString())
  return a.add(b.multiply(m)).toString()
}

function readInt64LE (buffer, offset) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readInt32LE(offset + 4)
  b *= 0x100000000

  return b + a
}

function writeUInt64LE (buffer, value, offset) {
  verifuint(value, 0x001fffffffffffff)

  buffer.writeInt32LE(value & -1, offset)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4)
  return offset + 8
}

function writeUInt64LEasString (buffer, value, offset) {
  if (typeof value !== 'string') {
    return writeUInt64LE(buffer, value, offset)
  }
  buffer.writeInt32LE(value & -1, offset)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4)
  return offset + 8
}

// TODO: remove in 4.0.0?
function readVarInt (buffer, offset) {
  var result = varuint.decode(buffer, offset)

  return {
    number: result,
    size: varuint.decode.bytes
  }
}

// TODO: remove in 4.0.0?
function writeVarInt (buffer, number, offset) {
  varuint.encode(number, buffer, offset)
  return varuint.encode.bytes
}

module.exports = {
  pushDataSize: pushdata.encodingLength,
  readPushDataInt: pushdata.decode,
  readUInt64LE: readUInt64LE,
  readUInt64LEasString: readUInt64LEasString,
  readInt64LE: readInt64LE,
  readVarInt: readVarInt,
  varIntBuffer: varuint.encode,
  varIntSize: varuint.encodingLength,
  writePushDataInt: pushdata.encode,
  writeUInt64LE: writeUInt64LE,
  writeUInt64LEasString: writeUInt64LEasString,
  writeVarInt: writeVarInt
}
