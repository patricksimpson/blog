(async function() {
  if (window.fetch) {
    const url = '/static/js/mini.json';
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'same-origin', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    const json = await response.json(); // parses JSON response into native JavaScript objects
    const container = document.getElementById('mini-blog-content');

    const loader = document.querySelectorAll('.loading');
    loader[0].style = 'display:none;';

    json.forEach((line) => {
      let li = document.createElement('li');

      let content = document.createElement('div');
      content.innerHTML = line.content;
      content.classList.add('content');

      let avatar = document.createElement('img');
      avatar.src = line.account.avatar;
      avatar.classList.add('avatar', 'post-avatar');

      let profileLink = document.createElement('a');
      profileLink.href = line.account.url;
      profileLink.appendChild(avatar);

      let time = document.createElement('span');
      time.innerHTML = line.created_at;
      time.classList.add('post-date', 'mini-date');

      let perma = document.createElement('a');
      perma.innerHTML = ' ️link ↗' 
      perma.href = line.url;
      perma.classList.add('mini-link');

      let meta = document.createElement('div');
      meta.appendChild(profileLink);
      meta.appendChild(time);
      meta.appendChild(perma);
      meta.classList.add('meta');

      li.appendChild(meta).appendChild(content);
      container.appendChild(li);
    });
  }
})();
