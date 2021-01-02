const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

//virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  return this.family_name + "," + this.first_name;
});

//virtual for autho's lifespan
AuthorSchema.virtual("lifespan").get(function () {
  let x;
  let y;
  if (this.date_of_birth) {
    x = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_MED
    );
  } else {
    x = "";
  }
  if (this.date_of_death) {
    y = DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_MED
    );
  } else {
    y = "";
  }
  return x + " - " + y;
});

//virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

AuthorSchema.virtual("formatted_date_of_birth").get(function () {
  if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_MED
    );
  }
});

AuthorSchema.virtual("formatted_date_of_death").get(function () {
  if (this.date_of_death) {
    return DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_MED
    );
  }
});

AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
  }
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  if (this.date_of_death) {
    return DateTime.fromJSDate(this.date_of_death).toISODate();
  }
});

//export model
module.exports = mongoose.model("Author", AuthorSchema);
