(() => {
 const $=id=>document.getElementById(id);
 const authPanel=$("rescue-auth-panel"),dashboard=$("rescue-account-dashboard");
 if(typeof supabaseClient==="undefined")return;
 const message=(el,text,error=false)=>{el.textContent=text;el.classList.toggle("error",error);el.classList.toggle("success",!error&&!!text);};
 const showTab=tab=>{
  $("rescue-login-form").hidden=tab!=="login";
  $("rescue-signup-form").hidden=tab!=="signup";
  $("rescue-login-tab").classList.toggle("active",tab==="login");
  $("rescue-signup-tab").classList.toggle("active",tab==="signup");
  message($("rescue-auth-message"),"");
 };
 $("rescue-login-tab").addEventListener("click",()=>showTab("login"));
 $("rescue-signup-tab").addEventListener("click",()=>showTab("signup"));
 async function loadReports(user){
  $("rescue-account-welcome").textContent="Signed in as "+(user.email||"your account");
  const list=$("rescue-account-list");
  list.innerHTML='<p class="rescue-account-loading">Loading your complaints…</p>';
  const {data,error}=await supabaseClient.from("animal_rescue_reports")
   .select("id,complaint_id,status,animal_type,incident_type,severity,city,state,area,description,created_at")
   .eq("reporter_user_id",user.id).order("created_at",{ascending:false});
  if(error){list.textContent="Your complaints could not be loaded. Please refresh the page.";return;}
  if(!data?.length){list.innerHTML='<div class="rescue-account-empty"><span>🐾</span><h3>No rescue complaints yet</h3><p>When you submit a rescue report while logged in, it will appear here automatically.</p><a class="btn btn-primary" href="animal-rescue.html#emergency-report">Submit your first complaint</a></div>';return;}
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const label=v=>esc(String(v||"Not specified").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()));
  list.innerHTML=data.map(r=>{
   const place=[r.area,r.city,r.state].filter(Boolean).join(", ");
   const date=r.created_at?new Date(r.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"";
   const status=label(r.status);
   return '<article class="rescue-account-case"><div class="rescue-account-case-top"><span class="rescue-account-case-id">'+esc(r.complaint_id)+'</span><span class="rescue-account-status '+String(r.status).replace(/[^a-z_]/g,"")+'">'+label(r.status)+'</span></div><h3>'+label(r.animal_type)+' · '+label(r.incident_type)+'</h3><p>'+esc(place)+'</p><div class="rescue-account-case-bottom"><small>'+esc(date)+' · '+label(r.severity)+'</small><a href="client-chat.html?complaint_id='+encodeURIComponent(r.complaint_id)+'">View complaint &amp; chat →</a></div></article>';
  }).join("");
 }
 async function refresh(){
  const {data,error}=await supabaseClient.auth.getUser();
  if(error||!data.user){authPanel.hidden=false;dashboard.hidden=true;return;}
  authPanel.hidden=true;dashboard.hidden=false;await loadReports(data.user);
 }
 $("rescue-login-form").addEventListener("submit",async e=>{
  e.preventDefault();const btn=$("rescue-login-submit");btn.disabled=true;btn.textContent="Logging in…";
  const {error}=await supabaseClient.auth.signInWithPassword({email:$("rescue-login-email").value.trim(),password:$("rescue-login-password").value});
  btn.disabled=false;btn.textContent="Log in to my account";
  if(error){message($("rescue-auth-message"),error.message,true);return;}
  await refresh();
 });
 $("rescue-signup-form").addEventListener("submit",async e=>{
  e.preventDefault();const btn=$("rescue-signup-submit");btn.disabled=true;btn.textContent="Creating account…";
  const {data,error}=await supabaseClient.auth.signUp({
   email:$("rescue-signup-email").value.trim(),password:$("rescue-signup-password").value,
   options:{data:{full_name:$("rescue-signup-name").value.trim()},emailRedirectTo:location.origin+"/pages/rescue-account.html"}
  });
  btn.disabled=false;btn.textContent="Create Rescue Account";
  if(error){message($("rescue-auth-message"),error.message,true);return;}
  if(data.session){await refresh();}
  else message($("rescue-auth-message"),"Account created. Please check your email and confirm your address, then log in here.");
 });
 $("rescue-account-logout").addEventListener("click",async()=>{
  await supabaseClient.auth.signOut();dashboard.hidden=true;authPanel.hidden=false;showTab("login");
 });
 $("rescue-claim-form").addEventListener("submit",async e=>{
  e.preventDefault();const btn=$("rescue-claim-submit");btn.disabled=true;btn.textContent="Linking…";
  try{
   const {data,error}=await supabaseClient.functions.invoke("animal-rescue-client-chat",{body:{action:"claim",complaint_id:$("rescue-claim-id").value.trim().toUpperCase(),chat_key:$("rescue-claim-key").value.trim()}});
   if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Could not link complaint.");
   message($("rescue-claim-message"),"Complaint linked successfully. It will now appear in your account.");
   $("rescue-claim-form").reset();await refresh();
  }catch(err){message($("rescue-claim-message"),err.message||"Could not link complaint.",true);}
  finally{btn.disabled=false;btn.textContent="Link my complaint";}
 });
 supabaseClient.auth.onAuthStateChange((_event,session)=>{
  if(session?.user){authPanel.hidden=true;dashboard.hidden=false;loadReports(session.user);}
  else{authPanel.hidden=false;dashboard.hidden=true;}
 });
 refresh();
})();