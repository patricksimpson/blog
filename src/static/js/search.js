(function() {
if (window.fetch) {
  let searchPage = document.querySelector('.search-body');
  if (searchPage) {
    let addLunr = document.createElement('script');
    addLunr.src = '/static/js/lunr.js';
    document.body.appendChild(addLunr);
    addLunr.onload = function() {
      fetch('/lunr.json').then(function(response) {
        return response.json();
        }).then(function(data) {
        if (data && data.index) {
          let index = lunr.Index.load(data.index);
          let loading = document.querySelector('.loading');
          loading.style.display = 'none';
          unlockSearch(index, data.store);
        } else {
          console.warn('error loading data', data);
        }
      });
    }
  } else {
    showSearch();
  }
  function showSearch() {
    let search = document.querySelector('.search');
    if(search) {
      search.style.display = 'block';
      }
  }

  function unlockSearch(index, store) {
    showSearch();
    let query = document.getElementById('search-value');
    let noresults = document.querySelector('.noresults');
    let resultList = document.querySelector('.search-body');

    let urlSearch = new URLSearchParams(document.location.search);
    let q = unescape(urlSearch.get('q'));
    if (q) {
      query.value = q;
      let results = index.search(query.value);
      if(!results || results.length < 1) {
        noresults.style.display = 'block';
        noresults.innerHTML = `No results for "${query.value}"`;
      } else {
        let resultDOM = document.createElement('ul');
        results.forEach(function(result) {
          resultDOM.innerHTML += `<li><a href="${result.ref}">${store[result.ref].title}</a> - ${store[result.ref].date}</li>`;
        });
        resultList.appendChild(resultDOM);
      };
    } else {
      noresults.style.display = 'block';
      noresults.innerHTML = `Nothing to see here, try a search instead!`;
    }
  }
}
})();
