# Baby Haven — نسخة جاهزة للنشر على Vercel

## ما بداخل الحزمة
- واجهة الزبون (index.html, products.html, product.html, cart.html, checkout.html, thank-you.html)
- لوحة التحكم: admin/admin.html
- أصول مشتركة: assets/css, assets/js, imgs
- vercel.json: يوجّه / → index.html و /admin → admin/admin.html
- 404.html: صفحة خطأ ودّية

## طريقة النشر (بدون أوامر معقدة)
1) ارفع هذا المجلد إلى GitHub (Repo جديد).
2) في Vercel: Add New → Project → اختر الريبو → Deploy.
3) الرابط الناتج:
   - الواجهة: https://YOUR-PROJECT.vercel.app/
   - لوحة التحكم: https://YOUR-PROJECT.vercel.app/admin

## ملاحظات
- عدّل الصفحات كما تشاء، واستبدل محتوى admin/admin.html بملفاتك الفعلية.
- أضف ملفات JS الخاصة بلوحة التحكم تحت assets/js إن رغبت، أو هيكل modules منفصل.
