
(function(){
  'use strict';
  const KEY_PRODUCTS='bh_admin_products_v35';
  const KEY_SETTINGS='bh_settings';
  const KEY_CART='bh_cart';
  const KEY_ORDERS='bh_orders';

  function read(key, fallback){ try{ const v = JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback)); return v; }catch{return fallback;} }
  function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function fmt(n){ return (Number(n)||0).toFixed(3)+' ر.ع'; }

  function qtyOf(p){
    const toNum = (x)=> isNaN(+x)?0:+x;
    if(p.type==='simple') return toNum(p.qty);
    const key = p.type==='multi-color' ? 'colors' : 'sizes';
    return (p[key]||[]).reduce((s,v)=> s+toNum(v.qty), 0);
  }
  function cover(p){
    if(p.type==='simple') return p.image||'';
    if(p.type==='multi-color'){ const f=(p.colors||[])[0]; return f && f.image ? f.image : ''; }
    return '';
  }

  window.StoreDB = { KEY_PRODUCTS, KEY_SETTINGS, KEY_CART, KEY_ORDERS, read, write, fmt, qtyOf, cover };
})();



