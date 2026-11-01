(() => {
  const message = document.getElementById('admin-message');
  const list = document.getElementById('admin-applications');
  const refresh = document.getElementById('admin-refresh');
  const signout = document.getElementById('admin-signout');
  const statusOptions = ['pending','verification_in_progress','verified','rejected','suspended'];
  const labels = {pending:'Pending',verification_in_progress:'Verification in progress',verified:'Verified',rejected:'Rejected',suspended:'Suspended'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const setMessage = (text, bad=false) => { message.textContent=text; message.classList.toggle('error',bad); };
  async function load() {
    list.innerHTML='';
    setMessage('Loading private applications…');
    const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
    if(sessionError || !session) { setMessage('Please sign in with the authorised FindMyPet India admin account, then reopen this page.',true); return; }
    const {data,error}=await supabaseClient.functions.invoke('animal-rescue-admin',{body:{action:'list'}});
    if(error || !data?.ok) { setMessage(data?.error || error?.message || 'Unable to load applications. Check admin access and RESCUE_ADMIN_EMAILS secret.',true); return; }
    const rows=data.applications || [];
    setMessage(rows.length ? rows.length+' application(s) found.' : 'No partner applications received yet.');
    if(!rows.length) return;
    list.innerHTML=rows.map(row=>`
      <article class="rescue-admin-card" data-id="${esc(row.id)}">
        <div class="rescue-admin-card-head"><h2>${esc(row.organization_name)}</h2><span class="rescue-admin-status">${esc(labels[row.status] || row.status)}</span></div>
        <p><strong>Type:</strong> ${esc(row.partner_type)} · <strong>Location:</strong> ${esc(row.city)}, ${esc(row.state)} ${esc(row.pincode)}</p>
        <p><strong>Contact:</strong> ${esc(row.contact_person)} · <a href="tel:${esc(row.mobile)}">${esc(row.mobile)}</a> ${row.whatsapp ? '· <a href="https://wa.me/'+esc(row.whatsapp.replace(/[^0-9]/g,''))+'" target="_blank" rel="noopener">WhatsApp</a>' : ''}</p>
        <p><strong>Email:</strong> ${esc(row.email || 'Not provided')} · <strong>Coverage:</strong> ${esc(row.service_areas)}</p>
        <p><strong>Animals:</strong> ${esc((row.animal_categories||[]).join(', '))}</p><p><strong>Services:</strong> ${esc((row.services||[]).join(', '))}</p>
        <p><strong>Hours:</strong> ${esc(row.operating_hours || 'Not specified')} · <strong>Charges:</strong> ${esc(row.cost_model)} · <strong>Emergency calls:</strong> ${row.emergency_available?'Yes':'No'}</p>
        <p><strong>Submitted:</strong> ${esc(new Date(row.created_at).toLocaleString('en-IN'))} · <strong>Application consent:</strong> ${row.consent?'Confirmed':'Not confirmed'} · <strong>Public directory consent:</strong> ${row.public_listing_consent?'Yes':'No'}</p>
        <div class="rescue-admin-actions"><label>Review status <select class="admin-status">${statusOptions.map(s=>'<option value="'+s+'" '+(row.status===s?'selected':'')+'>'+labels[s]+'</option>').join('')}</select></label><button type="button" class="btn btn-danger admin-save">Save status</button></div>
      </article>`).join('');
    list.querySelectorAll('.admin-save').forEach(button=>button.addEventListener('click', async ()=>{
      const card=button.closest('.rescue-admin-card'); const id=card.dataset.id; const status=card.querySelector('.admin-status').value;
      button.disabled=true; setMessage('Saving review decision…');
      const result=await supabaseClient.functions.invoke('animal-rescue-admin',{body:{action:'update',id,status}});
      button.disabled=false;
      if(result.error || !result.data?.ok) { setMessage(result.data?.error || result.error?.message || 'Status update failed.',true); return; }
      setMessage('Status updated.'); await load();
    }));
  }
  refresh.addEventListener('click',load);
  signout.addEventListener('click',async()=>{await supabaseClient.auth.signOut(); list.innerHTML='';setMessage('You have been signed out.');});
  load().catch(()=>setMessage('Unexpected error while loading applications.',true));
})();