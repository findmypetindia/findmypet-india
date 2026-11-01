(() => {
 const status=document.getElementById("partner-dashboard-status"),list=document.getElementById("partner-request-list"),refresh=document.getElementById("partner-dashboard-refresh");
 if(!list)return;let busy=false;
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const labels={assigned:"New request",accepted:"Accepted",rejected:"Declined",in_progress:"In progress",completed:"Completed"};
 const statusLabel=row=>row.status==="rejected"&&row.report?.status==="accepted"?"Closed — another partner accepted":(labels[row.status]||row.status);
 function actions(row){
  if(row.status==="assigned")return '<button data-status="accepted">Accept request</button><button class="secondary" data-status="rejected">Decline</button>';
  if(row.status==="accepted")return '<button data-status="in_progress">Mark in progress</button><button data-status="completed">Mark completed</button>';
  if(row.status==="in_progress")return '<button data-status="completed">Mark completed</button>';
  return "";
 }
 async function load(){
  if(busy)return;busy=true;refresh.disabled=true;status.textContent="Loading your matched requests…";list.innerHTML="";
  try{
   const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
   if(sessionError)throw sessionError;
   if(!session){status.innerHTML='Please <a href="login.html">sign in</a> using the email address on your approved partner application.';return;}
   const {data,error}=await supabaseClient.functions.invoke("animal-rescue-partner-portal",{body:{action:"list"}});
   if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Partner access could not be confirmed.");
   document.getElementById("partner-dashboard-name").textContent=data.partner.organization_name;
   document.getElementById("partner-dashboard-location").textContent=data.partner.city+", "+data.partner.state;
   const rows=data.assignments||[];status.textContent=rows.length+" matched request(s). Refresh this page to check for new cases.";
   if(!rows.length){list.innerHTML='<div class="partner-directory-empty">No matched requests yet. New suitable emergency reports will appear here after partner matching.</div>';return;}
   list.innerHTML=rows.map(row=>{
    const r=row.report||{};
    const hasCoords=r.latitude!==null&&r.latitude!==undefined&&r.longitude!==null&&r.longitude!==undefined;
    const map=hasCoords?'https://www.google.com/maps?q='+encodeURIComponent(r.latitude+','+r.longitude):'';
    const mobile=r.reporter_mobile||"";
    return '<article class="partner-request-card" data-id="'+esc(row.id)+'"><div class="partner-request-head"><strong>'+esc(r.complaint_id||"Rescue request")+'</strong><span class="partner-request-status">'+esc(statusLabel(row))+'</span></div><h2>'+esc(r.animal_type)+' · '+esc(r.incident_type)+'</h2><p><strong>Urgency:</strong> '+esc(r.severity)+' · <strong>Reported:</strong> '+esc(new Date(r.created_at).toLocaleString("en-IN"))+'</p><p><strong>Location:</strong> '+esc([r.area,r.city,r.state,r.pincode].filter(Boolean).join(", "))+' '+(r.landmark?"· "+esc(r.landmark):"")+'</p><p>'+esc(r.description)+'</p><p><strong>Reporter:</strong> '+esc(r.reporter_name||"Not provided")+' · <a href="tel:'+esc(mobile)+'">'+esc(mobile)+'</a></p>'+(map?'<p><a target="_blank" rel="noopener" href="'+map+'">Open exact location in Maps</a></p>':"")+(row.media_urls?.length?'<div class="partner-request-media">'+row.media_urls.map((u,i)=>'<a target="_blank" rel="noopener" href="'+esc(u)+'">View attachment '+(i+1)+'</a>').join("")+'</div>':"")+'<div class="partner-request-actions">'+actions(row)+'</div></article>';
   }).join("");
   list.querySelectorAll("[data-status]").forEach(button=>button.addEventListener("click",async()=>{
    const card=button.closest(".partner-request-card");button.disabled=true;
    try{
     const result=await supabaseClient.functions.invoke("animal-rescue-partner-portal",{body:{action:"update",id:card.dataset.id,status:button.dataset.status}});
     if(result.error||!result.data?.ok)throw new Error(result.data?.error||result.error?.message||"Update failed.");
     await load();
    }catch(e){status.textContent=e.message;status.classList.add("error");button.disabled=false;}
   }));
  }catch(e){console.error(e);status.textContent=e.message||"Unable to load partner requests.";status.classList.add("error");}
  finally{busy=false;refresh.disabled=false;}
 }
 refresh.addEventListener("click",load);load();
})();