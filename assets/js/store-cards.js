
/* =======================================================
📁 File: assets/js/store-cards.js (v3)
🛒 بطاقات المنتجات + خصم أعلى الصورة + شارات تحت السعر + زر سلة متحوّل
======================================================= */
(function(){
  'use strict';
  if(!window.StoreDB){ console.error('StoreDB not found. Include assets/js/store-db.js first.'); return; }
  const { KEY_PRODUCTS, KEY_CART, read, write, fmt, qtyOf, cover } = window.StoreDB;

  function minVariantPrice(p){
    if(p.type==='multi-color'){ const arr=(p.colors||[]).map(c=>+c.price||0).filter(Boolean); return arr.length?Math.min(...arr):0; }
    if(p.type==='multi-size'){ const arr=(p.sizes||[]).map(s=>+s.price||0).filter(Boolean); return arr.length?Math.min(...arr):0; }
    return +p.price||0;
  }
  function pickDefaultVariant(p){
    if(p.type==='multi-color'){
      const arr=Array.isArray(p.colors)?p.colors:[];
      if(!arr.length) return { variantKey:null, price:+p.price||0, image:cover(p) };
      const cheapest=arr.slice().sort((a,b)=>(+a.price||0)-(+b.price||0))[0];
      return { variantKey:'color:'+cheapest.label, price:+cheapest.price||0, image:cheapest.image||cover(p) };
    }
    if(p.type==='multi-size'){
      const arr=Array.isArray(p.sizes)?p.sizes:[];
      if(!arr.length) return { variantKey:null, price:+p.price||0, image:cover(p) };
      const cheapest=arr.slice().sort((a,b)=>(+a.price||0)-(+b.price||0))[0];
      return { variantKey:'size:'+cheapest.size, price:+cheapest.price||0, image:cover(p) };
    }
    return { variantKey:null, price:+p.price||0, image:cover(p) };
  }
  function qtyInCartBySku(sku){
    const cart = read(KEY_CART, []);
    return cart.filter(it=>it.sku===sku).reduce((s,it)=>s+(+it.qty||0),0);
  }
  function addOrSetCartItem({sku,name,type,price,image,variantKey=null}, delta){
    const cart = read(KEY_CART, []);
    const key = sku+'|'+(variantKey||'');
    const idx = cart.findIndex(it => (it.sku+'|'+(it.variantKey||''))===key);
    if(idx>=0){
      cart[idx].qty = Math.max(0, (+cart[idx].qty||0) + delta);
      if(cart[idx].qty===0) cart.splice(idx,1);
    } else if(delta>0){
      cart.push({ sku, name, type, price, image, variantKey, qty: delta });
    }
    write(KEY_CART, cart);
  }

  function chipsHTML(p){
    const chips = [];
    if(p.type === 'multi-color') chips.push('🎨 ألوان متعددة');
    if(p.type === 'multi-size') chips.push('📏 مقاسات متوفرة');
    if(!chips.length) return '';
    return `<div style="display:flex;flex-direction:column;gap:4px;margin-top:6px">
      ${chips.map(txt=>`
        <span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;background:#fff;border:1px solid var(--bd);font-size:12px;white-space:nowrap;">${txt}</span>
      `).join('')}
    </div>`;
  }

  function cardControlsHTML(p){
    const q = qtyInCartBySku(p.sku);
    if(q <= 0){
      return `<div style="display:flex;justify-content:center;">
        <button class="btn" style="min-width:160px;display:flex;justify-content:center;align-items:center;" onclick="BHCards.onAddClick('${p.sku}')">أضف إلى السلة</button>
      </div>`;
    }
    return `<div style="display:flex; gap:8px; align-items:center; justify-content:center;">
      <button class="btn xs ghost" onclick="BHCards.onDecClick('${p.sku}')">−</button>
      <div style="min-width:38px;text-align:center;font-weight:800">${q}</div>
      <button class="btn xs" onclick="BHCards.onIncClick('${p.sku}')">+</button>
    </div>`;
  }

  function cardHTML(p){
    const img = cover(p);
    const q   = qtyOf(p);
    const base = p.type==='simple' ? fmt(p.price) : (minVariantPrice(p) ? ('ابتداءً من ' + fmt(minVariantPrice(p))) : 'متغيّر');
    const hasDiscount = Number(p.discountPercent||0) > 0;
    const discountHTML = hasDiscount ? `<span class="badge off">-${Number(p.discountPercent).toFixed(0)}%</span>` : ``;

    return `<article class="card">
      <div class="media">
        ${img?`<img src="${img}" alt="${(p.name||p.sku||'').replace(/"/g,'&quot;')}">`:``}
        ${discountHTML}
      </div>
      <div class="body">
        <div class="title" title="${(p.name||'').replace(/"/g,'&quot;')}">${p.name||p.sku||''}</div>
        <div class="sku">${p.sku||''}</div>
        <div class="price">${base}</div>
        ${chipsHTML(p)}
        <div class="qtypill">المتوفر: ${q}</div>
        <div id="ctl-${p.sku}" style="width:100%; margin-top:8px">${cardControlsHTML(p)}</div>
      </div>
    </article>`;
  }

  function getProductBySku(sku){
    const data = read(KEY_PRODUCTS, []);
    return data.find(p => String(p.sku||'').toLowerCase()===String(sku).toLowerCase()) || null;
  }
  function rerenderCardControls(sku){
    const p = getProductBySku(sku);
    const host = document.getElementById('ctl-'+sku);
    if(!p || !host) return;
    host.innerHTML = cardControlsHTML(p);
  }

  function onAddClick(sku){
    const p = getProductBySku(sku);
    if(!p) return;
    const pick = pickDefaultVariant(p);
    addOrSetCartItem({sku:p.sku,name:p.name,type:p.type,price:pick.price,image:pick.image,variantKey:pick.variantKey}, +1);
    rerenderCardControls(sku);
  }
  function onIncClick(sku){
    const p = getProductBySku(sku); if(!p) return;
    const pick = pickDefaultVariant(p);
    addOrSetCartItem({sku:p.sku,name:p.name,type:p.type,price:pick.price,image:pick.image,variantKey:pick.variantKey}, +1);
    rerenderCardControls(sku);
  }
  function onDecClick(sku){
    const p = getProductBySku(sku); if(!p) return;
    const pick = pickDefaultVariant(p);
    addOrSetCartItem({sku:p.sku,name:p.name,type:p.type,price:pick.price,image:pick.image,variantKey:pick.variantKey}, -1);
    rerenderCardControls(sku);
  }

  // الرئيسية: أحدث 6 منتجات (ترتيب بالأحدث updatedAt/createdAt)
  function renderHome(containerId, limit=6){
    const el = document.getElementById(containerId);
    const data = read(KEY_PRODUCTS, []);
    if(!el) return;
    let arr = Array.isArray(data)?data:[];
    arr = arr.slice().sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
    el.innerHTML = arr.slice(0, limit).map(cardHTML).join('');
  }

  function renderCatalog(containerId, filters){
    const el = document.getElementById(containerId);
    const data = read(KEY_PRODUCTS, []);
    if(!el) return 0;
    let arr = Array.isArray(data)?data:[];
    const { q, type, section, category, sort } = Object.assign({q:'',type:'all',section:'',category:'',sort:'date-desc'}, filters||{});
    if(q){ const s=q.toLowerCase();
      arr = arr.filter(p => String(p.name||'').toLowerCase().includes(s) || String(p.sku||'').toLowerCase().includes(s)); }
    if(type!=='all') arr = arr.filter(p=>p.type===type);
    if(section) arr = arr.filter(p=>p.section===section);
    if(category) arr = arr.filter(p=>p.category===category);
    switch(sort){
      case 'price-asc':  arr.sort((a,b)=>minVariantPrice(a)-minVariantPrice(b)); break;
      case 'price-desc': arr.sort((a,b)=>minVariantPrice(b)-minVariantPrice(a)); break;
      case 'qty-desc':   arr.sort((a,b)=>qtyOf(b)-qtyOf(a)); break;
      default:           arr.sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
    }
    el.innerHTML = arr.map(cardHTML).join('');
    return arr.length;
  }

  window.BHCards = { renderHome, renderCatalog, onAddClick, onIncClick, onDecClick };
})();
