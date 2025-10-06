
/* =======================================================
📁 File: assets/js/cart.js (v5)
🛒 السلة مع التحقق من المخزون + شارات تنبيه + منع تجاوز الكمية المتوفرة
======================================================= */
(function(){
  'use strict';
  if(!window.StoreDB){ console.error('StoreDB not found. Include assets/js/store-db.js first.'); return; }
  const { KEY_PRODUCTS, KEY_CART, read, write, fmt, cover, qtyOf } = window.StoreDB;

  function getProductBySku(sku){
    const data = read(KEY_PRODUCTS, []);
    return (Array.isArray(data)?data:[]).find(p => String(p.sku||'').toLowerCase()===String(sku).toLowerCase()) || null;
  }
  function parseVariantLabel(variantKey){
    if(!variantKey) return '';
    const [k,...rest] = String(variantKey).split(':');
    const v = rest.join(':').trim();
    if(!v) return '';
    if(k==='color') return `🎨 ${v}`;
    if(k==='size')  return `📏 ${v}`;
    return v;
  }
  function addOrSetCartItem(item, delta){
    const cart = read(KEY_CART, []);
    const key = item.sku+'|'+(item.variantKey||'');
    const idx = cart.findIndex(it => (it.sku+'|'+(it.variantKey||''))===key);
    if(idx>=0){
      cart[idx].qty = Math.max(0, (Number(cart[idx].qty)||0) + delta);
      if(cart[idx].qty===0) cart.splice(idx,1);
    }else if(delta>0){
      cart.push({ ...item, qty: delta });
    }
    write(KEY_CART, cart);
  }
  function removeItem(keySku, keyVariant){
    const cart = read(KEY_CART, []);
    const next = cart.filter(it => !((it.sku===keySku) && ((it.variantKey||'')===(keyVariant||''))));
    write(KEY_CART, next);
  }
  function clearCart(){ write(KEY_CART, []); }

  function calcTotals(cart){
    let subtotal=0, discountTotal=0, grand=0, count=0;
    for(const it of cart){
      const lineQty = Number(it.qty)||0;
      const unit = Number(it.price)||0;
      const p = getProductBySku(it.sku);
      const dp = p ? (Number(p.discountPercent)||0) : 0;
      const line = unit * lineQty;
      const lineDiscount = dp>0 ? (line * dp/100) : 0;
      subtotal += line;
      discountTotal += lineDiscount;
      count += lineQty;
    }
    grand = subtotal - discountTotal;
    return { subtotal, discountTotal, grand, count };
  }

  function itemRowHTML(it){
    const p = getProductBySku(it.sku) || {};
    const img = it.image || cover(p) || '';
    const unit = Number(it.price)||0;
    const dp = Number(p.discountPercent||0);
    const hasDiscount = dp>0;
    const unitAfter = hasDiscount ? unit*(1 - dp/100) : unit;
    const qty = Number(it.qty)||0;
    const avail = p ? (Number(qtyOf(p))||0) : 0;
    const out = avail<=0;
    const hitMax = !out && qty >= avail;

    return `<div class="card" style="padding:12px;display:grid;grid-template-columns:72px 1fr auto;gap:12px;align-items:center">
      <div style="position:relative">
        <img src="${img||''}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:14px;border:1px solid var(--bd);background:#EDECF4">
        ${out ? `<span class="badge off" style="left:auto;right:-6px;top:-6px">غير متوفر</span>` : ``}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <strong style="font-size:15px">${p.name || it.name || it.sku}</strong>
          <span class="pill" style="font-size:12px">SKU: ${it.sku}</span>
          ${it.variantKey ? `<span class="pill" style="font-size:12px">${parseVariantLabel(it.variantKey)}</span>` : ''}
          ${hasDiscount ? `<span class="pill" style="font-size:12px;background:#fee2e2;border-color:#fecaca;color:#b91c1c">خصم ${dp.toFixed(0)}%</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span>السعر:</span>
          ${hasDiscount ? `<span style="text-decoration:line-through;color:#9CA3AF">${fmt(unit)}</span>` : ''}
          <span class="price">${fmt(unitAfter)}</span>
          ${!out ? `<span class="pill" style="font-size:12px">المتوفر: ${avail}</span>` : ``}
        </div>
        ${hitMax ? `<div style="color:#b91c1c;font-size:12px">لا يمكنك تجاوز الكمية المتوفرة (${avail}).</div>` : ``}
        ${out && qty>0 ? `<div style="color:#b91c1c;font-size:12px">هذا المنتج غير متوفر حاليًا. يمكنك خفض الكمية أو حذفه.</div>` : ``}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <div style="display:flex; gap:8px; align-items:center; justify-content:center;">
          <button class="btn xs ghost" onclick="CartUI.dec('${it.sku}','${it.variantKey||''}')">−</button>
          <div style="min-width:38px;text-align:center;font-weight:800">${qty}</div>
          <button class="btn xs" ${out?'disabled':''} onclick="CartUI.inc('${it.sku}','${it.variantKey||''}')">+</button>
        </div>
        <div style="font-weight:800">${fmt(unitAfter * qty)}</div>
        <button class="btn ghost" onclick="CartUI.remove('${it.sku}','${it.variantKey||''}')">حذف</button>
      </div>
    </div>`;
  }

  function render(){
    const host = document.getElementById('cartList');
    const empty = document.getElementById('cartEmpty');
    const summary = document.getElementById('cartSummary');

    const cart = read(KEY_CART, []);
    if(!Array.isArray(cart) || cart.length===0){
      host.innerHTML = '';
      empty.style.display = 'block';
      summary.innerHTML = '';
      return;
    }
    empty.style.display = 'none';
    host.innerHTML = cart.map(itemRowHTML).join('');
    const t = calcTotals(cart);
    summary.innerHTML = `
      <div class="card" style="padding:14px;display:grid;gap:8px">
        <div style="display:flex;justify-content:space-between"><span>المجموع (قبل الخصم)</span><strong>${fmt(t.subtotal)}</strong></div>
        <div style="display:flex;justify-content:space-between"><span>إجمالي الخصم</span><strong style="color:#b91c1c">− ${fmt(t.discountTotal)}</strong></div>
        <hr style="border:none;border-top:1px solid var(--bd)">
        <div style="display:flex;justify-content:space-between;font-size:18px"><span>الإجمالي</span><strong>${fmt(t.grand)}</strong></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:6px">
          <a href="products.html" class="btn ghost" style="text-decoration:none;display:flex;align-items:center;justify-content:center">متابعة التسوق</a>
          <button class="btn" onclick="CartUI.checkout()">إتمام الطلب</button>
          <button class="btn ghost" onclick="CartUI.clearAll()">تفريغ السلة</button>
        </div>
      </div>`;
  }

  function inc(sku, variantKey){
    const cart = read(KEY_CART, []);
    const idx = cart.findIndex(it => it.sku===sku && (it.variantKey||'')===(variantKey||''));
    if(idx<0) return;
    const p = getProductBySku(sku);
    const avail = p ? (Number(qtyOf(p))||0) : 0;
    const current = Number(cart[idx].qty)||0;
    if(avail>0 && current >= avail){
      alert('لا يمكنك تجاوز الكمية المتوفرة.');
      return;
    }
    addOrSetCartItem(cart[idx], +1);
    render();
  }
  function dec(sku, variantKey){
    const cart = read(KEY_CART, []);
    const idx = cart.findIndex(it => it.sku===sku && (it.variantKey||'')===(variantKey||''));
    if(idx<0) return;
    addOrSetCartItem(cart[idx], -1);
    render();
  }
  function remove(sku, variantKey){
    if(!confirm('هل تريد حذف هذا المنتج من السلة؟')) return;
    removeItem(sku, variantKey);
    render();
  }
  function clearAll(){
    if(!confirm('تأكيد تفريغ السلة بالكامل؟')) return;
    clearCart();
    render();
  }
  function checkout(){
    alert('واجهة الدفع لم تُربط بعد. اربط ثواني (Thawani) في settings.js ثم أطلق الدفع من هنا.');
  }

  window.CartUI = { inc, dec, remove, clearAll, checkout, render };
  document.addEventListener('DOMContentLoaded', render);
})();
