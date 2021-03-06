/**
 * Created by Ihor on 7/15/2017.
 */

(function (t) {
  "use strict"

  //myTable object with options
  t.myTable = function(table_selector, data, perPage) {
      if (typeof table_selector === "string"){
        this.tableRoot = document.getElementById(table_selector)
      }else{
        throw new Error("Argument is of wrong type. Please provide a string id")
      }

      //Private variables
      var total = Math.ceil(data.length / perPage); //num of pages
      var headerRow = getHeader(data[0]); // header of the table
      var table = buildTable(data); // builds table from given JSON data
      var rows = getRows(table); // extracts rows from table for further manipulation
      var sortOrder = -1;

      //initialization
      mountTable(table, this.tableRoot); //mounts table to the dom
      var pagination = buildPagination(table, total); // builds pagination markup
      pagination.onclick = changePage;
      var searchBar = insertSearch(); // insearts search bar and returns it
      searchBar.oninput = function (e) {
        filterTable(e.target.value, Array.prototype.slice.call(rows, 0)); //filtering table
      }; //filtering table whenever input box changes

      var showHideBtn = insertShowHide(searchBar, data[0]); //inserts button to toggle hide/show and returns it
      showHideBtn.onclick = function (e) {
        showHideColumn(e.target); //toggles show/hide of the column
      }

      table.onclick = function (e) {
        editTable(e.target); // adds input box and edits clicked cell
      }
      paginate(1, perPage, Array.prototype.slice.call(rows, 0)); //paginates the table


    //returns rows of the table
    function getRows (table) {
      var rows = [].slice.call(table.rows); //converts dom elements into an array. (Array.from() in es6)
      rows.splice(0,1); //remove firs row (it is header, we don't need to manipulate it)
      return rows;
    }

    //paginates the array
    function paginate(page, perPage, data) {
      var paginated = [];
      if(page < 0) page = 1;
      var start = (page-1) * perPage;
      var end = page * perPage;
      paginated = data.slice(start, end);
      updateTableBody(table, paginated); //updates the table body with paginated results
    }

    //builds pagination markup and returns its container
    function buildPagination (table, total) {
      var div = document.createElement('div');
      div.classList.add('lib-pagination');
      var paginationHTML = '<ul>';
      for(var i=1; i<=total; i++){
        if (i===1) paginationHTML += '<li class="active">'+i+'</li>'
        else paginationHTML+= '<li>'+i+'</li>';
      }
      paginationHTML += '</ul>'
      div.innerHTML = paginationHTML;
      table.parentNode.insertBefore(div, table.nextSibling)
      return div;
    }

    //updates pagination if table was refined
    function updatePagination (total) {
      var container = document.getElementsByClassName('lib-pagination')[0];
      var HTML = '<ul>';

      for(var i=1; i<=total; i++){
        if(i===1){
          HTML+= '<li class="active">'+i+'</li>';
        }else {
          HTML+= '<li>'+i+'</li>';
        }
      }
      HTML += '</ul>';
      container.innerHTML = HTML;
    }


    function insertSearch() {
      var input = document.createElement('input');
      table.parentNode.insertBefore(input, table);
      return input;
    }

    function insertShowHide(input, data) {
      var select = document.createElement('select');
      var btn = document.createElement('button');
      select.classList.add('lib-select');
      btn.classList.add('lib-show-btn');
      var options = Object.keys(data);
      console.log(options);
      var optionsHTML = '';

      for (var o in options){
        optionsHTML+= '<option>' + options[o] + '</option>'
      }
      select.innerHTML = optionsHTML;
      btn.innerText = "Show / Hide";
      table.parentNode.insertBefore(select, input);
      table.parentNode.insertBefore(btn, input);
      return btn;
    }

    function changePage(e) {
      var pageNo = parseInt(e.target.innerText);
      if (pageNo && pageNo !== '' && pageNo <= total){
       var li = e.target.parentNode.children;
       for (var i=0; i<li.length; i++){
         if(li[i].classList.contains('active')){
           li[i].classList.remove('active')
         }
       }
        paginate(pageNo, perPage, Array.prototype.slice.call(rows, 0));
        e.target.classList.add('active');
      }

    }

    function updateTableBody (table, elements) {
      var newBody = document.createElement('tbody');
      var oldBody = table.children[1];

      elements.forEach(function (elem, index) {
        newBody.appendChild(elem)
      })

      table.replaceChild(newBody, oldBody)
    }

    //sorts table and paginates the result
    function sort(e) {
      (sortOrder === -1) ? sortOrder = 1 : sortOrder = -1

      var col = e.target.id.split('-')[1];

      rows.sort(function (a,b) {
        var A = a.cells[col].innerText;
        var B = b.cells[col].innerText
        if(!isNaN(A) && !isNaN(B)){
         return (B - A) * sortOrder
        }
        if (A > B){
          return sortOrder
        }
        if (A<B){
          return -1 * sortOrder
        }
        return 0;
      })
      paginate(1, perPage, rows);
    }

    function filterTable(query, data) {
      query = query.toLowerCase();
      var filtered = data.filter(function (item, index, arr) {
        var cells = item.cells;

        for (var i=0; i<cells.length; i++){
          if(cells[i].innerText.toLowerCase().indexOf(query) > -1){
            return item;
          }
        }
      });
      var newPages = Math.ceil(filtered.length / perPage)
      updatePagination(newPages);
      paginate(1, perPage, filtered);
    }

    function showHideColumn() {
      var select = document.getElementsByClassName('lib-select')[0];
      var col = select.selectedIndex;
      var elems = table.querySelectorAll('#col-'+col+', .col-'+col);
      for (var i=0; i<elems.length; i++){
       (elems[i].style.display === '')? elems[i].style.display = 'none' : elems[i].style.display = '' ;
      }
    }

    //inserts an input into table cell, removes input and saves data on blur
    function editTable(e){
      var rowIndex = rows.indexOf(e.parentNode);
      if (rowIndex >= 0){

        //save edits in the dom

        var cellIndex = e.cellIndex;
        var rowToChange = rows[rowIndex];
        var cellToChange = rowToChange.cells[e.cellIndex];
        var cellText = cellToChange.innerText;
        var input = document.createElement('input');
        while(cellToChange.firstChild){
          cellToChange.removeChild(cellToChange.firstChild)
        }

        input.value = cellText;
        cellToChange.appendChild(input);
        input.focus();
        input.onblur = function (e) {
          var newData = e.target.value;
          cellToChange.removeChild(input);
          cellToChange.innerText = newData;

          /* Deep clone an original data object, store changes in
              new object. New object can be posted to the server
              to persist the changes.
           */
          var newObj = Object.assign({}, data);
          newObj[rowIndex][headerRow[cellIndex]] = newData;
          console.log('Saved data: ')
          console.log(newObj[rowIndex]);
        }


      }
    }

    //builds table from given JSON
    function buildTable (data) {
      var table = document.createElement('table');
      var thead = document.createElement('thead');
      thead.innerHTML = '<tr></tr>'
      var headerHTML = '';
      headerRow.forEach(function (text, i) {
        headerHTML += '<th id="col-'+i+'">' + text + '</th>';
      })
      thead.innerHTML = headerHTML;

      var tbody = document.createElement('tbody');
      var tbodyHTML = '';

      data.forEach(function (elem, index) {
        tbodyHTML += '<tr id="row-'+index+'">';

        var i = 0;
        for(var prop in elem){
          tbodyHTML += '<td class="col-'+i+'">' + elem[prop] + '</td>'
          i++;
        }
        tbodyHTML += '</tr>'
      })

      tbody.innerHTML = tbodyHTML;
      table.appendChild(thead);
      thead.onclick = sort;
      table.appendChild(tbody);
      return table;
    }

    function getHeader (data) {
      return Object.keys(data);
    }

    function mountTable (table, root) {
      root.appendChild(table)
    }
  }



  //Obect.assign polyfill for browsers that don't support es6
  if (typeof Object.assign != 'function') {
    Object.assign = function(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
})(window)
