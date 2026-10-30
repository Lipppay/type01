const video = document.querySelector('video');
const toggle = document.querySelector('#play-toggle');
function sync(){toggle.textContent=video.paused?'Play ▶':'Pause Ⅱ';toggle.setAttribute('aria-label',video.paused?'Play the demo':'Pause the demo');}
toggle.addEventListener('click',()=>{if(video.paused)video.play().catch(sync);else video.pause();});
video.addEventListener('play',sync);video.addEventListener('pause',sync);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause();}sync();
