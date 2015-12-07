function sessionOverview() {
  chrome.tabs.query({}, function(tabs) {
    addToTabList(tabs);
    addToHistory(tabs);
  });
}

function addToTabList(list){
  $('#tabs').append("Number of Tabs Open: " + list.length);
  var text = "<ul type='circle'>";

  for (i = 0; i < list.length; i++) { 
      text += "<li>" + list[i].url + "</li>";
  }

  chrome.storage.sync.set({ "data" : text }, function() {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
  });

  $('#tabs').append(text + "</ul>");
}

//saves data temporarily because #tabs is removed before you can read from it
function temporarilySaveData(){
  var currentTime =  new Date().toLocaleTimeString().toString();
  var currentDate = new Date();
  var strDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear() + ' at ';

  chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      console.log(items);
      addToHistory(strDate + currentTime + items.data);
    }
  });
}

function removeElement(indexOne){
  //array[indexOne.charAt(6)] is the entire list from the button you pressed
  //splitter[parseInt(indexOne.charAt(7))+1] splits at <li> to get the link of the button you pressed
  //we get the whole html and then replace the link with nothing
  //get the data from storage and than replace it with the new removed link list

  chrome.storage.sync.get({list: []}, function(data) {
    var array = data.list;
    var finalArray =[ array[0] ];
    var splitter = array[indexOne.charAt(6)].split("<li>").concat("<li>"); //returns first number after button from button 00
  
    array[indexOne.charAt(6)] = array[indexOne.charAt(6)].replace('<li>' + splitter[parseInt(indexOne.charAt(7))+1], "");

    chrome.storage.sync.get({list: []}, function(data) {
      var arrayOriginal = data.list;
      arrayOriginal.unshift(array);

       chrome.storage.sync.set({list:array}, function() {
           console.log("Removed from list");
       });
    });
  });
}
function addToHistory(list) {
$('#history').append("Titles of Tabs Open: ");
  var text = "<ul type='circle'>";
var history =[];
var url = [];

  for (i = 0; i < list.length; i++) { 
    history.push(list[i].title);
    url.push(list[i].url)
  }
for(i = 0; i < history.length;i++)
{
  text += "<li>" + history[i] + " " + url[i] + "</li>";
}
  chrome.storage.sync.set({ "data" : text }, function() {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
  });

  $('#history').append(text + "</ul>");
}

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get('list', function(data) {

    for(element = 0; element < data.list.length; element++){
      var getTime = data.list[element].split("<ul");
      var str = data.list[element];

      console.log("string is " + str);

      if(str.includes('<li') == true){

        //pull out anything in the LI tags
        var result = str.match(/<li>(.*?)<\/li>/g).map(function(val){
          return val.replace(/<\/?li>/g,'');
        });

        $('#history').append(getTime[0]);
        
        var linkId;
        var buttonId;
        var button;
        
        for(i = 0 ; i < result.length; i++) {
          buttonId = "button" + element + i;
          linkId = i;
          
          $('#history').append('<li id=' + linkId + '><a href="' + result[i] + '">' + result[i] + '</a>&nbsp&nbsp<button id=' + buttonId + '>x</button></li>');
        
          button = document.getElementById(buttonId);

          if(typeof window.addEventListener == 'function') {
            (function(button) {
              button.addEventListener('click', function() {
                removeElement(button.id);
                console.log(button);
              });
            })(button);
          }
        }

        $('#history').append("<br>");

      }
    }
  });


  sessionOverview();
});
chrome.windows.onRemoved.addListener(function(windowId) {
  temporarilySaveData();
});
