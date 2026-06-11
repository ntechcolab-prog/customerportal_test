/**
 * Skeleton Loader
 * Shows skeleton placeholders for ~1s then reveals real content with stagger.
 */
(function () {
  'use strict';

  var SKELETON_DURATION = 1000; // ms
  var STAGGER_DELAY = 80;      // ms between each staggered child

  var wrapper = document.querySelector('.skeleton-wrapper');
  var content = document.querySelector('.page-content');

  if (!wrapper || !content) return;

  // Hide real content, show skeleton
  content.style.display = 'none';
  wrapper.setAttribute('aria-hidden', 'false');

  setTimeout(function () {
    // Hide skeleton
    wrapper.setAttribute('aria-hidden', 'true');

    // Show real content with fade-in
    content.style.display = '';
    content.classList.add('skeleton-reveal');

    // Apply stagger delays to marked children
    var staggerItems = content.querySelectorAll('[data-skeleton-stagger]');
    for (var i = 0; i < staggerItems.length; i++) {
      staggerItems[i].style.animationDelay = (i * STAGGER_DELAY) + 'ms';
    }

    // Cleanup classes after animation
    setTimeout(function () {
      content.classList.remove('skeleton-reveal');
      for (var j = 0; j < staggerItems.length; j++) {
        staggerItems[j].style.animationDelay = '';
        staggerItems[j].removeAttribute('data-skeleton-stagger');
      }
    }, STAGGER_DELAY * staggerItems.length + 500);

  }, SKELETON_DURATION);
})();
