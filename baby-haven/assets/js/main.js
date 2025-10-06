/* 
# Header Block
File: assets/js/main.js
Purpose: وظائف عامة بسيطة للواجهة + توست
*/
(function(){
  const T = document.createElement('div');
  T.className = 'toast'; document.body.appendChild(T);
  window.toast = (msg)=>{
    T.innerHTML = '<div class="msg">'+(msg||'تم بنجاح')+'</div>';
    setTimeout(()=> T.innerHTML='', 2500);
  };
})();