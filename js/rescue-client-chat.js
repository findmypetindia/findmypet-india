(() => {
 const identity=document.getElementById("rescue-chat-identity"),workspace=document.getElementById("rescue-chat-workspace");
 if(!identity||typeof supabaseClient==="undefined")return;
 const $=id=>document.getElementById(id),idField=$("chat-complaint-id"),keyField=$("chat-access-key");
 let complaintId="",chatKey="",readOnly=false,busy=false;
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const date=v=>v?new Date(v).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"";
 const setStatus=(el,msg,error=false)=>{el.textContent=msg;el.classList.toggle("error",error);el.classList.toggle("success",!error&&!!msg);};
 async function call(action,extra={}){const {data,error}=await supabaseClient.functions.invoke("animal-rescue-client-chat",{body:{action,complaint_id:complaintId,chat_key:chatKey,...extra}});if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Chat request failed.");return data;}
 function renderCase(c){
  const status=String(c.status||"submitted").replace(/_/g," ");
  const steps=[
   ["Report submitted",true],
   ["Rescue team notified",["team_notified","accepted","in_progress","completed"].includes(c.status)],
   ["Team accepted",["accepted","in_progress","completed"].includes(c.status)],
   ["Rescue in progress",["in_progress","completed"].includes(c.status)],
   ["Case completed",c.status==="completed"]
  ];
  const place=[c.area,c.landmark,c.city,c.state,c.pincode].filter(Boolean).join(", ");
  const label=s=>String(s||"").replace(/_/g," ").replace(/\\b\\w/g,x=>x.toUpperCase());
  $("rescue-case-details").innerHTML=
   '<div class="rescue-dashboard-top"><div><span class="rescue-dashboard-eyebrow">YOUR COMPLAINT</span><h2>'+esc(c.complaint_id)+'</h2><p>Submitted '+esc(date(c.created_at))+'</p></div><span class="rescue-status-pill '+esc(c.status)+'">'+esc(label(status))+'</span></div>'+
   '<div class="rescue-progress-track">'+steps.map((st,i)=>'<div class="rescue-progress-step '+(st[1]?"done":"")+'"><span>'+(st[1]?"✓":(i+1))+'</span><small>'+esc(st[0])+'</small></div>').join("")+'</div>'+
   '<div class="rescue-case-grid">'+
   '<div><small>Animal</small><strong>'+esc(label(c.animal_type))+'</strong></div>'+
   '<div><small>Emergency</small><strong>'+esc(label(c.incident_type))+'</strong></div>'+
   '<div><small>Severity</small><strong>'+esc(label(c.severity))+'</strong></div>'+
   '<div><small>Reported by</small><strong>'+esc(c.reporter_name||"Not provided")+'</strong></div>'+
   '<div class="wide"><small>Location</small><strong>'+esc(place||"Not provided")+'</strong></div>'+
   '<div class="wide"><small>Details</small><p>'+esc(c.description||"No additional details provided.")+'</p></div>'+
   '<div class="wide"><small>Rescue organisation</small><strong>'+esc(c.partner_name||"Waiting for a verified rescue organisation to accept this case")+'</strong></div>'+
   '</div>'+
   (["unable_to_assign","cancelled"].includes(c.status)?'<p class="rescue-case-alert">This report currently has status: '+esc(label(c.status))+'. Please contact local emergency help if the animal is still in immediate danger.</p>':"");
 }
 async function load(){
  if(busy)return;busy=true;$("chat-refresh").disabled=true;
  try{
   const data=await call("list");
   $("chat-case-title").textContent=(data.partner_name||"Rescue partner")+" · "+complaintId;
   $("chat-case-status").textContent="Case status: "+String(data.case_status||"").replace(/_/g," ");
   if(data.pending){setStatus($("chat-case-notice"),data.message||"Chat will open after a verified rescue team accepts the case.");$("client-chat-messages").innerHTML='<p class="client-chat-empty">Your report is registered. Messages will appear here after a verified rescue team accepts it.</p>';$("client-chat-send").hidden=true;return;}
   readOnly=!!data.read_only;$("client-chat-send").hidden=readOnly;$("client-chat-text").disabled=readOnly;$("client-chat-submit").disabled=readOnly;
   setStatus($("chat-case-notice"),readOnly?"This case is resolved. You can read the conversation, but cannot send new messages.":"You are connected to the private case conversation.");
   const rows=data.messages||[];$("client-chat-messages").innerHTML=rows.length?rows.map(m=>'<article class="client-chat-message '+(m.sender_role==="client"?"mine":"theirs")+'"><b>'+(m.sender_role==="client"?"You":"Rescue team")+'</b><p>'+esc(m.message)+'</p><small>'+esc(date(m.created_at))+'</small></article>').join(""):'<p class="client-chat-empty">No messages yet. You can send the first message.</p>';
   $("client-chat-messages").scrollTop=$("client-chat-messages").scrollHeight;
  }catch(e){setStatus($("chat-case-notice"),e.message||"Could not load this case.",true);}
  finally{busy=false;$("chat-refresh").disabled=false;}
 }
 identity.addEventListener("submit",async e=>{
  e.preventDefault();complaintId=idField.value.trim().toUpperCase();chatKey=keyField.value.trim();
  if(!/^FMP-\d{8}-[A-F0-9]{6}$/.test(complaintId)){setStatus($("chat-access-status"),"Enter a valid Complaint ID.",true);return;}
  if(!/^\d{6}$/.test(chatKey)){setStatus($("chat-access-status"),"Enter your 6-digit numeric Chat Key.",true);return;}
  $("chat-open-case").disabled=true;$("chat-open-case").textContent="Verifying…";
  try{
   const details=await call("details");
   renderCase(details.case);
   identity.hidden=true;workspace.hidden=false;
   await load();
   if($("chat-case-notice").classList.contains("error")){workspace.hidden=true;identity.hidden=false;}
  }
  finally{$("chat-open-case").disabled=false;$("chat-open-case").textContent="Open Secure Chat";}
 });
 $("chat-refresh").addEventListener("click",load);
 $("client-chat-send").addEventListener("submit",async e=>{
  e.preventDefault();const field=$("client-chat-text"),message=field.value.trim();if(!message||readOnly)return;
  $("client-chat-submit").disabled=true;$("client-chat-submit").textContent="Sending…";
  try{await call("send",{message});field.value="";await load();}
  catch(error){setStatus($("chat-case-notice"),error.message||"Message could not be sent.",true);}
  finally{$("client-chat-submit").disabled=false;$("client-chat-submit").textContent="Send message";}
 });
 $("chat-sign-out").addEventListener("click",()=>{chatKey="";keyField.value="";workspace.hidden=true;identity.hidden=false;setStatus($("chat-access-status"),"You have left the private case chat.");});
 const params=new URLSearchParams(location.search);
 if(params.get("complaint_id")){
  idField.value=params.get("complaint_id");
  supabaseClient.auth.getSession().then(({data})=>{if(data?.session)identity.requestSubmit();});
 }
})();