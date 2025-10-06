
/* admin.js — تبويب المنتجات + الإعدادات */
(function(){
  'use strict';
  const { KEY_PRODUCTS, read, write } = window.StoreDB;
  const Settings = window.BHSettings;

  function showTab(name){
    document.getElementById('tab-products').style.display = (name==='products')?'block':'none';
    document.getElementById('tab-categories').style.display = (name==='categories')?'block':'none';
    document.getElementById('tab-settings').style.display = (name==='settings')?'block':'none';
    const btns = document.querySelectorAll('.card > .btn, .card > .btn.ghost');
    // no-op; simple styles already applied
  }

  function resetForm(){
    ['pName','pSku','pType','pPrice','pQty','pDiscount','pSection','pCategory','pImage'].forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      if(el.tagName==='SELECT'){ el.value = 'simple'; }
      else el.value = '';
    });
  }

  function saveProduct(){
    const p = {
      name: document.getElementById('pName').value.trim(),
      sku: document.getElementById('pSku').value.trim(),
      type: document.getElementById('pType').value,
      price: Number(document.getElementById('pPrice').value||0),
      quantity: Number(document.getElementById('pQty').value||0),
      discountPercent: Number(document.getElementById('pDiscount').value||0),
      section: document.getElementById('pSection').value.trim(),
      category: document.getElementById('pCategory').value.trim(),
      image: document.getElementById('pImage').value.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if(!p.name || !p.sku){ alert('الاسم و SKU مطلوبان'); return; }
    const data = read(KEY_PRODUCTS, []);
    const idx = (Array.isArray(data)?data:[]).findIndex(x => (x.sku||'').toLowerCase()===p.sku.toLowerCase());
    if(idx>=0){ data[idx] = { ...data[idx], ...p, createdAt: data[idx].createdAt, updatedAt: Date.now() }; }
    else { (Array.isArray(data)?data:[]).push(p); }
    write(KEY_PRODUCTS, data);
    renderList();
    alert('تم حفظ المنتج');
  }

  function renderList(){
    const host = document.getElementById('adminProducts');
    const data = read(KEY_PRODUCTS, []);
    if(!Array.isArray(data) || !data.length){ host.innerHTML = '<div class="empty">لا توجد منتجات</div>'; return; }
    const rows = data.slice().sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0)).map(p=>`
      <div class="card" style="padding:10px;display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center">
        <img src="${p.image||''}" style="width:64px;height:64px;object-fit:cover;border-radius:12px;border:1px solid var(--bd);background:#EDECF4">
        <div>
          <div><strong>${p.name||''}</strong> — <span class="pill" style="font-size:12px">SKU: ${p.sku||''}</span></div>
          <div class="muted" style="font-size:12px">${p.type||'simple'} · ${p.section||'-'} / ${p.category||'-'}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost" onclick="AdminUI.edit('${(p.sku||'').replace(/'/g,'&#39;')}')">تعديل</button>
          <button class="btn" onclick="AdminUI.remove('${(p.sku||'').replace(/'/g,'&#39;')}')">حذف</button>
        </div>
      </div>
    `).join('');
    host.innerHTML = rows;
  }

  function edit(sku){
    const data = read(KEY_PRODUCTS, []);
    const p = (Array.isArray(data)?data:[]).find(x => (x.sku||'').toLowerCase()===sku.toLowerCase());
    if(!p) return;
    document.getElementById('pName').value = p.name||'';
    document.getElementById('pSku').value = p.sku||'';
    document.getElementById('pType').value = p.type||'simple';
    document.getElementById('pPrice').value = p.price||0;
    document.getElementById('pQty').value = p.quantity||p.qty||0;
    document.getElementById('pDiscount').value = p.discountPercent||0;
    document.getElementById('pSection').value = p.section||'';
    document.getElementById('pCategory').value = p.category||'';
    document.getElementById('pImage').value = p.image||'';
  }

  function remove(sku){
    if(!confirm('حذف المنتج نهائيًا؟')) return;
    const data = read(KEY_PRODUCTS, []);
    const next = (Array.isArray(data)?data:[]).filter(x => (x.sku||'').toLowerCase()!==sku.toLowerCase());
    write(KEY_PRODUCTS, next);
    renderList();
  }

  // Settings
  function loadSettings(){
    const v = Settings.load();
    document.getElementById('sPublic').value  = v.thawani_public_key || '';
    document.getElementById('sSecret').value  = v.thawani_secret_key || '';
    document.getElementById('sWebhook').value = v.webhook_secret || '';
    document.getElementById('sCurrency').value= v.currency || 'OMR';
    document.getElementById('sShip').value    = v.shipping_flat || '';
    document.getElementById('sTax').value     = v.tax_percent || '';
  }
  function saveSettings(){
    const v = {
      thawani_public_key: document.getElementById('sPublic').value.trim(),
      thawani_secret_key: document.getElementById('sSecret').value.trim(),
      webhook_secret: document.getElementById('sWebhook').value.trim(),
      currency: document.getElementById('sCurrency').value.trim() || 'OMR',
      shipping_flat: Number(document.getElementById('sShip').value||0),
      tax_percent: Number(document.getElementById('sTax').value||0),
    };
    window.BHSettings.save(v);
    alert('تم حفظ الإعدادات');
  }

  window.AdminUI = { showTab, resetForm, saveProduct, renderList, edit, remove, loadSettings, saveSettings };
  document.addEventListener('DOMContentLoaded', function(){
    showTab('products');
    renderList();
    loadSettings();
  });
})();
