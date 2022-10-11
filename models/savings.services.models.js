const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    charge: {
      type: String,
      required: true,
    },
  },
  {
    collection: "savings_and_services_info",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('ourServices', servicesSchema);
