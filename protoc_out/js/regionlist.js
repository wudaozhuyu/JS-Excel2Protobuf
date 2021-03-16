/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

goog.provide('proto.idleafk.RegionList');

goog.require('jspb.BinaryReader');
goog.require('jspb.BinaryWriter');
goog.require('jspb.Message');
goog.require('proto.idleafk.Region');


/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.idleafk.RegionList = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.idleafk.RegionList.repeatedFields_, null);
};
goog.inherits(proto.idleafk.RegionList, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.idleafk.RegionList.displayName = 'proto.idleafk.RegionList';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.idleafk.RegionList.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.idleafk.RegionList.prototype.toObject = function(opt_includeInstance) {
  return proto.idleafk.RegionList.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.idleafk.RegionList} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.idleafk.RegionList.toObject = function(includeInstance, msg) {
  var f, obj = {
    rowsList: jspb.Message.toObjectList(msg.getRowsList(),
    proto.idleafk.Region.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.idleafk.RegionList}
 */
proto.idleafk.RegionList.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.idleafk.RegionList;
  return proto.idleafk.RegionList.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.idleafk.RegionList} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.idleafk.RegionList}
 */
proto.idleafk.RegionList.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.idleafk.Region;
      reader.readMessage(value,proto.idleafk.Region.deserializeBinaryFromReader);
      msg.addRows(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.idleafk.RegionList.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.idleafk.RegionList.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.idleafk.RegionList} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.idleafk.RegionList.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRowsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.idleafk.Region.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Region rows = 1;
 * @return {!Array.<!proto.idleafk.Region>}
 */
proto.idleafk.RegionList.prototype.getRowsList = function() {
  return /** @type{!Array.<!proto.idleafk.Region>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.idleafk.Region, 1));
};


/** @param {!Array.<!proto.idleafk.Region>} value */
proto.idleafk.RegionList.prototype.setRowsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.idleafk.Region=} opt_value
 * @param {number=} opt_index
 * @return {!proto.idleafk.Region}
 */
proto.idleafk.RegionList.prototype.addRows = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.idleafk.Region, opt_index);
};


proto.idleafk.RegionList.prototype.clearRowsList = function() {
  this.setRowsList([]);
};


