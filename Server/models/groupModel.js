const { Schema, model } = require('mongoose');

const groupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = model('Group', groupSchema);
