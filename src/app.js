const API_KEY = "637afa20618583ab69af603bf4957c4a";
const API_HREF = "https://api.themoviedb.org/3";
const IMAGES_HREF = "https://image.tmdb.org/t/p/w400";
// https://api.themoviedb.org/3/movie/550?api_key=637afa20618583ab69af603bf4957c4a
const data = { movies: [] };

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

    getData({
      params: ["search", "movie"],
      query,
      cb: movies => {
        data.movies = movies || [];
        render();
      }
    });
  };
}
function displayTrends() {
  getData({
    params: ["trending", "movie", "week"],
    cb: movies => {
      data.movies = movies || [];
      render();
    }
  });
}
function getData({ params = [], query = "", cb }) {
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
        cb(json.results);
      });
    })
    .catch(error => {
      console.log("Something goes wrong: ", error);
    });
}
function render() {
  const moviesList = document.getElementById("movies-list");
  let wrapper = document.createElement("div");
  data.movies.forEach(movie => {
    wrapper.appendChild(createListItem(movie, displayMovie));
  });

  moviesList.innerHTML = "";
  moviesList.appendChild(wrapper);
}
function createListItem(movie, displayMovie) {
  let item = document.createElement("div");
  item.className = "movies-list-item";
  item.id = movie.id;
  let title = document.createElement("h5");
  title.innerText = movie.title;
  item.appendChild(title);
  item.onclick = function() {
    displayMovie(movie.id);
  };
  return item;
}
function displayMovie(id) {
  const movie = data.movies.find(m => m.id === id);
  console.log(movie);
}
