const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");
const book = require("../models/book");
const debug = require("debug")("bookinstance");

//display list of all BookInstances.
exports.bookinstance_list = (req, res) => {
  BookInstance.find({})
    .populate("book")
    .exec((err, list_bookinstances) => {
      if (err) throw next(err);
      else {
        res.render("bookinstance_list", {
          title: "Book Instance List",
          bookinstance_list: list_bookinstances,
        });
      }
    });
};

//detail page for specific bookinstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, results) => {
      if (err) next(err);
      if (results == null) {
        const err = new Error("book copy not found");
        err.status = 404;
        return next(err);
      }
      debug(results);
      res.render("bookinstance_detail", {
        title: "bookinstance_detail",
        results: results,
      });
    });
};

//display bookinstance create form on get
exports.bookinstance_create_get = (req, res) => {
  Book.find({}, "title").exec((err, results) => {
    if (err) return next(err);
    else {
      res.render("bookinstance_form", {
        title: "Create book-instance",
        books: results,
      });
    }
  });
};

//handle bookinstance create form on post
exports.bookinstance_create_post = [
  //validate and sanitise fields
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, results) => {
        if (err) return next(err);
        else {
          res.render("bookinstance_form", {
            title: "Create book-instance",
            books: results,
            bookinstance: bookinstance,
            errors: errors.array(),
          });
        }
      });
      return;
    } else {
      bookinstance.save((err) => {
        if (err) return next(err);
        res.redirect(bookinstance.url);
      });
    }
  },
];

//display delete form on get
exports.bookinstance_delete_get = (req, res) => {
  //since bookinstance is not used in other objects..it can be deleted directly.
  BookInstance.findById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (result == null) {
      res.redirect("/catalog/bookinstances");
      return;
    }
    debug("result=", result);
    res.render("bookinstance_delete", {
      title: " Delete bookinstance",
      bookinstance: result,
    });
  });
};

//handle bookinstance delete on post
exports.bookinstance_delete_post = (req, res) => {
  BookInstance.findById(req.body.bookinstanceid, (err, result) => {
    if (err) return next(err);
    if (result === null) {
      res.redirect("/catalog/bookinstances");
      return;
    } else {
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, (err) => {
        if (err) return next(err);
        else {
          //succesfull
          res.redirect("/catalog/bookinstances");
        }
      });
    }
  });
};

//display update form on get
exports.bookinstance_update_get = (req, res) => {
  async.parallel(
    {
      bookinstance: (callback) =>
        BookInstance.findById(req.params.id).exec(callback),
      books: (callback) => Book.find({}).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.bookinstance == null) {
        res.redirect("/catalog/bookinstances");
      } else {
        res.render("bookinstance_form", {
          title: "Update Book",
          books: results.books,
          bookinstance: results.bookinstance,
        });
      }
    }
  );
};

//handle update on post
exports.bookinstance_update_post = [
  body("book").escape(),
  body("imprint", "imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  (req, res, next) => {
    // debug("GREAT");
    // debug("man", req.params.id);

    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, result) => {
        if (err) return next(err);
        else {
          res.render("bookinstance_form", {
            title: "Update bookinstance",
            books: result,
            bookinstance: bookinstance,
            errors: errors.array(),
          });
          return;
        }
      });
    } else {
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        (err, thebookinstance) => {
          if (err) return next(err);
          else {
            res.redirect(thebookinstance.url);
          }
        }
      );
    }
  },
];
