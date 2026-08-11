import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";
import { runMinigame } from "../engine/advancedSystems.js";
export function renderMinigame(el){
 const c=el||document.getElementById("minigameScreen"); if(!c)return;
 const types=[['thumbnail','🖼️ Thumbnail'],['timing','⏱️ Timing'],['podcast','🎙️ Encontrá el clip'],['tiktok','📱 Editá el viral']];
 c.innerHTML=`<div class="page-shell">${renderHeaderHud()}<div class="panel center"><div class="eyebrow">MINIJUEGO</div><h1 class="page-title">Dale el último empujón</h1><p class="muted">Elegí una habilidad y puntuá tu ejecución. El resultado afecta el cierre del trimestre.</p><div class="decision-grid">${types.map(t=>`<button class="decision-card" data-type="${t[0]}"><h2>${t[1]}</h2><p>0 = desastre · 100 = perfecto.</p></button>`).join('')}</div><div id="scoreBox" style="display:none;margin-top:20px"><input id="score" type="range" min="0" max="100" value="70" style="width:100%"><strong id="scoreValue">70</strong><br><button id="finish" class="btn primary big">CONTINUAR</button></div></div></div>`;
 let selected=null; const box=c.querySelector('#scoreBox'), score=c.querySelector('#score'), val=c.querySelector('#scoreValue');
 c.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{selected=b.dataset.type;box.style.display='block';});
 score.oninput=()=>val.textContent=score.value;
 c.querySelector('#finish').onclick=()=>{runMinigame(gameState,selected,score.value);gameState.guardar();window.location.hash='#pasanCosas';};
 return c;
}
export const minigameScreen={render:renderMinigame}; export default minigameScreen;
