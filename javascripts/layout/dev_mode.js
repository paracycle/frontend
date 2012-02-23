if (window.localStorage !== undefined) {
  // chrome/ff
  window.devLocationStorage = window.localStorage
}
else {
  // on IE, just store in global var, get lost on each refresh tho
  window.devLocationStorage = {
    getItem: function(key) { return this.store[key]; },
    setItem: function(key, value) { this.store[key] = value; },
    removeItem: function(key) { this.store[key] = undefined; },
    store: { badger_api: 'dev' } // force to dev for now
  }; 
}

if (devLocationStorage.getItem('badger_api') == 'dev') {
  Badger.api_host = 'http://api.badger.dev/';
  Badger.access_token_key = 'badger_access_token_dev';
} else if (devLocationStorage.getItem('badger_api') == 'qa') {
  Badger.api_host = 'https://api-qa.badger.com/';
  Badger.access_token_key = 'badger_access_token_qa';
} else if (navigator.userAgent == 'Selenium') {
  Badger.api_host = 'http://test.example/';
  Badger.access_token_key = 'badger_access_token_test';
} else {
  Badger.api_host = 'https://api.badger.com/';
  Badger.access_token_key = 'badger_access_token_prod';
}

Badger.getAccessToken = function() { return devLocationStorage.getItem(Badger.access_token_key); }
Badger.setAccessToken = function(token) { token ? devLocationStorage.setItem(Badger.access_token_key, token) : devLocationStorage.removeItem(Badger.access_token_key); }

with (Hasher()) {
  define('set_api_host', function(env) {
    devLocationStorage.setItem('badger_api', env);
    document.location.reload();
  });

  after_filter('add_dev_mode_bar', function() {
    if (!document.getElementById('dev-bar')) {
      document.body.appendChild(
        div({ id: 'dev-bar', style: "position: fixed; bottom: 0; right: 0; background: white; color: black; padding: 5px" }, 
          (Badger.api_host == 'http://test.example/' ? [b('test'), ' | '] : []),
          (Badger.api_host == 'http://api.badger.dev/' ? b('dev') : a({ href: curry(set_api_host, 'dev') }, 'dev')), 
          ' | ',
          (Badger.api_host == 'https://api-qa.badger.com/' ? b('qa') : a({ href: curry(set_api_host, 'qa') }, 'qa')), 
          ' | ',
          (Badger.api_host == 'https://api.badger.com/' ? b('prod') : a({ href: curry(set_api_host, 'prod') }, 'prod'))
        )
      );
    }
  });
}
