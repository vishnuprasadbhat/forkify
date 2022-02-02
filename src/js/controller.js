import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; //ployfilling array methods, promise...
import 'regenerator-runtime/runtime'; //polyfilling aysnc functions
import { async } from 'regenerator-runtime';
//This is from parcel - to reload the page without changing the current state. it only loads the updated module alone
// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const contolRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultView.update(model.getSearchResultPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const contolSearchResults = async function () {
  try {
    //1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    resultView.renderSpinner();

    //2. Load Search results
    await model.loadSearchResults(query);
    const results = model.state.search.results;

    //3. Rendering search results
    resultView.render(model.getSearchResultPage());

    //4. Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (gotoPage) {
  resultView.renderSpinner();

  //1. Rendering New results
  resultView.render(model.getSearchResultPage(gotoPage));

  //2. Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // console.log('serving clicked');

  //Update the recipee servigs(in State)
  model.updateServigs(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. Add/remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2. Update recipe view
  recipeView.update(model.state.recipe);

  //3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // console.log(newRecipe);

    addRecipeView.renderSpinner();

    //Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    //Display Success Message
    addRecipeView.renderMessage();

    // Render Bookmark View
    bookmarksView.render(model.state.bookmarks);

    // change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥💥💥', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the Fokify Application');
};

const init = function () {
  window.location.hash = '';
  recipeView.addHandlerRender(contolRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(contolSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();
