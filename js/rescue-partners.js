(() => {
 const grid=document.getElementById("partner-directory-grid"),status=document.getElementById("partner-directory-status"),search=document.getElementById("partner-search"),state=document.getElementById("partner-state"),city=document.getElementById("partner-city");
 if(!grid)return;let partners=[];
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const wa=v=>String(v||"").replace(/\D/g,"");
 function render(){
  const q=search.value.trim().toLowerCase(),s=state.value,c=city.value;
  const rows=partners.filter(p=>(!s||p.state===s)&&(!c||p.city===c)&&(!q||[p.organization_name,p.partner_type,p.city,p.state,p.service_areas,...(p.services||[]),...(p.animal_categories||[])].join(" ").toLowerCase().includes(q)));
  status.textContent=rows.length+" verified partner(s) found.";
  grid.innerHTML=rows.length?rows.map(p=>'<article class="partner-directory-card"><div class="partner-directory-top"><span class="partner-verified">✓ Verified Partner</span><span class="partner-kind">'+esc(p.partner_type)+'</span></div><h2>'+esc(p.organization_name)+'</h2><p class="partner-place">📍 '+esc(p.city)+', '+esc(p.state)+'</p><p><strong>Coverage:</strong> '+esc(p.service_areas)+'</p><p><strong>Animals:</strong> '+esc((p.animal_categories||[]).join(", ")||"Not specified")+'</p><p><strong>Services:</strong> '+esc((p.services||[]).join(", ")||"Not specified")+'</p><p><strong>Availability:</strong> '+esc(p.operating_hours||"Please contact to confirm")+' · <strong>Charges:</strong> '+esc(p.cost_model)+'</p><div class="partner-contact-actions">'+(p.mobile?'<a href="tel:'+esc(p.mobile)+'">Call</a>':"")+(p.whatsapp?'<a target="_blank" rel="noopener" href="https://wa.me/'+wa(p.whatsapp)+'">WhatsApp</a>':"")+(p.email?'<a href="mailto:'+esc(p.email)+'">Email</a>':"")+'</div></article>').join(""):'<div class="partner-directory-empty">No verified partners match these filters yet. Try another city or check back later.</div>';
 }
 async function load(){
  try{
   const {data,error}=await supabaseClient.functions.invoke("animal-rescue-partner-directory",{body:{}});
   if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Unable to load directory.");
   partners=data.partners||[];
   [...new Set(partners.map(p=>p.state).filter(Boolean))].sort().forEach(v=>state.add(new Option(v,v)));
   [...new Set(partners.map(p=>p.city).filter(Boolean))].sort().forEach(v=>city.add(new Option(v,v)));
   render();
  }catch(e){console.error(e);status.textContent="The verified partner directory is temporarily unavailable.";status.classList.add("error");}
 }
 [search,state,city].forEach(el=>el.addEventListener("input",render));
 [state,city].forEach(el=>el.addEventListener("change",render));
 load();
})();