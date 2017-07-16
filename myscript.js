/**
 * Created by Ihor on 7/16/2017.
 */

(function () {
  function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'file.json', true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {

        // .open will NOT return a value but simply returns undefined in async mode so use a callback
        callback(xobj.responseText);

      }
    }
    xobj.send(null);

  }

// Call to function with anonymous callback
  loadJSON(function(response) {
    //console.log(response);
    console.log(typeof JSON.parse(response))
    console.log(typeof seedData)
    var table = new myTable('table-container', JSON.parse(response), 25);
  });
})()