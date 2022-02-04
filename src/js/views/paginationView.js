import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      e.preventDefault();
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const gotoPage = +btn.dataset.goto;
      //   console.log(gotoPage);

      handler(gotoPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // Page 1, and there are other
    if (curPage === 1 && numPages > 1) {
      return (
        this._generateMarkupPaginationGotoLast(numPages) +
        this._generateMarkupPaginationNext(curPage)
      );
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return (
        this._generateMarkupPaginationPrev(curPage) +
        this._generateMarkupPaginationGotoFirst()
      );
    }

    // Other pages
    if (curPage < numPages) {
      return (
        this._generateMarkupPaginationPrev(curPage) +
        this._generateMarkupPaginationGotoLast(numPages) +
        this._generateMarkupPaginationNext(curPage)
      );
    }

    // Page 1, and there are NO other pages
    return '';
  }

  _generateMarkupPaginationNext(curPage) {
    return `
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
            </svg>
      </button>
      `;
  }

  _generateMarkupPaginationPrev(curPage) {
    return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
        </button>
      `;
  }

  _generateMarkupPaginationGotoLast(numPages) {
    return `
        <button data-goto="${numPages}" class="btn--inline pagination__btn--center">
          <span>Goto Page: ${numPages}</span>
        </button>
      `;
  }

  _generateMarkupPaginationGotoFirst() {
    return `
        <button data-goto="1" class="btn--inline pagination__btn--center">
          <span>Goto Page: 1</span>
        </button>
      `;
  }
}

export default new PaginationView();
