const express = require("express");
const router = express.Router();

//require controller modules.
const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const book_instance_controller = require("../controllers/bookInstanceController");
const genre_controller = require("../controllers/genreController");

/// Book routes

//get catalog home page
router.get("/", book_controller.index);

//book list
router.get("/books", book_controller.book_list);

//book create get
router.get("/book/create", book_controller.book_create_get);

//book create post
router.post("/book/create", book_controller.book_create_post);

//book update get
router.get("/book/:id/update", book_controller.book_update_get);

//book update post
router.post("/book/:id/update", book_controller.book_update_post);

//book delete get
router.get("/book/:id/delete", book_controller.book_delete_get);

//book delete post
router.post("/book/:id/delete", book_controller.book_delete_post);

//book specific
router.get("/book/:id", book_controller.book_detail);

// author routes

//author list
router.get("/authors", author_controller.author_list);

//author create get
router.get("/author/create", author_controller.author_create_get);

//author create post
router.post("/author/create", author_controller.author_create_post);

//author update get
router.get("/author/:id/update", author_controller.author_update_get);

//author update post
router.post("/author/:id/update", author_controller.author_update_post);

//author delete get
router.get("/author/:id/delete", author_controller.author_delete_get);

//author delete post
router.post("/author/:id/delete", author_controller.author_delete_post);

//author specific
router.get("/author/:id", author_controller.author_detail);

/// genre routes

//genre create get
router.get("/genre/create", genre_controller.genre_create_get);

//genre create post
router.post("/genre/create", genre_controller.genre_create_post);

//genre update get
router.get("/genre/:id/update", genre_controller.genre_update_get);

//genre update post
router.post("/genre/:id/update", genre_controller.genre_update_post);

//genre delete get
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

//genre delete post
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

//genre specific
router.get("/genre/:id", genre_controller.genre_detail);

//genre list
router.get("/genres", genre_controller.genre_list);

///bookinstance routes

//bookinstance create get
router.get(
  "/bookinstance/create",
  book_instance_controller.bookinstance_create_get
);

//bookinstance create post
router.post(
  "/bookinstance/create",
  book_instance_controller.bookinstance_create_post
);

//bookinstance update get
router.get(
  "/bookinstance/:id/update",
  book_instance_controller.bookinstance_update_get
);

//bookinstance update post
router.post(
  "/bookinstance/:id/update",
  book_instance_controller.bookinstance_update_post
);

//bookinstance delete get
router.get(
  "/bookinstance/:id/delete",
  book_instance_controller.bookinstance_delete_get
);

//bookinstance delete post
router.post(
  "/bookinstance/:id/delete",
  book_instance_controller.bookinstance_delete_post
);

//specific bookinstance
router.get("/bookinstance/:id", book_instance_controller.bookinstance_detail);

//bookinstance list
router.get("/bookinstances", book_instance_controller.bookinstance_list);

module.exports = router;
