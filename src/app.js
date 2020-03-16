const API_KEY = "637afa20618583ab69af603bf4957c4a";
const API_HREF = "https://api.themoviedb.org/3";
const IMAGES_HREF = "https://image.tmdb.org/t/p/w400";

const data = {
  movies: [],
  selectedMovie: null
};

window.onload = function() {
  displayTrends();
  setSearchHandler();
};

function setSearchHandler() {
  searchForm = document.getElementById("search-form");
  searchForm.onsubmit = function(e) {
    e.preventDefault();

    let query = document.getElementById("search-input").value;

    // if empty search query
    if (query === "") return;
    data.selectedMovie = null;
    getDataAsync({
      params: ["search", "movie"],
      query
    }).then(movies => {
      data.movies = movies || [];
      render();
    });
  };

  // set trends button handler
  document.getElementById("trends-button").onclick = () => {
    displayTrends();
  };
}

function displayTrends() {
  data.selectedMovie = null;

  Promise.all([
    getDataAsync({
      params: ["trending", "movie", "week"]
    }),
    getDataAsync({
      params: ["trending", "tv", "week"]
    })
  ])
    .then(([movies, tv]) => {
      data.movies = [];
      // set title property for tv-serials
      tv = tv.map(t => {
        return { ...t, title: t.name };
      });

      for (let i = 0; i < 10 && i < movies.length && i < tv.length; i++) {
        data.movies.push(movies[i], tv[i]);
      }

      render();
    })
    .catch(error => alert(error));
}

function getDataAsync({ params = [], query = "" }) {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      params = "/" + params.join("/");
    }
    if (query) {
      query = "&query=" + query;
    }
    let href = `${API_HREF}${params}?api_key=${API_KEY}${query}`;
    fetch(href)
      .then(response => {
        response.json().then(json => {
          resolve(json.results);
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function render() {
  const moviesList = document.getElementById("movies-list");
  const movieDetails = document.getElementById("movie-details");

  if (!!data.selectedMovie == true) {
    // render movie details

    movieDetails.style.display = "block";
    moviesList.style.display = "none";
    renderMovieDetails();
  } else {
    // render movies list

    movieDetails.style.display = "none";
    moviesList.style.display = "block";
    renderMoviesList();
  }
}

function renderMovieDetails() {
  const movie = data.selectedMovie;
  const movieDetails = document.getElementById("movie-details");

  // set data
  const poster = movieDetails.getElementsByClassName("poster")[0];
  poster.setAttribute("src", IMAGES_HREF + movie.poster_path);

  const title = movieDetails.getElementsByClassName("title")[0];
  title.innerText = movie.title;

  const overview = movieDetails.getElementsByClassName("overview")[0];
  overview.innerText = movie.overview;

  const recommendations = movieDetails.getElementsByClassName(
    "recommendations"
  )[0];
  recommendations.innerText = "Load...";

  // load recommendations
  getDataAsync({
    params: ["movie", movie.id, "recommendations"]
  }).then(movies => {
    recommendations.innerHTML = "";

    if (movies.length === 0) {
      recommendations.innerText = "Recommendations not found :(";
    }

    let wrapper = document.createElement("div");
    for (let i = 0; i < movies.length && i < 5; i++) {
      const movie = movies[i];
      wrapper.appendChild(createListItem(movie, displayMovie));
    }
    recommendations.appendChild(wrapper);
  });
}

function renderMoviesList() {
  const moviesList = document.getElementById("movies-list");
  // clear movies list
  moviesList.innerHTML = "";

  if (data.movies.length === 0) {
    // movies list empty

    let paragraph = document.createElement("p");
    paragraph.innerText = "Movies not found :(";
    moviesList.appendChild(paragraph);
    return;
  }

  let wrapper = document.createElement("div");
  data.movies.forEach(movie => {
    wrapper.appendChild(createListItem(movie, displayMovie));
  });

  moviesList.appendChild(wrapper);
}

function createListItem(movie, displayMovie) {
  let item = document.createElement("div");
  item.className = "movies-list-item";
  item.id = movie.id;
  let title = document.createElement("h5");
  title.className = "title";
  title.innerText = movie.title;
  item.appendChild(title);
  item.onclick = function() {
    displayMovie(movie);
  };
  return item;
}

function displayMovie(movie) {
  data.selectedMovie = movie;
  render();
}
