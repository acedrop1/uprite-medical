(function(){
  var mq=window.matchMedia('(max-width:980px)');
  var cb=document.getElementById('navtoggle');
  // accordion: tap a category to expand its submenu on mobile
  document.querySelectorAll('.nav-item.has-drop > a').forEach(function(a){
    a.addEventListener('click',function(e){
      if(!mq.matches) return;
      e.preventDefault();
      var it=a.parentElement, was=it.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(function(x){x.classList.remove('open');});
      if(!was) it.classList.add('open');
    });
  });
  // tapping a real link closes the whole menu
  document.querySelectorAll('.drop a, .nav-item:not(.has-drop) > a').forEach(function(a){
    a.addEventListener('click',function(){ if(cb) cb.checked=false; document.querySelectorAll('.nav-item.open').forEach(function(x){x.classList.remove('open');}); });
  });
  if(cb) cb.addEventListener('change',function(){ if(!cb.checked) document.querySelectorAll('.nav-item.open').forEach(function(x){x.classList.remove('open');}); });
  // header chat button opens the floating chat widget
  document.querySelectorAll('.nav-chat').forEach(function(b){
    b.addEventListener('click',function(e){ e.preventDefault(); var f=document.querySelector('.chat-fab'); if(f) f.click(); });
  });
})();
