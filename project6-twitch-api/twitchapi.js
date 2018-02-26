var STREAMERS_IDS = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

var OFFLINE_FILTER = 'offline';
var ONLINE_FILTER = 'online';

class UserDataFilter{

  constructor(userFilter){
    this._userFilter = userFilter;
  }

  ignore(userData){
    if(userData == null){
      return false;
    }
    if(this._userFilter.length < 3){
      return false;
    }
    var displayName = userData.display_name;
    if(displayName.toLowerCase().indexOf(this._userFilter.toLowerCase()) !== -1) {
      return false;
    }
    return true;
  }
}

class StreamDataFilter {

  constructor(filterStatus){
    this._filterStatus = filterStatus;
  }

  ignore(streamData){
    if(streamData === null || streamData === undefined){
      return false;
    }

    var streamOffline = streamData.stream === null;

    if(this._filterStatus === OFFLINE_FILTER && streamOffline){
      return false;
    }

    if(this._filterStatus === ONLINE_FILTER && !streamOffline){
      return false;
    }

    return true;
  }

}

$(document).ready(function(){

  setupFilterButtons();
  populateStreamers();

});

function populateStreamers(){
  $('.streamers-table-row').remove();

  var target = {
    'val': STREAMERS_IDS.length,
    'idx': 0
  };

  var streamDataFilter = null;
  if( filterSelected($('#online-filter-button'))){
    streamDataFilter = new StreamDataFilter(ONLINE_FILTER);
  } else if(filterSelected($('#offline-filter-button'))) {
    streamDataFilter = new StreamDataFilter(OFFLINE_FILTER);
  }

  var userDataFilter


  STREAMERS_IDS.forEach(function(el){
    populateStreamer(el, target, null, streamDataFilter);
  });
}

function filterSelected(filterJQuerryObj){
 return filterJQuerryObj.hasClass('selected-filter');
}


function populateStreamer(streamerId,target,userDataFilter,streamDataFilter){
  $.ajax({
    url: 'https://wind-bow.glitch.me/twitch-api/users/' + streamerId,
    type: 'GET',
    success: function (result) {
      if( userDataFilter !==null && userDataFilter.ignore(result)){
        checkIfAjaxReady(target);
        return;
      }
      var userData = result;
      $.ajax({
        url: 'https://wind-bow.glitch.me/twitch-api/streams/' + streamerId,
        type: 'GET',
        success: function (result) {
          if(streamDataFilter !== null && streamDataFilter.ignore(result)){
            checkIfAjaxReady(target);
            return;
          }
          var streamData = result;
          createStreamer(userData, streamData);
          checkIfAjaxReady(target);
        },
        error: function (xhr) {
          alert("An error occured: " + xhr.status + " " + xhr.statusText);
        }
      });
    },
    error: function (xhr) {
      alert("An error occured: " + xhr.status + " " + xhr.statusText);
    }
  });
}

function checkIfAjaxReady(target, toExecute){
  if(++target.idx === target.val){
    setupDetailsButton();
  }
}

function createStreamer(userData, streamData){

  var tableContainer = $('.streamers-container').children();

  var streamersRow = $('<div/>', {
    class:'row streamers-table-row'
  }).appendTo(tableContainer);

  var streamersMainContent = $('<div/>', {
    class:'row streamers-row-main-content'
  }).appendTo(streamersRow);

  //add icon
  var streamerInfoIconContainer = $('<div/>', {
    class:'col-md-1 streamer-info streamer-info-icon'
  }).appendTo(streamersMainContent);

  var streamerInfoIcon = $('<img/>', {
    class: 'img-circle img-responsive',
    src: userData.logo
  }).appendTo(streamerInfoIconContainer);

  //add icon and name
  var streamerInfoNameContainer = $('<div/>', {
    class: 'col-md-1 streamer-info streamer-info-name'
  }).appendTo(streamersMainContent);

  var streamerInfoNameTitle = $('<h6/>').appendTo(streamerInfoNameContainer);
  var streamerInfoNameLink = $('<a/>', {
    href: 'https://www.twitch.tv/' + userData.display_name,
    target: '_blank',
    text: userData.display_name
  }).appendTo(streamerInfoNameTitle);

  //add stream status
  var statusIconContainer = $('<div/>', {
    class: 'col-md-offset-7 col-md-1'
  }).appendTo(streamersMainContent);

  var statusIconClass = streamData.stream == null ? 'glyphicon-remove-sign offline-icon' : 'glyphicon-ok-sign online-icon';
  var statusIcon = $('<i/>', {
    class: 'glyphicon ' + statusIconClass
  }).appendTo(statusIconContainer);

  //Add Details
  var detailsTitleContainer = $('<div/>', {
    class: 'col-md-1'
  }).appendTo(streamersMainContent);

  var detailsTitle = $('<p/>', {
    class: 'details-text',
    text: 'Details'
  }).appendTo(detailsTitleContainer);

  var detailsButtonContainer = $('<div/>', {
    class: 'col-md-1'
  }).appendTo(streamersMainContent);

  var detailsButton =  $('<i/>', {
    class: 'details-icon glyphicon glyphicon-chevron-down'
  }).appendTo(detailsButtonContainer);

  if(streamData.stream !== null){
    var detailsRow = $('<div/>', {
      class: 'row streamers-row-details hidden-row',
    }).appendTo(streamersRow); 


    var detailsContentContainer = $('<div/>', {
      class: 'col-md-offset-6 col-md-6 text-center'
    }).appendTo(detailsRow);
    
    var detailsContent = $('<h6/>', {
      text: 'Streaming: '
    }).appendTo(detailsContentContainer);

    var detailsContentEm = $('<em/>', {
      text: streamData.stream.game
    }).appendTo(detailsContent);
  }

}

function setupFilterButtons(){
  $('.filter-btn').on('click', function(){
    var selectedFilterClass = 'selected-filter';
    $('.filter-btn').removeClass(selectedFilterClass);
    $(this).addClass(selectedFilterClass);
    populateStreamers();
  });
}

function setupDetailsButton(){

  $('.details-icon').on('click', function(){
    var jquerryDetailsButtonObj = $(this); 
    var hide = isDetailsExpanded(jquerryDetailsButtonObj);
    var detailsRow = getDetailsRow(jquerryDetailsButtonObj);
    if (hide) {
      detailsRow.hide('slow');
      jquerryDetailsButtonObj.removeClass('glyphicon-chevron-up');
      jquerryDetailsButtonObj.addClass('glyphicon-chevron-down');
    } else {
      detailsRow.show('slow');
      jquerryDetailsButtonObj.removeClass('glyphicon-chevron-down');
      jquerryDetailsButtonObj.addClass('glyphicon-chevron-up');
    }
  });
}

function isDetailsExpanded(jquerryDetailsButtonObj){
  return jquerryDetailsButtonObj.hasClass('glyphicon-chevron-up');
}

function getDetailsRow(jquerryDetailsButtonObj){
  return jquerryDetailsButtonObj.parent().parent().parent().children('.streamers-row-details');
}

