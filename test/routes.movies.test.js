process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../src/server/index');
const knex = require('../src/server/db/connection');

describe('routes : movies', () => {

  beforeEach(() => {
    return knex.migrate.rollback()
    .then(() => { return knex.migrate.latest(); })
    .then(() => { return knex.seed.run(); });
  });

  afterEach(() => {
    return knex.migrate.rollback();
  });

  describe('GET /movies', () => {
    it('should return all movies', (done) => {
      chai.request(server)
      .get('/movies')
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        res.body.status.should.eql('success');
        // the JSON response body should have a
        // key-value pair of {"data": [3 movie objects]}
        res.body.data.length.should.eql(3);
        // the first object in the data array should
        // have the right keys
        res.body.data[0].should.include.keys(
          'id', 'name', 'genre', 'rating', 'explicit'
        );
        done();
      });
    });
  });


  describe('GET /movies/:id', () => {
    it('should respond with a single movie', (done) => {
      chai.request(server)
      .get('/movies/1')
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        res.body.status.should.eql('success');
        // the JSON response body should have a
        // key-value pair of {"data": 1 movie object}
        res.body.data[0].should.include.keys(
          'id', 'name', 'genre', 'rating', 'explicit'
        );
        done();
      });
    });

    it('should throw an error if the movie does not exist', (done) => {
      chai.request(server)
      .get('/movies/9999999')
      .end((err, res) => {
        // there should an error
        //should.exist(err);
        // there should be a 404 status code
        res.status.should.equal(404);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "error"}
        res.body.status.should.eql('error');
        // the JSON response body should have a
        // key-value pair of {"message": "That movie does not exist."}
        res.body.message.should.eql('That movie does not exist.');
        done();
      });
    });
  });

  describe('POST /movies', () => {
    it('should return the movie that was added', (done) => {
      chai.request(server)
      .post('/movies')
      .send({
        name: 'Titanic',
        genre: 'Drama',
        rating: 8,
        explicit: true
      })
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
      // there should be a 201 status code
      // (indicating that something was "created")
        res.status.should.equal(201);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        res.body.status.should.eql('success');
        // the JSON response body should have a
        // key-value pair of {"data": 1 movie object}
        res.body.data[0].should.include.keys(
          'id', 'name', 'genre', 'rating', 'explicit'
        );
        done();
      });
    });

    it('should throw an error if the payload is malformed', (done) => {
      chai.request(server)
      .post('/movies')
      .send({
        name: 'Titanic'
      })
      .end((err, res) => {
        // there should an error
        // should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "error"}
        res.body.status.should.eql('error');
        // the JSON response body should have a message key
        should.exist(res.body.message);
        done();
      });
    });
  });

  describe('PUT /movies', () => {
    it('should return the movie that was updated', (done) => {
      knex('movies')
      .select('*')
      .then((movie) => {
        const movieObject = movie[0];
        chai.request(server)
        .put(`/movies/${movieObject.id}`)
        .send({
          rating: 9
        })
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          res.body.status.should.eql('success');
          // the JSON response body should have a
          // key-value pair of {"data": 1 movie object}
          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          // ensure the movie was in fact updated
          const newMovieObject = res.body.data[0];
          newMovieObject.rating.should.not.eql(movieObject.rating);
          done();
        });
      });
    });

    it('should throw an error if the movie does not exist', (done) => {
      chai.request(server)
      .put('/movies/9999999')
      .send({
        rating: 9
      })
      .end((err, res) => {
        // there should an error
        //should.exist(err);
        // there should be a 404 status code
        res.status.should.equal(404);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "error"}
        res.body.status.should.eql('error');
        // the JSON response body should have a
        // key-value pair of {"message": "That movie does not exist."}
        res.body.message.should.eql('That movie does not exist.');
        done();
      });
    });
  });

  describe('DELETE /movies/:id', () => {
    it('should return the movie which was deleted', (done) => {
      knex('movies')
      .select('*')
      .then((movies) => {
        const movieObject = movies[0];
        const lengthBeforeDelete = movies.length;
        chai.request(server)
        .delete(`/movies/${movieObject.id}`)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          res.body.status.should.eql('success');
          // the JSON response body should have a
          // key-value pair of {"data": 1 movie object}
          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          // ensure the movie was in fact deleted
          knex('movies').select('*').then(updatedMovies => {
            updatedMovies.length.should.not.equal(lengthBeforeDelete)
            done();
          })
      });
    });
  });

    it('should throw an error if the movies does not exist', (done) => {
      chai.request(server)
      .delete('/movies/9999')
      .end((err, res) => {
        // there should an error
        // should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(404);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "error"}
        res.body.status.should.eql('error');
        // the JSON response body should have a message key
        res.body.message.should.eql('That movie does not exist.');
        done();
      });
    });
  });
});