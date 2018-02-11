var WIKI_COMPONENTS = [];

class WikiComponent {

  constructor(searchBehaviour, cancelBehaviour, resultBehaviour, noResultBehaviour) {
    this._searchBehaviour = searchBehaviour;
    this._cancelBehaviour = cancelBehaviour;
    this._resultBehaviour = resultBehaviour;
    this._noResultBehaviour = noResultBehaviour;
  }


  triggerSearchBehaviour() {
    this._searchBehaviour();
  }

  triggerCancelBehaviour() {
    this._cancelBehaviour();
  }

  triggerResultBehaviour(searchText) {
    this._resultBehaviour(searchText);
  }

  triggerNoResultBehaviour(){
    this._noResultBehaviour();
  }
}

// Cancel row behaviours -----------------------

var CancelRowBehaviour = {
  search: function () {
    $('.cancel-button-container').addClass('col-md-offset-4');
    $('.cancel-button-container').removeClass('text-left');
    $('.cancel-button-container').addClass('text-center');
    showRow('cancel-row');
  },
  result: function () {
    $('.cancel-button-container').removeClass('col-md-offset-4');
    $('.cancel-button-container').removeClass('text-center');
    $('.cancel-button-container').addClass('text-left');
    showRow('cancel-row');
  },
  cancel: function () {
    hideRow('cancel-row');
  }
};
// Search buttons (search and random) behaviours -----------

var SearchButtonBehaviour = {
  cancel: function () {
    showRow('buttons-row');
  },
  hidden: function () {
    hideRow('buttons-row');
  }
};
// Search submit button behaviours ---------------------

var SearchSubmitButtonBehaviour = {
  search: function () {
    showRow('search-button-row');
  },
  hidden: function () {
    hideRow('search-button-row');
  }
};

// Wiki search input behaviour ---------------------


var SearchTextInputBehaviour = {
  search: function () {
    showRow('search-text-row');
  },
  hidden: function () {
    hideRow('search-text-row');
  }
};

var TopMarginRowBehaviour = {
  expanded: function () {
    $('#empty-top-row').removeClass('empty-row-minimized');
    $('#empty-top-row').addClass('empty-row-expanded');
  },
  minimized: function () {
    $('#empty-top-row').removeClass('empty-row-expanded');
    $('#empty-top-row').addClass('empty-row-minimized');
  }
}

// Result behaviours-------------------------------


var ResultContentBehaviour = {

  result: function (searchText) {
    $.ajax({
      url: buildSearchUrl(searchText),
      type: 'GET',
      success: function (result) {
        if ( ! result.hasOwnProperty('query')){
          WIKI_COMPONENTS.forEach(function(wikiComponent){
            wikiComponent.triggerNoResultBehaviour();
          });
          return;
        }
        var pages = result.query.pages;
        Object.keys(pages).forEach(function(key, index){
          var extract = pages[key].extract;
          createWikiEntry(extract, key);
        });
      },
      error: function (xhr) {
        alert("An error occured: " + xhr.status + " " + xhr.statusText);
      }
    });
  },

  hidden: function () {
    $('.wiki-result-row').remove();
  }
}

// --- NO RESULT BEHAVIOUR -------------------

var NoResultContentBehaviour = {
  noresult : function(){
    showRow('no-result-found-row');
  },

  hidden : function(){
    hideRow('no-result-found-row');
  }
}

// --------------------- End of behaviours



// ------------- Util functions -----------------------

function createWikiEntry(wikiText, wikiPageId) {
  var wikiEntry = $('<div/>', {
    class: 'row wiki-result-row'
  });

  var txt = $('<h5/>', {
    text: wikiText
  });

  txt.appendTo(wikiEntry);

  wikiEntry.on('click', function () {
    var entryWikiForm = $('#entry-wiki-form');
    $('#entry-wiki-link').val(wikiPageId);
    entryWikiForm.submit();
  });


  wikiEntry.appendTo('.container');
}

