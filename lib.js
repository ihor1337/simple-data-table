/**
 * Created by Ihor on 7/15/2017.
 */

(function (t) {
  "use strict"

  console.log(t)
  t.myTable = function(table_selector, data, perPage) {
      if (typeof table_selector === "string"){
        this.tableRoot = document.getElementById(table_selector)
      }else{
        throw new Error("Argument is of wrong type. Please provide a string id")
      }

      this.perPage = perPage;

      var total = Math.ceil(data.length / this.perPage);
      var table = buildTable(data);
      var rows = getRows(table);
      var sortOrder = -1;

      mountTable(table, this.tableRoot);
      buildPagination(table, total);
      insertSearch().oninput = function (e) {
        filterTable(e.target.value, Array.prototype.slice.call(rows, 0));
      };
      paginate(1, this.perPage, Array.prototype.slice.call(rows, 0));


    function getRows (table) {
      var rows = [].slice.call(table.rows);
      rows.splice(0,1);
      return rows;
    }

    function paginate(page, perPage, data) {
      var paginated = [];
      if(page < 0) page = 1;
      var start = (page-1) * perPage;
      var end = page * perPage;
      paginated = data.slice(start, end);
      updateTableBody(table, paginated);
    }

    function buildPagination (table, total) {
      var div = document.createElement('div');
      var paginationHTML = '';
      div.innerHTML = '<ul></ul>';

      for(var i=1; i<=total; i++){
        paginationHTML+= '<li>'+i+'</li>';
      }
      div.innerHTML = paginationHTML;
      table.parentNode.insertBefore(div, table.nextSibling)
      div.onclick = changePage;
    }

    function insertSearch() {
      var input = document.createElement('input');
      table.parentNode.insertBefore(input, table);
      return input;
    }

    function changePage(e) {
      var pageNo = parseInt(e.target.innerText)
      paginate(pageNo, perPage, Array.prototype.slice.call(rows, 0));
    }

    function updateTableBody (table, elements) {
      var newBody = document.createElement('tbody');
      var oldBody = table.children[1];

      elements.forEach(function (elem, index) {
        newBody.appendChild(elem)
      })

      table.replaceChild(newBody, oldBody)
    }

    function sort(e) {
      (sortOrder === -1) ? sortOrder = 1 : sortOrder = -1
      //var data = Array.prototype.slice.call(rows, 0);
      var col = e.target.id.split('-')[1];
      console.log(col)

        /*rows.sort(function (a,b) {
            return (b.cells[0].innerText - a.cells[0].innerText) * sortOrder;
        })*/

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
      //updateTableBody(table, data);
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
      paginate(1, perPage, filtered);
    }

    function buildTable (data) {
      var table = document.createElement('table');
      var thead = document.createElement('thead');
      thead.innerHTML = '<tr></tr>'
      var headerHTML = '';
      var headerArr = Object.keys(data[0]);
      headerArr.forEach(function (text, i) {
        headerHTML += '<th id="col-'+i+'">' + text + '</th>';
      })
      thead.innerHTML = headerHTML;

      var tbody = document.createElement('tbody');
      var tbodyHTML = '';

      data.forEach(function (elem, index) {
        tbodyHTML += '<tr id="row-'+index+'">';

        for(var prop in elem){
          tbodyHTML += '<td>' + elem[prop] + '</td>'
        }

        tbodyHTML += '</tr>'
      })

      tbody.innerHTML = tbodyHTML;
      table.appendChild(thead);
      thead.onclick = sort;
      table.appendChild(tbody);
      return table;
    }
  }




  function mountTable (table, root) {
    root.appendChild(table)
  }



  /*if (typeof Object.assign != 'function') {
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
  }*/
})(window)
