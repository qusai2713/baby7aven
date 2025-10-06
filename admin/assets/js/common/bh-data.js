/*
# Header Block
File: assets/js/common/bh-data.js
Purpose: طبقة بيانات موحدة (قراءة/كتابة/بث التغييرات) عبر localStorage لمفتاح bh_products
*/
(function () {
  "use strict";

  const LS_PRODUCTS = "bh_products";
  const EVT = "bh:products-changed";

  const safeJSON = {
    parse(v, fb = []) { try { return JSON.parse(v ?? "[]"); } catch { return fb; } },
    stringify(v) { return JSON.stringify(v ?? []); }
  };

  function readProducts() {
    return safeJSON.parse(localStorage.getItem(LS_PRODUCTS), []);
  }

  function writeProducts(list) {
    localStorage.setItem(LS_PRODUCTS, safeJSON.stringify(list));
    emitChange();
  }

  function emitChange() {
    try {
      window.dispatchEvent(new CustomEvent(EVT, { detail: { source: "bh-data" } }));
    } catch {}
  }

  // sync across tabs
  window.addEventListener("storage", (e) => {
    if (e && e.key === LS_PRODUCTS) emitChange();
  });

  function upsertProduct(prod) {
    const list = readProducts();
    const key = (prod?.sku || "").trim().toLowerCase();
    if (!key) return list;
    const i = list.findIndex(p => (p.sku || "").trim().toLowerCase() === key);
    if (i >= 0) list[i] = { ...list[i], ...prod, updatedAt: Date.now() };
    else list.unshift({ ...prod, createdAt: Date.now(), updatedAt: Date.now() });
    writeProducts(list);
    return list;
  }

  function removeProduct(sku) {
    const key = (sku || "").trim().toLowerCase();
    const list = readProducts().filter(p => (p.sku || "").trim().toLowerCase() !== key);
    writeProducts(list);
    return list;
  }

  window.BH_Data = Object.freeze({
    key: LS_PRODUCTS,
    getProducts: readProducts,
    setProducts: writeProducts,
    upsertProduct,
    removeProduct,
    onProductsChanged(cb) {
      if (typeof cb !== "function") return () => {};
      const handler = () => { try { cb(readProducts()); } catch {} };
      window.addEventListener(EVT, handler);
      return () => window.removeEventListener(EVT, handler);
    },
    notifyChange: emitChange
  });
})();