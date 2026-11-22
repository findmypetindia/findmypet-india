(() => {
  const list=document.getElementById("solar-admin-leads");
  const message=document.getElementById("solar-admin-message");
  const refresh=document.getElementById("solar-admin-refresh");
  if(!list||!message||!refresh) return;
  const statuses=["new","contacted","qualified","closed","not_interested"];
  const labels={new:"New",contacted:"Contacted",qualified:"Qualified",closed:"Closed",not_interested:"Not interested"};
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const setMessage=(s,bad=false)=>{message.textContent=s;message.classList.toggle("error",bad);};
  async function load(){
    list.innerHTML="";setMessage("Loading solar leads…");
    const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
    if(sessionError||!session){setMessage("Sign in with the authorised admin account to view solar leads.",true);return;}
    const {data,error}=await supabaseClient.functions.invoke("animal-rescue-admin",{body:{action:"solar_list"}});
    if(error||!data?.ok){setMessage(data?.error||error?.message||"Could not load solar leads. Check admin access.",true);return;}
    const rows=data.leads||[];
    setMessage(rows.length?rows.length+" solar lead(s) found.":"No solar enquiries received yet.");
    if(!rows.length)return;
    list.innerHTML=rows.map(r=>'<article class="rescue-admin-card solar-admin-card" data-id="'+esc(r.id)+'">'+
      '<div class="rescue-admin-card-head"><h2>'+esc(r.customer_name)+'</h2><span class="rescue-admin-status">'+esc(labels[r.status]||r.status)+'</span></div>'+
      '<p><strong>Brand:</strong> '+esc(r.provider)+' · <strong>Property:</strong> '+esc(r.property_type)+'</p>'+
      '<p><strong>Mobile:</strong> <a href="tel:'+esc(r.mobile)+'">'+esc(r.mobile)+'</a> · <a href="https://wa.me/'+esc(r.mobile.replace(/[^0-9]/g,""))+'" target="_blank" rel="noopener">Customer WhatsApp</a></p>'+
      '<p><strong>Location:</strong> '+esc(r.city)+', '+esc(r.state)+' '+esc(r.pincode||"")+' · <strong>Monthly bill:</strong> '+(r.monthly_bill===null?"Not provided":"₹"+esc(r.monthly_bill))+'</p>'+
      '<p><strong>Details:</strong> '+esc(r.notes||"Not provided")+'</p>'+
      '<p><strong>Received:</strong> '+esc(new Date(r.created_at).toLocaleString("en-IN"))+'</p>'+
      '<div class="rescue-admin-actions"><label>Lead status <select class="solar-status">'+statuses.map(s=>'<option value="'+s+'" '+(r.status===s?"selected":"")+'>'+labels[s]+'</option>').join("")+'</select></label><button type="button" class="btn btn-danger solar-save">Save status</button></div></article>').join("");
    list.querySelectorAll(".solar-save").forEach(btn=>btn.addEventListener("click",async()=>{
      const card=btn.closest(".solar-admin-card"),id=card.dataset.id,status=card.querySelector(".solar-status").value;
      btn.disabled=true;setMessage("Updating lead status…");
      const result=await supabaseClient.functions.invoke("animal-rescue-admin",{body:{action:"solar_update",id,status}});
      btn.disabled=false;
      if(result.error||!result.data?.ok){setMessage(result.data?.error||result.error?.message||"Status update failed.",true);return;}
      setMessage("Solar lead status updated.");await load();
    }));
  }
  refresh.addEventListener("click",()=>load().catch(()=>setMessage("Could not load solar leads.",true)));
  load().catch(()=>setMessage("Could not load solar leads.",true));
})();