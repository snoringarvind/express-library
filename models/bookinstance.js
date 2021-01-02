const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "book", required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

//virtual for bookinstance's url
BookInstanceSchema.virtual("url").get(function () {
  return "/catalog/bookinstance/" + this._id;
});

//virtual for bookinstance due_date
BookInstanceSchema.virtual("due_back_formatted").get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate();
});
//export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);
