/* Ultron website — tiny page runtime.
   Renders each page's <template id="page"> using its Component class.
   Supports {{ value }} holes, <sc-if>, <sc-for>, and onClick / onChange / onBlur / onKeyDown / onMouseDown handlers. */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(update) {
      const next = typeof update === 'function' ? update(this.state, this.props) : update;
      this.state = Object.assign({}, this.state, next);
      schedule();
    }
    forceUpdate() { schedule(); }
  }
  window.DCLogic = DCLogic;

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  const EVENTS = { onclick: 'click', onchange: 'input', onblur: 'focusout', onkeydown: 'keydown', onmousedown: 'mousedown' };

  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$|^".*"$/.test(path)) return path.slice(1, -1);
    const parts = path.split('.');
    let v = scope[parts[0]];
    for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  const str = (v) => (v == null || v === false ? '' : String(v));
  const interp = (text, scope) => text.replace(HOLE, (_, p) => str(lookup(p, scope)));

  let component, root, tpl, pending = false, rendering = false;

  function renderChildren(srcParent, outParent, scope, path) {
    let i = 0;
    srcParent.childNodes.forEach((n) => { i = renderNode(n, outParent, scope, path, i); });
  }

  function renderNode(n, out, scope, path, i) {
    if (n.nodeType === 3) { out.appendChild(document.createTextNode(n.nodeValue.indexOf('{{') === -1 ? n.nodeValue : interp(n.nodeValue, scope))); return i; }
    if (n.nodeType !== 1) return i;
    const tag = n.localName;
    if (tag === 'sc-if') {
      const m = (n.getAttribute('value') || '').match(WHOLE);
      if (m && lookup(m[1], scope)) renderChildren(n, out, scope, path + '/if' + i);
      return i + 1;
    }
    if (tag === 'sc-for') {
      const m = (n.getAttribute('list') || '').match(WHOLE);
      const list = (m && lookup(m[1], scope)) || [];
      const as = n.getAttribute('as') || 'item';
      list.forEach((item, idx) => {
        const s = Object.create(scope); s[as] = item; s.$index = idx;
        renderChildren(n, out, s, path + '/for' + i + '.' + idx);
      });
      return i + 1;
    }
    const el = n.cloneNode(false);
    const myPath = path + '/' + i;
    el.setAttribute('data-p', myPath);
    let valueProp, checkedProp;
    Array.from(n.attributes).forEach((a) => {
      const name = a.name, lname = name.toLowerCase();
      if (lname.indexOf('hint-') === 0) { el.removeAttribute(name); return; }
      if (a.value.indexOf('{{') === -1) return;
      const whole = a.value.match(WHOLE);
      if (EVENTS[lname]) {
        el.removeAttribute(name);
        const fn = whole && lookup(whole[1], scope);
        if (typeof fn === 'function') el.addEventListener(EVENTS[lname], (e) => { if (!rendering) fn(e); });
        return;
      }
      if (lname === 'value') { valueProp = whole ? lookup(whole[1], scope) : interp(a.value, scope); el.removeAttribute(name); return; }
      if (lname === 'checked') { checkedProp = !!(whole && lookup(whole[1], scope)); el.removeAttribute(name); return; }
      el.setAttribute(name, interp(a.value, scope));
    });
    if (tag === 'template') { out.appendChild(el); return i + 1; }
    renderChildren(n, el, scope, myPath);
    if (valueProp !== undefined) el.value = str(valueProp);
    if (checkedProp !== undefined) el.checked = checkedProp;
    out.appendChild(el);
    return i + 1;
  }

  function render() {
    pending = false;
    const active = document.activeElement;
    const focusPath = active && root.contains(active) ? active.getAttribute('data-p') : null;
    let selStart = null, selEnd = null;
    try { selStart = active.selectionStart; selEnd = active.selectionEnd; } catch (e) { /* not a text field */ }
    const frag = document.createDocumentFragment();
    renderChildren(tpl.content, frag, component.renderVals(), '');
    rendering = true;
    try { root.replaceChildren(frag); } finally { rendering = false; }
    if (focusPath) {
      const el = root.querySelector('[data-p="' + focusPath + '"]');
      if (el) {
        rendering = true;
        try { el.focus({ preventScroll: true }); } finally { rendering = false; }
        if (selStart != null) { try { const len = (el.value || '').length; el.setSelectionRange(Math.min(selStart, len), Math.min(selEnd, len)); } catch (e) { /* ignore */ } }
      }
    }
  }
  function schedule() { if (!pending && root) { pending = true; requestAnimationFrame(render); } }

  window.mountPage = function (Component, props) {
    tpl = document.getElementById('page');
    root = document.getElementById('app');
    component = new Component(props || {});
    render();
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  };
})();