function hideRow(rowClass) {
  var row = $('.' + rowClass);
  if (!row.hasClass('hidden-row')) {
    $('.' + rowClass).addClass('hidden-row');
  }
}

function showRow(rowClass) {
  $('.' + rowClass).removeClass('hidden-row');
}

function isRowHidden(rowClass){
  return $('.' + rowClass).hasClass('hidden-row');
}

function buildSearchUrl(wikiTextSearch){
 return 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch=' + wikiTextSearch;
}

function buildWikiEntryUrl(wikiPageId){
  return 'http://en.wikipedia.org/wiki?curid=' + wikiPageId;
}

// ------------------ SETUP ----------------------------


$(document).ready(function () {
  setupComponents();
  setupRandomWiki();
  setupSearchButton();
  setupCancelRow();
  setupSubmitWikiSearchRow();
  setupSubmitKeyEvent();
});


function setupComponents() {

  /* WikiComponent(
   search
   cancel
   result
 )
*/
  var cancelRowComponent = new WikiComponent(
    CancelRowBehaviour.search,
    CancelRowBehaviour.cancel,
    CancelRowBehaviour.result,
    CancelRowBehaviour.result
  );

  var buttonSearchRowComponent = new WikiComponent(
    SearchButtonBehaviour.hidden,
    SearchButtonBehaviour.cancel,
    SearchButtonBehaviour.hidden,
    SearchButtonBehaviour.hidden
  );

  var buttonSearchSubmitRowComponent = new WikiComponent(
    SearchSubmitButtonBehaviour.search,
    SearchSubmitButtonBehaviour.hidden,
    SearchSubmitButtonBehaviour.hidden,
    SearchSubmitButtonBehaviour.hidden
  );

  var resultContentComponent = new WikiComponent(
    ResultContentBehaviour.hidden,
    ResultContentBehaviour.hidden,
    ResultContentBehaviour.result,
    ResultContentBehaviour.hidden,
  );

  var searchTextInputRowComponent = new WikiComponent(
    SearchTextInputBehaviour.search,
    SearchTextInputBehaviour.hidden,
    SearchTextInputBehaviour.hidden,
    SearchTextInputBehaviour.hidden
  );

  var topMarginRowComponent = new WikiComponent(
    TopMarginRowBehaviour.expanded,
    TopMarginRowBehaviour.expanded,
    TopMarginRowBehaviour.minimized,
    TopMarginRowBehaviour.minimized
  );

  var noResultRowComponent = new WikiComponent(
    NoResultContentBehaviour.hidden,
    NoResultContentBehaviour.hidden, 
    NoResultContentBehaviour.hidden,
    NoResultContentBehaviour.noresult
  );

  WIKI_COMPONENTS.push(
    cancelRowComponent,
    buttonSearchRowComponent,
    buttonSearchSubmitRowComponent,
    resultContentComponent,
    topMarginRowComponent,
    searchTextInputRowComponent,
    noResultRowComponent
  );
}

function setupRandomWiki() {
  $('.random-wiki-button').on('click', function () {
    $('#random-wiki-form').submit();
  });

}

function setupSearchButton() {
  $('.search-wiki-button').on('click', function () {
    WIKI_COMPONENTS.forEach(function (wikiComponent) {
      wikiComponent.triggerSearchBehaviour();
    });
  });

}

function setupCancelRow() {
  $('.cancel-button').on('click', function () {
    WIKI_COMPONENTS.forEach(function (wikiComponent) {
      wikiComponent.triggerCancelBehaviour();
    });
  });


}

function setupSubmitWikiSearchRow() {
  $('.submit-search-button').on('click', function () {
    var searchText = $('.wiki-search-text').val();
    WIKI_COMPONENTS.forEach(function (wikiComponent) {
      wikiComponent.triggerResultBehaviour(searchText);
    });
  });
}

function setupSubmitKeyEvent(){
  $(".wiki-search-text").keydown(function (e) {
    if (e.keyCode == 13 && ! isRowHidden('search-text-row') ) {
      $('.submit-search-button').click();
    }
  });
}

