// The Homebrew Academy: anonymous usage counts with GoatCounter (no cookies, no names, no codes).
//
// TO TURN IT ON: put your GoatCounter site code between the quotes below and upload this file.
// The site code is the first part of your dashboard address: for https://homebrewacademy.goatcounter.com
// the code is homebrewacademy. While it is empty, nothing is counted and nothing extra loads.
//
// What gets counted:
//   Page opens (homepage, Workshop, each document read, Music Player, Character Builder & Combat Resolver)
//   Music Player: listening room started (a table), player joined a listening room
//   Combat Resolver: new table started, player joined a table, Combat Resolver tab opened
//   PDF downloads (which document)
// Room codes, player codes, names, characters and anything people type are never sent.
(function () {
  var GOATCOUNTER_CODE = 'thehomebrewacademy';

  // Inside the Character Builder / Combat Resolver frames: send counts through the tools page instead.
  try {
    if (window.parent !== window && window.parent.hbaCount) { window.hbaCount = window.parent.hbaCount; return; }
  } catch (e) {}

  var queue = [];
  window.hbaCount = function (path, title) {
    if (!GOATCOUNTER_CODE) return;
    var gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') gc.count({ path: path, title: title || path, event: true });
    else queue.push([path, title]);
  };
  if (!GOATCOUNTER_CODE) return;

  // Count pages by their name only, never by the codes or settings in the address.
  window.goatcounter = {
    path: function () {
      var p = location.pathname;
      var q = new URLSearchParams(location.search);
      if (/read\.html$/.test(p) && q.get('doc')) p += '?doc=' + q.get('doc').replace(/[^a-z0-9_-]/gi, '');
      if (/player\.html$/.test(p) && q.get('room')) p += ' (joined a listening room)';
      return p;
    }
  };

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count');
  s.onload = function () {
    var tries = 0, t = setInterval(function () {
      var gc = window.goatcounter;
      if ((gc && typeof gc.count === 'function') || ++tries > 50) {
        clearInterval(t);
        queue.splice(0).forEach(function (e) { window.hbaCount(e[0], e[1]); });
      }
    }, 100);
  };
  (document.head || document.documentElement).appendChild(s);

  // PDF downloads, anywhere on the site
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[download]');
    if (!a) return;
    var file = (a.getAttribute('href') || '').split('/').pop().split('?')[0];
    if (file) window.hbaCount('download/' + file, 'Downloaded ' + file);
  }, true);
})();
