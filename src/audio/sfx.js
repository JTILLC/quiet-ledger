// Quiet WebAudio: off until the first tap or key, remembered per browser. No audio files.
export const SFX=(()=>{
  let ac=null, on=true, ready=false, amb=null, nb=null;
  try{ on=localStorage.getItem("ql-sound")!=="off"; }catch(e){}
  function ctx(){
    if(!on||!ready) return null;
    if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } }
    if(ac.state==="suspended") ac.resume();
    return ac;
  }
  function noise(a){ if(nb) return nb; nb=a.createBuffer(1,a.sampleRate,a.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return nb; }
  function burst(when,gain,freq,dur){
    const a=ctx(); if(!a) return;
    const src=a.createBufferSource(), f=a.createBiquadFilter(), g=a.createGain(), t=a.currentTime+when;
    src.buffer=noise(a); f.type="lowpass"; f.frequency.value=freq;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+0.005); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t+dur+0.05);
  }
  function stopAmb(){ if(!amb) return; const old=amb; amb=null; old.g.gain.setTargetAtTime(0,ac.currentTime,0.5); setTimeout(()=>old.nodes.forEach(n=>{try{n.stop()}catch(e){}}),2500); }
  function ambience(kind){
    if(amb&&amb.kind===kind) return; stopAmb();
    const a=ctx(); if(!a) return;
    const g=a.createGain(), nodes=[]; g.gain.value=0; g.connect(a.destination);
    if(kind==="street"){ const src=a.createBufferSource(), f=a.createBiquadFilter(); src.buffer=noise(a); src.loop=true; f.type="bandpass"; f.frequency.value=380; f.Q.value=0.6; src.connect(f).connect(g); src.start(); nodes.push(src); g.gain.setTargetAtTime(0.02,a.currentTime,1.5); }
    else { for(const fr of {chapel:[55,55.6,82.6],bakery:[41,41.6,61.8],battle:[46,46.8]}[kind]){ const o=a.createOscillator(); o.frequency.value=fr; o.connect(g); o.start(); nodes.push(o); } g.gain.setTargetAtTime(0.035,a.currentTime,1.5); }
    amb={kind,g,nodes};
  }
  return {
    get on(){ return on; },
    unlock(){ ready=true; },
    toggle(){ on=!on; try{ localStorage.setItem("ql-sound",on?"on":"off"); }catch(e){} if(!on) stopAmb(); },
    // in the dark chapel your footsteps come back a beat late, and now and then there's one more than yours
    step(echo){ burst(0,0.07,900,0.09); if(echo){ burst(0.42,0.04,650,0.1); if(Math.random()<0.18) burst(0.68,0.035,560,0.1); } },
    thump(){ burst(0,0.22,150,0.55); },
    ambience,
  };
})();

export const ambienceFor=s=>s.mode==="battle"?"battle":s.scene==="chapel"&&!s.chapelWon?"chapel":s.scene==="bakery"&&!s.bakeryWon?"bakery":"street";
