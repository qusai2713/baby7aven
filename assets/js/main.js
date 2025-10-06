(function(){
  const t=document.createElement('div');t.className='toast';document.body.appendChild(t);
  window.toast=(m)=>{t.innerHTML='<div style="background:#333;color:#fff;padding:10px 16px;border-radius:8px;">'+(m||'تم')+'</div>';setTimeout(()=>t.innerHTML='',2000);};
})();