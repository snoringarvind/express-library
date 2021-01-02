const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const async = require("async");
const { body, validationResult } = require("express-validator");
const { find } = require("../models/book");
const book = require("../models/book");
const genre = require("../models/genre");
const author = require("../models/author");
const debug = require("debug")("book");

//index/home catalog page
exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (callback) => {
        Book.countDocuments({}, callback);
      },
      author_count: (callback) => {
        Author.countDocuments({}, callback);
      },
      genre_count: (callback) => {
        Genre.countDocuments({}, callback);
      },
      book_instance_count: (callback) => {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: (callback) => {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

//display book list
exports.book_list = (req, res) => {
  Book.find({}, "title author")
    .populate("author")
    .exec((err, list_books) => {
      if (err) {
        return next(err);
      }
      //sucessful so render
      res.render("book_list", { title: "Book List", book_list: list_books });
    });
};

//specific book
exports.book_detail = (req, res) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id).populate("author genre").exec(callback),
      bookInstance: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      res.render("book_detail", {
        title: "book_detail",
        book: results.book,
        bookinstance: results.bookInstance,
      });
    }
  );
};

//display book create form get
exports.book_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

//handle book create form post
exports.book_create_post = [
  // Convert the genre req to an array.
  (req, res, next) => {
    debug("req.body.genre=", req.body.genre);
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
        debug("empty", req.body.genre);
      } else {
        req.body.genre = new Array(req.body.genre);
        debug("full", req.body.genre);
      }
    }
    next();
  },

  // Validate and sanitise fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });
    debug("genre=", book.genre);
    debug("isbn=", book.isbn);
    debug("author=", book.author); //auhtor id is logged
    debug("sumary=", book.summary); //summary value is logged
    debug("book id", book._id);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          debug("results.genres", results.genres);
          // debug("results.author", results.authors);
          debug("book.genre=", book.genre);
          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
              debug("checked", results.genres[i]);
            }
          }
          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];

//display book delete form get
exports.book_delete_get = (req, res) => {
  async.parallel(
    {
      book: (callback) => Book.findById(req.params.id).exec(callback),
      book_bookinstances: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book == null) {
        res.redirect("/catalog/books");
        return;
      }
      res.render("book_delete", {
        title: " delete book",
        book: results.book,
        book_bookinstances: results.book_bookinstances,
      });
    }
  );
};

//handle book delete post
exports.book_delete_post = (req, res) => {
  debug("haha=", req.body.bookid);
  Book.findByIdAndRemove(req.body.bookid, (err) => {
    if (err) return next(err);
    else {
      res.redirect("/catalog/books");
    }
  });
};

//display book update form get
exports.book_update_get = (req, res) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate("author")
          .populate("author")
          .exec(callback),
      authors: (callback) => {
        Author.find({}).exec(callback);
      },
      genres: (callback) => Genre.find({}).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book == null) {
        const err = new Error("book not found");
        err.status = 404;
        return next(err);
      }
      // debug("book=", results.book.genre);
      // debug("authors=", results.authors);
      // debug("genres=", results.genres);
      // debug("genres length=", results.genres.length);
      // debug("book genre length=", results.book.genre.length);

      for (i = 0; i < results.book.genre.length; i++) {
        for (j = 0; j < results.genres.length; j++) {
          if (
            results.book.genre[i]._id.toString() ==
            results.genres[j]._id.toString()
          ) {
            results.genres[j].checked = true;
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        book: results.book,
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

//handle book update post
exports.book_update_post = [
  (req, res, next) => {
    if (req.body.genre instanceof Array) {
      debug("lets=", req.body.genre);
    } else {
      debug("jj=", req.body.genre);
    }
    next();
  },
  //validate and sanitise
  body("title", "Title must not be empty").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "isbn must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  //process request after validation and sanitization
  (req, res, next) => {
    //extract validation errors
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });
    debug("hah", book.genre, req.params.id);
    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: (callback) => Author.find({}).exec(callback),
          genres: (callback) => Genre.find({}).exec(callback),
        },
        (err, results) => {
          if (err) return next(err);
          for (i = 0; i < book.genre.length; i++) {
            for (j = 0; j < results.genres.length; j++) {
              if (
                book.genre[i]._id.toString() == results.genres[j]._id.toString()
              ) {
                results.genres[j].checked = true;
              }
            }
          }
          res.render("book_form", {
            title: "Update Book",
            genres: results.genres,
            authors: results.authors,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // data from form is valid so update
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
        if (err) return next(err);
        else {
          res.redirect(thebook.url);
        }
      });
    }
  },
];
