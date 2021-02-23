(function() {
  if (window.fetch) {
    const url = '/static/js/mini.json';
    function microBlog(json) {
      const container = document.getElementById('mini-blog-content');

      const loader = document.querySelectorAll('.loading');
      loader[0].style = 'display:none;';

      json.forEach((line) => {
        let li = document.createElement('li');

        let content = document.createElement('div');
        content.innerHTML = line.content;
        content.classList.add('content');

        let time = document.createElement('span');
        let options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        };
        let timestamp = new Date(Date.parse(line.created_at)).toLocaleDateString('en-US', options);
        time.innerHTML = `Posted ${timestamp} - by <a href='https://social.basementcomputer.site/@patrick'>@patrick</a> - `;
        time.classList.add('post-date', 'mini-date');

        let perma = document.createElement('a');
        perma.innerHTML = 'post ️link ↗';
        perma.href = line.url;
        perma.classList.add('mini-link');

        let meta = document.createElement('div');
        meta.appendChild(time);
        meta.appendChild(perma);
        meta.classList.add('meta');

        li.appendChild(content);
        li.appendChild(meta);
        container.appendChild(li);
      });
    }
    const response = fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'same-origin', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
      response.json().then(data => {
        microBlog(data);
      });
    });
  }
})();
