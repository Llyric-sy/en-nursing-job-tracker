(() => {
  const isRphJob = job => {
    const text = [job?.role, job?.location, job?.source, job?.area]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return /\broyal perth hospital\b/.test(text) || /\brph\b/.test(text);
  };

  const originalQuickVisible = quickVisible;
  quickVisible = function(job) {
    if (quickView === 'rph') return isRphJob(job);
    return originalQuickVisible(job);
  };

  function activeRphCount() {
    return jobs.filter(job => {
      if (!isRphJob(job)) return false;
      const status = statusOf(job);
      return !isApplied(status) && !isDisregarded(status) && !isClosed(status);
    }).length;
  }

  function ensureControls() {
    const summary = document.querySelector('.summary-grid');
    if (summary && !document.getElementById('sum-rph')) {
      const card = document.createElement('button');
      card.className = 'summary-card rph-summary';
      card.id = 'sum-rph';
      card.dataset.view = 'rph';
      card.innerHTML = '<div class="label">RPH</div><div class="value">0</div><div class="hint">Royal Perth Hospital</div>';
      summary.appendChild(card);
    }

    const quick = document.querySelector('.quick-pills');
    if (quick && !quick.querySelector('[data-quick="rph"]')) {
      const button = document.createElement('button');
      button.className = 'pill-btn rph-pill';
      button.dataset.quick = 'rph';
      button.textContent = 'RPH';
      const first = quick.querySelector('[data-quick="all"]');
      if (first?.nextSibling) quick.insertBefore(button, first.nextSibling);
      else quick.appendChild(button);
    }
  }

  function jobFromRenderedText(text) {
    const normalized = String(text || '').toLowerCase();
    return jobs.find(job => {
      if (!isRphJob(job)) return false;
      const role = String(job.role || '').toLowerCase();
      return role && normalized.includes(role);
    });
  }

  function addBadge(container, titleSelector, chipHostSelector) {
    if (container.querySelector('.rph-badge')) return;
    const job = jobFromRenderedText(container.textContent);
    if (!job) return;

    const host = container.querySelector(chipHostSelector) || container.querySelector(titleSelector);
    if (!host) return;
    const badge = document.createElement('span');
    badge.className = 'chip rph-badge';
    badge.textContent = 'RPH';
    badge.title = 'Royal Perth Hospital';
    if (host.matches(titleSelector)) host.insertAdjacentElement('afterend', badge);
    else host.prepend(badge);
    container.classList.add('rph-role');
  }

  function decorateRph() {
    ensureControls();

    const count = activeRphCount();
    const value = document.querySelector('#sum-rph .value');
    if (value) value.textContent = count;

    const summary = document.getElementById('sum-rph');
    if (summary) summary.classList.toggle('active', quickView === 'rph');

    document.querySelectorAll('[data-quick="rph"]').forEach(el => {
      el.classList.toggle('on', quickView === 'rph');
    });

    document.querySelectorAll('#desktopBody tr').forEach(row => {
      addBadge(row, '.role-title', '.chips');
    });
    document.querySelectorAll('#mobileGrid .mobile-card').forEach(card => {
      addBadge(card, '.mobile-card-title', '.mobile-chips');
    });
  }

  const originalRender = render;
  render = function() {
    originalRender();
    requestAnimationFrame(decorateRph);
  };

  ensureControls();
  decorateRph();
})();
