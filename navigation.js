const menu = document.getElementById('catalog-drawer');

if (menu) {
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) {
      menu.hidePopover();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      try {
        if (menu.matches(':popover-open')) menu.hidePopover();
      } catch (e) {}
    }
  });
}
