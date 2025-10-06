/*
# Header Block
File: assets/js/common/bh-ls-bridge.js
Purpose: وصلة شفافة: ترصد setItem/removeItem لمفتاح bh_products وتبثّ إشعار التحديث تلقائياً
*/
(function(){
  "use strict";
  const KEY = "bh_products";
  try {
    const _set = localStorage.setItem.bind(localStorage);
    const _remove = localStorage.removeItem.bind(localStorage);
    localStorage.setItem = function(k, v){
      const r = _set(k, v);
      if (String(k) === KEY && window.BH_Data?.notifyChange) window.BH_Data.notifyChange();
      return r;
    };
    localStorage.removeItem = function(k){
      const r = _remove(k);
      if (String(k) === KEY && window.BH_Data?.notifyChange) window.BH_Data.notifyChange();
      return r;
    };
  } catch {}
})();