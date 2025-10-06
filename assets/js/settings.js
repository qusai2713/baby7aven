
/* settings.js — إدارة مفاتيح بوابة الدفع (ثواني) داخل LocalStorage */
(function(){
  const KEY_SETTINGS = (window.StoreDB && StoreDB.KEY_SETTINGS) || 'bh_settings_v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY_SETTINGS)) || {}; }catch(e){ return {}; } }
  function save(obj){ localStorage.setItem(KEY_SETTINGS, JSON.stringify(obj||{})); }
  function get(k, def){ const s=load(); return (k in s)?s[k]:def; }
  function set(k, v){ const s=load(); s[k]=v; save(s); }
  // مفاتيح مقترحة: thawani_public_key, thawani_secret_key, webhook_secret, currency ('OMR'), shipping_flat, tax_percent
  window.BHSettings = { load, save, get, set };
})();
