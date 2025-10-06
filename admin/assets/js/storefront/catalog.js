/*
# Header Block
File: assets/js/storefront/catalog.js
Purpose: عرض الكتالوج من localStorage مع التحديث اللحظي عند تغيّر المنتجات
*/
(function(){
  "use strict";
  const fmt = (v)=> `${(Number(v)||0).toFixed(3)} ر.ع`;

  function renderCatalog(selector){
    const root = document.querySelector(selector);
    if (!root) return;
    const list = (window.BH_Data?.getProducts?.() ?? []).filter(p=>!p.archived);

    if (!list.length){
      root.innerHTML = '<div class="muted" style="text-align:center;padding:1rem">لا توجد منتجات حالياً</div>';
      return;
    }

    root.innerHTML = list.map(p=>{
      const cover = p.cover || (p.colors?.[0]?.image) || "";
      const name  = p.name || p.sku || "منتج";
      const base  = Number(p.price)||0;
      const variants = [
        ...(p.colors?.map(c=>Number(c.price)||0) ?? []),
        ...(p.sizes?.map(s=>Number(s.price)||0) ?? [])
      ].filter(n=>!isNaN(n) && n>0);
      const lowest = variants.length ? Math.min(...variants, base||Infinity) : base;
      const priceTxt = fmt(lowest || 0);
      const badge = p.category ? `<span class="chip">${p.category}${p.subcategory?` / ${p.subcategory}`:""}</span>` : "";
      return `
      <article class="card product-card">
        <div class="thumb">${cover ? `<img src="${cover}" alt="${name}" loading="lazy">` : `<div class="ph-img"></div>`}</div>
        <div class="info">
          <h3 class="name">${name}</h3>
          <div class="meta">${badge}</div>
          <div class="price">${priceTxt}</div>
          <button class="btn btn-primary" data-sku="${p.sku||''}">أضف إلى السلة</button>
        </div>
      </article>`;
    }).join("");

    root.querySelectorAll("[data-sku]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const sku = btn.getAttribute("data-sku");
        try { alert(`أُضيف ${sku} (اربط بمنطق السلة الفعلي)`); } catch {}
      });
    });
  }

  function reRender(){
    if (document.querySelector("#catalog-grid")) renderCatalog("#catalog-grid");
  }

  window.BH_Catalog = Object.freeze({ render: renderCatalog });

  document.addEventListener("DOMContentLoaded", reRender);
  window.BH_Data?.onProductsChanged?.(()=> reRender());
})();