$(document).ready(function () {
  addRandomQuote();
  
  $("#generate-quote").on("click", function(){
    addRandomQuote();
  });

  $("#tweet-quote").on("click", function(){
    tweetQuote();
  });

});

function addRandomQuote(){
  $.get(getRandomQuoteUrl(), function (jsonValue, status) {
    var quote = jsonValue[0].content;
    var author = jsonValue[0].title;
    addQuote(quote, author);
  });
}

function addQuote(quote, author) {
  var quoteNoParagraph = quote.trim().replace("<p>", "").replace("</p>", "");
  $(".quote").html(quoteNoParagraph);
  $(".author").html(author.trim());
}

function getRandomQuoteUrl(){
  var randomQuoteNumber = Math.floor(Math.random() * 25);
  return "https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=" + randomQuoteNumber + "&callback=?"
}

function tweetQuote(){
  var text = "";
  text += "\"" +  $(".quote").html() + "\"";
  text += "-" + $(".author").html();
  $("#tweet-input").val(text);
  $("#tweet-form").submit();
}



