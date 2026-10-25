// The Homebrew Academy: "Support the Academy" menus (Patreon and Buy Me a Coffee).
// Click to open, click outside or press Escape to close.
(function () {
  function init() {
    var boxes = document.querySelectorAll('.support');
    Array.prototype.forEach.call(boxes, function (box) {
      if (box.dataset.ready) return; box.dataset.ready = '1';
      var btn = box.querySelector('button');
      function set(open) { box.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
      btn.addEventListener('click', function (e) { e.stopPropagation(); set(!box.classList.contains('open')); });
      document.addEventListener('click', function (e) { if (!box.contains(e.target)) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
      window.addEventListener('blur', function () { set(false); }); // clicks inside an embedded program
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
