(function(){
  // prevent pinch / double-tap zoom & gesture zoom (iOS ignores user-scalable=no)
  ['gesturestart','gesturechange','gestureend'].forEach(function(e){document.addEventListener(e,function(ev){ev.preventDefault();},{passive:false});});
  // double-tap zoom is disabled via touch-action:none on all game elements (style.css/pwa.css)
  // no pull-to-refresh / bounce outside scrollable panels
  document.addEventListener('touchmove',function(e){if(e.touches.length>1){e.preventDefault();return;}var el=e.target;while(el&&el!==document.body){if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1){var s=getComputedStyle(el);if(/auto|scroll/.test(s.overflowY+s.overflowX))return;}el=el.parentElement;}e.preventDefault();},{passive:false});
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('selectstart',function(e){if(!(e.target.closest&&e.target.closest('input,textarea')))e.preventDefault();});
  // unlock WebAudio on first touch (iOS)
  var unlocked=false;function unlock(){if(unlocked)return;try{var C=window.AudioContext||window.webkitAudioContext;var ac=new C();var b=ac.createBuffer(1,1,22050),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start(0);if(ac.state==='suspended')ac.resume();unlocked=true;window.__bcUnlockAC=ac;}catch(e){}}
  ['touchstart','touchend','pointerdown','click'].forEach(function(e){document.addEventListener(e,unlock,{capture:true,passive:true});});
  // rotation / toolbar resizing: re-fire resize after iOS settles
  function kick(){window.dispatchEvent(new Event('resize'));}
  window.addEventListener('orientationchange',function(){setTimeout(kick,100);setTimeout(kick,400);setTimeout(kick,1000);});
  if(window.visualViewport)visualViewport.addEventListener('resize',function(){setTimeout(kick,50);});
  // save + pause when app goes to background
  document.addEventListener('visibilitychange',function(){if(document.hidden){try{window.dhPause&&window.dhPause();}catch(e){}}else{try{window.dhResume&&window.dhResume();}catch(e){}}});
  window.addEventListener('pagehide',function(){try{window.dhPause&&window.dhPause();}catch(e){}});
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});
  if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(e){console.warn('SW',e);});});
})();
