/**
 * NETZSCH Customer Portal — Wishlist toggle (Add / Remove)
 * Toggles button state, heart fill, and shows appropriate toast.
 */
(function () {
  var btn = document.querySelector('.btn-wishlist');
  var toast = document.getElementById('wishlistToast');
  var toastClose = document.getElementById('toastClose');
  if (!btn || !toast) return;

  var toastTitle = toast.querySelector('.toast-title');
  var toastIcon = toast.querySelector('.toast-icon path');
  var heartPath = btn.querySelector('svg path');
  var added = false;
  var toastTimer = null;

  function showToast() {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  btn.addEventListener('click', function () {
    added = !added;

    if (added) {
      // Fill heart green + change text
      heartPath.setAttribute('fill', '#007167');
      heartPath.setAttribute('stroke', '#007167');
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" stroke="#007167" stroke-width="1.5" fill="#007167"/></svg> Added to Wishlist';
      btn.classList.add('wishlisted');

      // Toast: added
      toastTitle.textContent = 'Added to Wishlist';
      toastIcon.setAttribute('fill', '#007167');
    } else {
      // Empty heart + change text back
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" stroke="currentColor" stroke-width="1.5"/></svg> Add to Wishlist';
      btn.classList.remove('wishlisted');

      // Toast: removed
      toastTitle.textContent = 'Removed from Wishlist';
      toastIcon.setAttribute('fill', '#c73e20');
    }

    showToast();
  });

  if (toastClose) {
    toastClose.addEventListener('click', function () {
      clearTimeout(toastTimer);
      toast.classList.remove('show');
    });
  }
})();
