import { API_URL, API_KEY, RES_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';
// import { getJson, sendJson } from './helpers.js';

export const state = {
  recipe: {},
  search: { query: '', results: [], resultsPerPage: RES_PER_PAGE, page: 1 },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    title: recipe.title,
    cookingTime: recipe.cooking_time,
    id: recipe.id,
    ingredients: recipe.ingredients,
    servings: recipe.servings,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    //1. Loading recipe
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    //1. search recipe
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    const { recipes } = data.data;
    state.search.results = recipes.map(recipe => {
      return {
        publisher: recipe.publisher,
        image: recipe.image_url,
        title: recipe.title,
        id: recipe.id,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.page = 1;
    // console.log(state.search.results);
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0
  const end = page * state.search.resultsPerPage; //9
  return state.search.results.slice(start, end);
};

export const updateServigs = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    //formula: new quantity = oldQt * newQt /oldServings
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // remove current recipe as bookmark

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      title: newRecipe.title,
      cooking_time: +newRecipe.cookingTime,
      ingredients: ingredients,
      servings: +newRecipe.servings,
    };
    console.log(recipe);

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    console.log(data);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
