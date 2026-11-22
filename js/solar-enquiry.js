(() => {
  const form=document.getElementById("solarEnquiryForm");
  const button=document.getElementById("solarSubmit");
  const message=document.getElementById("solarMessage");
  const whatsappNumber="918986951605";
  const setMessage=(text,error=false,link=null)=>{
    message.className="solar-message"+(error?" error":"");
    message.textContent=text;
    if(link){
      const a=document.createElement("a");
      a.className="solar-whatsapp-link";a.href=link;a.target="_blank";a.rel="noopener";
      a.textContent="Open WhatsApp message";
      message.appendChild(document.createElement("br"));message.appendChild(a);
    }
  };
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    if(document.getElementById("solarWebsite").value) return;
    const data=new FormData(form);
    const payload={
      customer_name:String(data.get("customer_name")||"").trim(),
      mobile:String(data.get("mobile")||"").trim(),
      provider:String(data.get("provider")||""),
      property_type:String(data.get("property_type")||""),
      monthly_bill:data.get("monthly_bill")?Number(data.get("monthly_bill")):null,
      city:String(data.get("city")||"").trim(),
      state:String(data.get("state")||"").trim(),
      pincode:String(data.get("pincode")||"").trim()||null,
      notes:String(data.get("notes")||"").trim()||null,
      consent:document.getElementById("solarConsent").checked
    };
    if(!payload.consent){setMessage("Please confirm consent before submitting.",true);return;}
    button.disabled=true;button.textContent="Saving enquiry…";message.className="";message.textContent="";
    try{
      const {error}=await supabaseClient.from("solar_leads").insert(payload);
      if(error) throw error;
      const bill=payload.monthly_bill===null?"Not provided":"₹"+payload.monthly_bill;
      const text=[
        "New Solar Enquiry — FindMyPet India",
        "Name: "+payload.customer_name,
        "Mobile: "+payload.mobile,
        "Interested in: "+payload.provider,
        "Property: "+payload.property_type,
        "Monthly electricity bill: "+bill,
        "City: "+payload.city+", "+payload.state,
        "PIN: "+(payload.pincode||"Not provided"),
        "Details: "+(payload.notes||"Not provided")
      ].join("\n");
      const waUrl="https://wa.me/"+whatsappNumber+"?text="+encodeURIComponent(text);
      setMessage("Your enquiry has been saved successfully. WhatsApp will open with a prepared message. Please review it and tap Send.",false,waUrl);
      button.textContent="Enquiry Saved";
      window.location.assign(waUrl);
    }catch(error){
      console.error("Solar enquiry submission failed:",error);
      setMessage(error.message||"We could not save your enquiry. Please try again.",true);
      button.disabled=false;button.textContent="Submit Solar Enquiry";
    }
  });
})();