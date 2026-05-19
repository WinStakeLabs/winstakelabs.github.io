/* ============================================================
   WinStake Labs - Shared Site Script
   - Loads nav and footer partials into placeholders
   - Applies page-specific active state and language
   - Read data-page and data-lang from <html> element
   ============================================================ */

(async function () {
  const html = document.documentElement;
  const page = html.getAttribute('data-page') || '';     // about, network, security, stake, mission, tools, etc.
  const lang = html.getAttribute('data-lang') || 'en';   // en or ua

  // Determine paths based on lang
  const indexHref = lang === 'ua' ? 'index-ua.html' : 'index.html';
  const missionHref = lang === 'ua' ? 'mission.html' : 'mission-en.html';

  // Fetch a partial and return HTML text
  async function loadPartial(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load ' + url);
      return await res.text();
    } catch (e) {
      console.error('Partial load error:', e);
      return '';
    }
  }

  // Apply language and active state to nav
  function configureNav(navEl) {
    if (!navEl) return;

    // Set home link
    navEl.querySelectorAll('[data-link-home]').forEach(a => {
      a.setAttribute('href', indexHref);
    });

    // Anchor links: prepend index page
    navEl.querySelectorAll('a[href^="/#"]').forEach(a => {
      const hash = a.getAttribute('href').substring(1); // "#about"
      a.setAttribute('href', indexHref + hash);
    });

    // Mission link uses data-href-en / data-href-ua
    navEl.querySelectorAll('[data-href-en]').forEach(a => {
      a.setAttribute('href', lang === 'ua' ? a.getAttribute('data-href-ua') : a.getAttribute('data-href-en'));
    });

    // Apply labels based on language
    navEl.querySelectorAll('[data-label-en]').forEach(el => {
      const label = lang === 'ua' ? el.getAttribute('data-label-ua') : el.getAttribute('data-label-en');
      if (label) {
        // Find leaf text node to update (preserve emoji span if any)
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
        if (textNodes.length > 0) {
          // Replace last text node content (after emoji span)
          textNodes[textNodes.length - 1].textContent = textNodes[textNodes.length - 1].textContent.replace(/[\w\s]+$/, '');
          textNodes[textNodes.length - 1].textContent = ' ' + label;
        } else {
          el.textContent = label;
        }
      }
    });

    // Active link
    if (page) {
      navEl.querySelectorAll('[data-nav]').forEach(a => {
        if (a.getAttribute('data-nav') === page) a.classList.add('active');
      });
    }

    // Active lang button
    navEl.querySelectorAll('[data-lang-target]').forEach(a => {
      if (a.getAttribute('data-lang-target') === lang) a.classList.add('active');
    });
  }

  function configureFooter(footerEl) {
    if (!footerEl) return;

    footerEl.querySelectorAll('[data-link-home]').forEach(a => {
      a.setAttribute('href', indexHref);
    });

    footerEl.querySelectorAll('a[href^="/#"]').forEach(a => {
      const hash = a.getAttribute('href').substring(1);
      a.setAttribute('href', indexHref + hash);
    });

    footerEl.querySelectorAll('[data-href-en]').forEach(a => {
      a.setAttribute('href', lang === 'ua' ? a.getAttribute('data-href-ua') : a.getAttribute('data-href-en'));
    });

    footerEl.querySelectorAll('[data-label-en]').forEach(el => {
      const label = lang === 'ua' ? el.getAttribute('data-label-ua') : el.getAttribute('data-label-en');
      if (label) el.textContent = label;
    });
  }

  // Load partials in parallel
  const [navHtml, footerHtml] = await Promise.all([
    loadPartial('/partials/nav.html'),
    loadPartial('/partials/footer.html')
  ]);

  // Inject nav
  const navPlaceholder = document.getElementById('site-nav-placeholder');
  if (navPlaceholder) {
    navPlaceholder.outerHTML = navHtml;
    configureNav(document.querySelector('.site-nav'));
  }

  // Inject footer
  const footerPlaceholder = document.getElementById('site-footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = footerHtml;
    configureFooter(document.querySelector('.site-footer'));
  }

  // Reveal observer (common animation)
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();
