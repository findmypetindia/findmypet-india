(() => {
 const form=document.getElementById("partner-form"); if(!form)return;
 const msg=document.getElementById("partner-message"),btn=document.getElementById("partner-submit");
 form.addEventListener("submit",async e=>{
  e.preventDefault(); if(!form.reportValidity())return;
  const fd=new FormData(form);
  const payload={};
  ["organization_name","partner_type","contact_person","mobile","whatsapp","email","city","state","pincode","service_areas","operating_hours","cost_model"].forEach(k=>payload[k]=String(fd.get(k)||"").trim());
  payload.animal_categories=fd.getAll("animal_categories");
  payload.services=fd.getAll("services");
  payload.emergency_available=fd.get("emergency_available")==="true";
  payload.public_listing_consent=fd.get("public_listing_consent")==="true";
  payload.consent=fd.get("consent")==="on";
  payload.website=String(fd.get("website")||"");
  btn.disabled=true;btn.textContent="Submitting…";form.setAttribute("aria-busy","true");msg.textContent="Submitting your application securely. This may take a few seconds—please keep this page open.";msg.classList.remove("success","error");
  try{
   const {data,error}=await supabaseClient.functions.invoke("animal-rescue-partner-apply",{body:payload});
   if(error)throw error;
   if(!data?.ok||!data?.application_id)throw new Error(data?.error||"Application could not be confirmed.");
   msg.textContent="Application received. Reference ID: "+data.application_id+". Status: Pending review. Save this ID. After approval, sign in with the same email address to use your Partner Dashboard.";
   msg.classList.add("success");form.reset();
  }catch(err){console.error("Partner application failed",err);msg.textContent="We could not submit your application. Please try again later.";msg.classList.add("error");}
  finally{btn.disabled=false;btn.textContent="Submit Partner Application";form.removeAttribute("aria-busy");}
 });
})();