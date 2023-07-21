const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");

const sqlite = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`db error : ${error.message}`);
    console.log(error);
  }
};

initializeDataBaseAndServer();

const convertToCamelCase = (data) => {
  return {
    movieId: data.movie_id,
    directorId: data.director_id,
    movieName: data.movie_name,
    leadActor: data.lead_actor,
    directorName: data.director_name,
  };
};

// API 1 Get All Movie Names from Movie table

app.get("/movies/", async (request, response) => {
  const allMovieNamesQuery = `
    SELECT movie_name as movieName from movie
    `;
  const responseData = await db.all(allMovieNamesQuery);
  // response.send(responseData.map(each=>))
  response.send(responseData);
});

// API 2 Creating a New Movie data

app.post("/movies/", async (request, response) => {
  const movieData = request.body;
  const { directorId, movieName, leadActor } = movieData;

  const createNewMovieQuery = `
    INSERT INTO
        movie(director_id, movie_name, lead_actor)
    VALUES
        (${directorId}, "${movieName}", '${leadActor}')
    `;
  await db.run(createNewMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 Get A Specific Movie Data

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieDataQuery = `
    SELECT * from movie
    WHERE
        movie_id = ${movieId}
    `;
  const responseData = await db.get(getMovieDataQuery);
  response.send(convertToCamelCase(responseData));
});

// API 4 Update a specific movie data

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieData = request.body;
  const { directorId, movieName, leadActor } = movieData;

  const updateMovieQuery = `
    UPDATE
        movie
    SET
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
    WHERE 
        movie_id = ${movieId}
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 Delete a specific movie data from movie table

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6 Get all Directors list from director table

app.get("/directors/", async (request, response) => {
  const allDirectorsQuery = `
    SELECT
        * 
    FROM 
        director
    `;
  const responseData = await db.all(allDirectorsQuery);
  response.send(responseData.map((each) => convertToCamelCase(each)));
  //   response.send(responseData);
});

// API 7 Get All Movie Names from a Particular Director

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;

  const singleDirectorMoviesQuery = `
    SELECT
        movie_name
    FROM 
        movie
    WHERE
        director_id = ${directorId}
    `;
  const responseData = await db.all(singleDirectorMoviesQuery);
  response.send(responseData.map((each) => convertToCamelCase(each)));
  //   response.send(responseData);
});

module.exports = app;
