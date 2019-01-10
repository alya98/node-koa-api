const knex = require('../connection');

function getAllMovies() {
  return knex('movies')
  .select('*');
}

function getSingleMovie (id) {
  return knex('movies').select('*').where({ id: parseInt(id) })
}

function addNewMovie(movie) {
  return knex('movies').insert(movie).returning('*');
}

function updateMovie(id, params) {
  return knex('movies').where({id: parseInt(id)}).update(params).returning('*');
}

module.exports = {
  getAllMovies, getSingleMovie, addNewMovie, updateMovie
};