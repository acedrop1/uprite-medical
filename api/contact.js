// Vercel/Netlify-style serverless function: emails contact-form leads to the front desk
// as a branded HTML email. Configure these environment variables on your host:
//   RESEND_API_KEY   (required)  your Resend API key  -> https://resend.com
//   LEAD_TO          (optional)  recipient, default frontdesk@upritemedical.com
//   LEAD_FROM        (optional)  verified sender, default "Uprite Website <noreply@upritemedical.com>"
//
// The sending domain must be verified in Resend before email will deliver.

const TO   = process.env.LEAD_TO   || 'frontdesk@upritemedical.com';
const FROM = process.env.LEAD_FROM || 'Uprite Website <noreply@upritemedical.com>';
const LOGO = process.env.LEAD_LOGO || 'https://uprite-medical.vercel.app/logo-email.png';

function esc(s){return String(s||'').replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}

function pill(t,bg,fg){return '<span style="display:inline-block;background:'+bg+';color:'+fg+';font:700 11px/1 Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:999px">'+esc(t)+'</span>';}
function brandedEmail(d){
  var when=new Date().toLocaleString('en-US',{timeZone:'America/New_York',dateStyle:'medium',timeStyle:'short'});
  function row(label,val){return val?'<tr><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#7a8398;font:600 11px/1.2 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;width:138px;vertical-align:top">'+label+'</td><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#141821;font:14px/1.5 Arial,sans-serif">'+esc(val)+'</td></tr>':'';}
  var ph=String(d.phone||'').replace(/[^0-9+]/g,'');
  return ''+
  '<div style="background:#eef1f8;padding:30px 12px;font-family:Arial,Helvetica,sans-serif">'+
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'+
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px -20px rgba(7,19,53,.30)">'+
    // header (brand wordmark + dotted arc cue)
    '<tr><td style="background:#071335;padding:26px 30px 22px">'+
      '<img src="'+LOGO+'" alt="Uprite Medical" width="180" height="61" style="display:block;border:0;outline:none;text-decoration:none">'+
      '<div style="font:11px/1.4 Arial,sans-serif;color:#9fb4dc;margin-top:13px;letter-spacing:.12em">SPINE &middot; ORTHOPEDIC &middot; NEUROSCIENCE CENTER</div>'+
    '</td></tr>'+
    '<tr><td style="height:4px;background:#1747e6"></td></tr>'+
    // status row
    '<tr><td style="padding:24px 30px 8px">'+
      pill(d.type||'New appointment request','#e8edff','#1747e6')+'&nbsp;&nbsp;'+pill('Pending','#fff3da','#9a6a00')+
      '<div style="font:13px/1.5 Arial,sans-serif;color:#6a7384;margin-top:13px">Submitted '+esc(when)+' (ET)</div>'+
    '</td></tr>'+
    // fields
    '<tr><td style="padding:6px 30px 4px">'+
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'+
        row('Name',d.name)+row('Phone',d.phone)+row('Email',d.email)+row('Preferred office',d.office)+row('Message',d.message)+row('Source',d.source)+
      '</table>'+
    '</td></tr>'+
    // action-needed note
    '<tr><td style="padding:18px 30px 0">'+
      '<div style="background:#f5f8ff;border:1px solid #dbe4ff;border-radius:12px;padding:14px 16px;font:13px/1.55 Arial,sans-serif;color:#46506a">'+
      '<b style="color:#1747e6">Action needed:</b> This is a request only. No appointment is confirmed until the front desk contacts the patient to schedule.</div>'+
    '</td></tr>'+
    // CTAs
    '<tr><td style="padding:18px 30px 28px">'+
      (ph?'<a href="tel:'+esc(ph)+'" style="display:inline-block;background:#1747e6;color:#ffffff;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:13px 22px;border-radius:999px;margin:0 8px 8px 0">Call patient back</a>':'')+
      (d.email?'<a href="mailto:'+esc(d.email)+'" style="display:inline-block;background:#ffffff;color:#1747e6;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:12px 21px;border-radius:999px;border:1px solid #1747e6;margin:0 0 8px 0">Email patient</a>':'')+
    '</td></tr>'+
    // footer
    '<tr><td style="background:#f7f9fc;padding:18px 30px;border-top:1px solid #edf0f5">'+
      '<div style="font:11px/1.7 Arial,sans-serif;color:#8a93a6">Uprite Medical &middot; (201) 849-1000 &middot; frontdesk@upritemedical.com<br>Totowa: 825 Riverview Dr, Floor 1 &middot; Hazlet: 1270 NJ-35, Suite 1<br>Sent automatically from upritemedical.com. Reply to the patient by phone or email above.</div>'+
    '</td></tr>'+
  '</table></td></tr></table></div>';
}

async function readBody(req){
  if(req.body){ return typeof req.body==='string'?JSON.parse(req.body):req.body; }
  return await new Promise(function(resolve){var b='';req.on('data',function(c){b+=c;});req.on('end',function(){try{resolve(JSON.parse(b||'{}'));}catch(e){resolve({});}});});
}

module.exports = async function handler(req,res){
  if(req.method!=='POST'){res.statusCode=405;return res.end(JSON.stringify({success:false,error:'Method not allowed'}));}
  res.setHeader('Content-Type','application/json');
  try{
    var d=await readBody(req);
    if(!d.name||!d.phone){res.statusCode=400;return res.end(JSON.stringify({success:false,error:'Name and phone are required'}));}
    if(!process.env.RESEND_API_KEY){res.statusCode=500;return res.end(JSON.stringify({success:false,error:'Email service not configured'}));}
    var r=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:FROM,
        to:[TO],
        reply_to:d.email||undefined,
        subject:(d.type||'New appointment request')+' — '+d.name,
        html:brandedEmail(d)
      })
    });
    if(!r.ok){var t=await r.text();res.statusCode=502;return res.end(JSON.stringify({success:false,error:'Email send failed: '+t.slice(0,180)}));}
    res.statusCode=200;return res.end(JSON.stringify({success:true}));
  }catch(err){
    res.statusCode=500;return res.end(JSON.stringify({success:false,error:String(err&&err.message||err)}));
  }
};

if(typeof module!=="undefined"){module.exports.brandedEmail=brandedEmail;}
