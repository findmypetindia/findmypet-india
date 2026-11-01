(() => {
 const status=document.getElementById("partner-dashboard-status"),list=document.getElementById("partner-request-list"),refresh=document.getElementById("partner-dashboard-refresh");
 if(!list)return;let busy=false,allRows=[];
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const labels={assigned:"New request",accepted:"Accepted",rejected:"Declined",in_progress:"Rescue in progress",completed:"Resolved"};
 const stages=["assigned","accepted","in_progress","completed"];
 const date=v=>v?new Date(v).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"—";
 function statusLabel(row){return row.status==="rejected"&&row.report?.status==="accepted"?"Closed — another partner accepted":(labels[row.status]||row.status);}
 function actions(row){
  if(row.status==="assigned")return '<button data-status="accepted">Accept case</button><button class="secondary" data-status="rejected">Decline</button>';
  if(row.status==="accepted")return '<button data-status="in_progress">Start rescue</button><button data-status="completed">Mark resolved</button>';
  if(row.status==="in_progress")return '<button data-status="completed">Mark resolved</button>';
  return '<span class="partner-case-closed">No further action available</span>';
 }
 function tracker(row){
  const current=stages.indexOf(row.status);
  if(current<0)return '<p class="partner-case-tracker-note">This request was declined or closed.</p>';
  return '<ol class="partner-case-tracker">'+stages.map((s,i)=>'<li class="'+(i<current?'done':i===current?'current':'')+'"><span></span><small>'+({assigned:"New",accepted:"Accepted",in_progress:"In progress",completed:"Resolved"}[s])+'</small></li>').join("")+'</ol>';
 }
 function mediaMarkup(urls){
  return (urls||[]).map((u,i)=>{
   const clean=String(u).split("?")[0].toLowerCase(),video=/\.(mp4|webm|mov|m4v)$/.test(clean);
   return video?'<div class="partner-media-item"><video controls preload="metadata" src="'+esc(u)+'"></video><small>Video '+(i+1)+'</small></div>':'<a class="partner-media-item" href="'+esc(u)+'" target="_blank" rel="noopener"><img loading="lazy" src="'+esc(u)+'" alt="Rescue case attachment '+(i+1)+'"><small>View photo '+(i+1)+'</small></a>';
  }).join("");
 }
 function render(){
  const q=(document.getElementById("partner-case-search")?.value||"").trim().toLowerCase(),filter=document.getElementById("partner-case-filter")?.value||"all";
  const rows=allRows.filter(row=>{
   const r=row.report||{},hay=[r.complaint_id,r.animal_type,r.incident_type,r.city,r.area,r.description,row.status].join(" ").toLowerCase();
   return (filter==="all"||row.status===filter)&&(!q||hay.includes(q));
  });
  const counts={total:allRows.length,new:0,active:0,resolved:0};
  allRows.forEach(r=>{if(r.status==="assigned")counts.new++;if(["accepted","in_progress"].includes(r.status))counts.active++;if(r.status==="completed")counts.resolved++;});
  document.getElementById("partner-stat-total").textContent=counts.total;
  document.getElementById("partner-stat-new").textContent=counts.new;
  document.getElementById("partner-stat-active").textContent=counts.active;
  document.getElementById("partner-stat-resolved").textContent=counts.resolved;
  document.getElementById("partner-case-count").textContent=rows.length+" case(s) shown";
  if(!rows.length){list.innerHTML='<div class="partner-directory-empty">No cases match this view. Try another filter or refresh requests.</div>';return;}
  list.innerHTML=rows.map(row=>{
   const r=row.report||{},coords=Number.isFinite(Number(r.latitude))&&Number.isFinite(Number(r.longitude))&&r.latitude!==null&&r.longitude!==null;
   const map=coords?'https://www.google.com/maps?q='+encodeURIComponent(r.latitude+','+r.longitude):"";
   const mobile=String(r.reporter_mobile||"").replace(/[^+0-9]/g,"");
   const severity=String(r.severity||"").toLowerCase();
   return '<article class="partner-request-card" data-id="'+esc(row.id)+'"><div class="partner-request-head"><div><span class="partner-case-id">'+esc(r.complaint_id||"Rescue request")+'</span><small>Received '+esc(date(r.created_at))+'</small></div><span class="partner-request-status '+(severity==="critical"||severity==="urgent"?"urgent":"")+'">'+esc(statusLabel(row))+'</span></div><div class="partner-case-main"><div><h2>'+esc(r.animal_type||"Animal")+" · "+esc(r.incident_type||"Emergency")+'</h2><p class="partner-case-description">'+esc(r.description||"No additional description provided.")+'</p><div class="partner-case-meta"><span><b>Urgency</b>'+esc(r.severity||"Not specified")+'</span><span><b>Area</b>'+esc([r.area,r.city,r.state,r.pincode].filter(Boolean).join(", ")||"Not provided")+'</span><span><b>Landmark</b>'+esc(r.landmark||"Not provided")+'</span></div></div><aside class="partner-case-contact"><b>Reporter contact</b><strong>'+esc(r.reporter_name||"Not provided")+'</strong>'+(mobile?'<a href="tel:'+esc(mobile)+'">'+esc(mobile)+'</a>':'<span>Number not provided</span>')+'</aside></div>'+tracker(row)+'<div class="partner-case-tools">'+(map?'<a href="'+map+'" target="_blank" rel="noopener">📍 Open GPS location</a>':'<span>GPS location not shared</span>')+(row.media_urls?.length?'<span>📎 '+row.media_urls.length+' attachment(s)</span>':'<span>No photos/videos attached</span>')+'</div>'+(row.media_urls?.length?'<div class="partner-request-media">'+mediaMarkup(row.media_urls)+'</div>':"")+'<div class="partner-request-actions">'+actions(row)+'</div></article>';
  }).join("");
  list.querySelectorAll("[data-status]").forEach(button=>button.addEventListener("click",async()=>{
   const card=button.closest(".partner-request-card");button.disabled=true;const original=button.textContent;button.textContent="Updating…";
   try{
    const result=await supabaseClient.functions.invoke("animal-rescue-partner-portal",{body:{action:"update",id:card.dataset.id,status:button.dataset.status}});
    if(result.error||!result.data?.ok)throw new Error(result.data?.error||result.error?.message||"Update failed.");
    await load();
   }catch(e){status.textContent=e.message||"Could not update this case.";status.classList.add("error");button.disabled=false;button.textContent=original;}
  }));
 }
 async function load(){
  if(busy)return;busy=true;refresh.disabled=true;status.textContent="Loading your assigned rescue cases…";list.innerHTML="";
  try{
   const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();if(sessionError)throw sessionError;
   if(!session){status.innerHTML='Please <a href="login.html">sign in</a> using the email address on your approved partner application.';return;}
   const {data,error}=await supabaseClient.functions.invoke("animal-rescue-partner-portal",{body:{action:"list"}});
   if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Partner access could not be confirmed.");
   document.getElementById("partner-dashboard-name").textContent=data.partner.organization_name;
   document.getElementById("partner-dashboard-location").textContent=[data.partner.city,data.partner.state].filter(Boolean).join(", ");
   allRows=data.assignments||[];status.textContent="Secure partner workspace connected. Your cases are visible only to your approved organisation.";
   render();
  }catch(e){console.error(e);status.textContent=e.message||"Unable to load partner requests.";status.classList.add("error");}
  finally{busy=false;refresh.disabled=false;}
 }
 document.getElementById("partner-case-search").addEventListener("input",render);
 document.getElementById("partner-case-filter").addEventListener("change",render);
 refresh.addEventListener("click",load);load();
})();