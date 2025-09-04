// ==UserScript==
// @name         CIPP Autopilot: Manufacturer + Alle modellen dropdown
// @namespace    connectium-cipp-autopilot
// @version      1.8
// @description  Dropdowns; schrijft waarden React-compatibel zodat CIPP-validatie ze ziet
// @match        https://cipp.connectium.nl/endpoint/autopilot/add-device*
// @updateURL    https://raw.githubusercontent.com/Flowgem/Cipp-Dropdown-List/main/CIPP%20Autopilot_%20Manufacturer%20%2B%20Models%20%28dropdown%29.user.js
// @downloadURL  https://raw.githubusercontent.com/Flowgem/Cipp-Dropdown-List/main/CIPP%20Autopilot_%20Manufacturer%20%2B%20Models%20%28dropdown%29.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // --- CONFIG ---
  const MANUFACTURERS = ['HP', 'Lenovo', 'Microsoft'];
  const ALL_MODELS = [
    'HP ProBook 455 G7',
    'HP ProBook 450 G8 Notebook PC',
    'HP ProBook 450 15.6 inch G9 Notebook PC',
    'HP ProBook 450 15.6 inch G10 Notebook PC',
    'FGM Test',
    'HP ProDesk 600 G5 Desktop Mini',
    'HP Pro Mini 400 G9 Desktop PC',
    'HP EliteDesk 800 G8 Desktop Mini PC',
    'HP Elite Mini 800 G9 Desktop PC',
    'HP EliteBook 6 G1i 16 Inch Notebook AI PC',
    'HP ZBook 15 G3',
    'HP ZBook Studio 16 inch G9 Mobile Workstation PC',
    'HP ZBook Power 15.6 inch G10 Mobile Workstation PC',
    'HP ZBook Studio 16 inch G11 Mobile Workstation PC',
    '21BT0009MH (Lenovo Thinkpad P16s )',
    '21BT000VMH (Lenovo Thinkpad P16s)',
    '82L5 (Lenovo IdeaPad Slim 5)',
    'Microsoft Surface Pro with 5G, 11th Edition'
  ];

  // --- STYLES ---
  const style = document.createElement('style');
  style.textContent = `.cipp-dd{margin-top:6px;width:100%;height:34px;border-radius:6px;border:1px solid #d0d7de;padding:4px 8px;background:#fff;}`;
  document.documentElement.appendChild(style);

  // --- React/MUI value setter ---
  function setReactInputValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    const setter = desc && desc.set ? desc.set : HTMLInputElement.prototype.value.set;
    setter.call(el, value);
    // eerst 'input', dan 'change' (beide bubbelen)
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findInputByLooseLabel(labelText) {
    const labs = Array.from(document.querySelectorAll('label'));
    const lab = labs.find(l => (l.textContent || '').trim().toLowerCase().startsWith(labelText.toLowerCase()));
    if (!lab) return null;

    const forId = lab.getAttribute('for');
    if (forId) {
      const direct = document.getElementById(forId);
      if (direct && direct.tagName === 'INPUT') return direct;
      const inside = document.querySelector(`#${CSS.escape(forId)} input`);
      if (inside) return inside;
    }
    const root = lab.closest('.MuiFormControl-root, .MuiGrid-root, form, .MuiDialogContent-root') || lab.parentElement;
    if (root) {
      const inp = root.querySelector('input');
      if (inp) return inp;
    }
    return null;
  }

  function makeSelect(options, label) {
    const sel = document.createElement('select');
    sel.className = 'cipp-dd';
    sel.setAttribute('aria-label', `${label} (dropdown)`);
    sel.appendChild(new Option(`— kies ${label.toLowerCase()} —`, ''));
    options.forEach(opt => sel.appendChild(new Option(opt, opt)));
    return sel;
  }

  function buildDropdown(input, label, options) {
    if (!input || input.dataset.dropdownBuilt === '1') return;
    const select = makeSelect(options, label);
    input.insertAdjacentElement('afterend', select);
    input.dataset.dropdownBuilt = '1';

    // select -> input (via React-compliant setter)
    select.addEventListener('change', () => {
      setReactInputValue(input, select.value);
    });

    // input -> select (als gebruiker tóch typt)
    input.addEventListener('input', () => {
      const v = (input.value || '').trim().toLowerCase();
      const m = Array.from(select.options).find(o => o.value.toLowerCase() === v);
      select.value = m ? m.value : '';
    });
  }

  function enhance() {
    const mnfInput = findInputByLooseLabel('Manufacturer');
    const mdlInput = findInputByLooseLabel('Model');
    if (mnfInput) buildDropdown(mnfInput, 'Manufacturer', MANUFACTURERS);
    if (mdlInput) buildDropdown(mdlInput, 'Model', ALL_MODELS);
  }

  enhance();
  const obs = new MutationObserver(() => {
    clearTimeout(obs._t);
    obs._t = setTimeout(enhance, 120);
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true });
})();
