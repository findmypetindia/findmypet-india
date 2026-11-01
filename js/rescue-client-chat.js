(() => {
 const identity=document.getElementById("rescue-chat-identity"),otpForm=document.getElementById("rescue-chat-otp"),workspace=document.getElementById("rescue-chat-workspace");
 if(!identity||typeof supabaseClient==="undefined")return;
 const $=id=>document.getElementById(id),idField=$("chat-complaint-id"),mobileField=$("chat-mobile");
 let phone="",complaintId="",readOnly=false,busy=false;
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const date=v=>v?new Date(v).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"";
 const setStatus=(el,msg,error=false)=>{el.textContent=msg;el.classList.toggle("error",error);el.classList.toggle("success",!error&&!!msg);};
 const phoneNumber=()=>{const d=mobileField.value.replace(/\D/g,"");return d.length===10?"+91"+d:"";};
 async function call(action,extra={}){const {data,error}=await supabaseClient.functions.invoke("animal-rescue-client-chat",{body:{action,complaint_id:complaintId,...extra}});if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Chat request failed.");return data;}
 async function load(){
  if(busy)return;busy=true;$("chat-refresh").disabled=true;
  try{
   const data=await call("list");
   $("chat-case-title").textContent=(data.partner_name||"Rescue partner")+" · "+complaintId;
   $("chat-case-status").textContent="Case status: "+String(data.case_status||"").replace(/_/g," ");
   if(data.pending){setStatus($("chat-case-notice"),data.message||"Waiting for a verified team to accept this case.");$("client-chat-messages").innerHTML='<p class="client-chat-empty">Your report is registered. Messages will appear here after a verified rescue team accepts it.</p>';$("client-chat-send").hidden=true;return;}
   readOnly=!!data.read_only;$("client-chat-send").hidden=readOnly;$("client-chat-text").disabled=readOnly;$("client-chat-submit").disabled=readOnly;
   setStatus($("chat-case-notice"),readOnly?"This case is marked resolved. You can read the conversation, but cannot send new messages.":"You are connected to the private case conversation.");
   const rows=data.messages||[];$("client-chat-messages").innerHTML=rows.length?rows.map(m=>'<article class="client-chat-message '+(m.sender_role==="client"?"mine":"theirs")+'"><b>'+(m.sender_role==="client"?"You":"Rescue team")+'</b><p>'+esc(m.message)+'</p><small>'+esc(date(m.created_at))+'</small></article>').join(""):'<p class="client-chat-empty">No messages yet. You can send the first message to the rescue team.</p>';
   $("client-chat-messages").scrollTop=$("client-chat-messages").scrollHeight;
  }catch(e){setStatus($("chat-case-notice"),e.message||"Could not load this case.",true);}
  finally{busy=false;$("chat-refresh").disabled=false;}
 }
 identity.addEventListener("submit",async e=>{
  e.preventDefault();complaintId=idField.value.trim();phone=phoneNumber();
  if(!phone){setStatus($("chat-access-status"),"Enter a valid 10-digit Indian mobile number.",true);return;}
  $("chat-send-otp").disabled=true;$("chat-send-otp").textContent="Sending OTP…";
  try{
   const {error}=await supabaseClient.auth.signInWithOtp({phone,options:{shouldCreateUser:true}});
   if(error)throw error;
   otpForm.hidden=false;identity.hidden=true;setStatus($("chat-otp-status"),"OTP sent to the mobile number. Enter it below to verify.");
  }catch(error){setStatus($("chat-access-status"),/sms|provider|phone|otp/i.test(error.message||"")?"SMS OTP is not available yet. The website owner must enable phone authentication and configure an SMS provider in Supabase.":(error.message||"Could not send OTP."),true);}
  finally{$("chat-send-otp").disabled=false;$("chat-send-otp").textContent="Send OTP";}
 });
 otpForm.addEventListener("submit",async e=>{
  e.preventDefault();const token=$("chat-otp").value.trim();if(!/^[0-9]{6}$/.test(token)){setStatus($("chat-otp-status"),"Enter the 6-digit OTP.",true);return;}
  $("chat-verify-otp").disabled=true;$("chat-verify-otp").textContent="Verifying…";
  try{const {data,error}=await supabaseClient.auth.verifyOtp({phone,token,type:"sms"});if(error)throw error;if(!data.session)throw new Error("Mobile verification did not create a session.");otpForm.hidden=true;workspace.hidden=false;await load();}
  catch(error){setStatus($("chat-otp-status"),error.message||"OTP verification failed.",true);}
  finally{$("chat-verify-otp").disabled=false;$("chat-verify-otp").textContent="Verify & Open Case";}
 });
 $("chat-back").addEventListener("click",()=>{otpForm.hidden=true;identity.hidden=false;$("chat-otp").value="";setStatus($("chat-access-status"),"Enter the mobile number registered on your report.");});
 $("chat-refresh").addEventListener("click",load);
 $("client-chat-send").addEventListener("submit",async e=>{
  e.preventDefault();const field=$("client-chat-text"),message=field.value.trim();if(!message||readOnly)return;
  $("client-chat-submit").disabled=true;$("client-chat-submit").textContent="Sending…";
  try{await call("send",{message});field.value="";await load();}
  catch(error){setStatus($("chat-case-notice"),error.message||"Message could not be sent.",true);}
  finally{$("client-chat-submit").disabled=false;$("client-chat-submit").textContent="Send message";}
 });
 $("chat-sign-out").addEventListener("click",async()=>{await supabaseClient.auth.signOut();workspace.hidden=true;identity.hidden=false;otpForm.hidden=true;$("chat-otp").value="";setStatus($("chat-access-status"),"You have signed out of case chat.");});
 const params=new URLSearchParams(location.search);if(params.get("complaint_id"))idField.value=params.get("complaint_id");
 supabaseClient.auth.getSession().then(async({data})=>{if(data?.session?.user?.phone_confirmed_at&&idField.value){complaintId=idField.value.trim();phone=data.session.user.phone||"";identity.hidden=true;workspace.hidden=false;await load();}});
})();