/*
# Header Block
File: assets/js/admin/products-bridge.js
Purpose: دوال مساعدة من لوحة التحكم لحفظ/حذف المنتجات عبر BH_Data
*/
(function(){
  "use strict";
  window.BH_saveProductFromAdmin = function(product){
    if (!product || !product.sku) return alert("لا يمكن الحفظ بدون SKU");
    if (window.BH_Data?.upsertProduct) BH_Data.upsertProduct(product);
  };
  window.BH_deleteProductFromAdmin = function(sku){
    if (!sku) return;
    if (window.BH_Data?.removeProduct) BH_Data.removeProduct(sku);
  };
})();