// Fetch config.json and apply values to elements with data-config attributes
(async function(){
  try {
    const res = await fetch('src/config.json');
    if (!res.ok) return;
    const cfg = await res.json();

    // set login links
    document.querySelectorAll('[data-config="loginUrl"]').forEach(el => {
      if (el instanceof HTMLAnchorElement) el.href = cfg.loginUrl || '/login';
    });

  } catch (e) {
    // silently ignore; defaults in markup will remain
    console.warn('Could not load site config', e);
  }
})();
