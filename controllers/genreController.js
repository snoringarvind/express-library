const Genre = require("../models/genre");
const async = require("async");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const genre = require("../models/genre");
const debug = require("debug")("genre");

//display genre list
exports.genre_list = (req, res) => {
  Genre.find({})
    .sort([["name", "ascending"]])
    .exec((err, genre_list) => {
      if (err) next(err);
      res.render("genre_list", { title: "Genre List", list_genre: genre_list });
    });
};

//specific genre
exports.genre_detail = (req, res) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      book: (callback) => Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);
      if (results.genre === null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      res.render("genre_detail", {
        title: "Genre detail",
        genre: results.genre,
        book: results.book,
      });
    }
  );
};

//display genre create form get
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

//handle genre create for post
exports.genre_create_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    // debug(errors);
    debug(errors.array());
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("genre_form", { genre: genre, errors: errors.array() });
      return;
    } else {
      Genre.findOne({ name: genre.name }).exec((err, found_genre) => {
        if (err) return next(err);
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

//display genre delete form get
exports.genre_delete_get = (req, res) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (genre == null) {
        res.redirect("/catalog/genres");
        return;
      }
      res.render("genre_delete", {
        title: "Genre delete",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

//handle genre delte form post
exports.genre_delete_post = (req, res, next) => {
  debug("hahaha i am in");
  // async.parallel(
  //   {
  //     genre: (callback) => Genre.findById(req.body.genreid).exec(callback),
  //     genre_books: (callback) =>
  //       Book.find({ genre: req.body.genreid }).exec(callback),
  //   },
  //   (err, results) => {
  //     if (err) return next(err);
  //     if (results.genre == null) {
  //       res.redirect("/catalog/genres");
  //       return;
  //     }
  //     if (results.genre_books.length > 0) {
  //       res.render("genre_delete", {
  //         title: "Genre delete",
  //         genre: genre_books,
  //         genre_books: results.genre_books,
  //       });
  //       return;
  //     } else {
  //       Genre.findByIdAndRemove(req.body.genreid, (err) => {
  //         if (err) return next(err);
  //         else {
  //           res.redirect("/catalog/genres");
  //         }
  //       });
  //     }
  //   }
  // );
  Genre.findByIdAndRemove(req.body.genreid, (err) => {
    if (err) return next(err);
    else {
      res.redirect("/catalog/genres");
    }
  });
};

//display genre update form get
exports.genre_update_get = (req, res) => {
  Genre.find({}, (err, results) => {
    if (err) return next(err);
    else {
      res.render("genre_form", { title: "Update genre", genre: results });
    }
  });
};

//handle genre update form post
exports.genre_update_post = [
  body("name", "genre name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update genre",
        genre: genre,
        errors: errors.array(),
      });
    } else {
      Genre.findOne({ name: genre.name }, (err, result) => {
        if (err) return next(err);
        if (result) {
          res.redirect(result.url);
          return;
        } else {
          Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, doc) => {
            if (err) return next(err);
            else {
              res.redirect(doc.url);
            }
          });
        }
      });
    }
  },
];
