// Vercel/Netlify-style serverless function: emails contact-form leads to the front desk
// as a branded HTML email. Configure these environment variables on your host:
//   RESEND_API_KEY   (required)  your Resend API key  -> https://resend.com
//   LEAD_TO          (optional)  recipient, default frontdesk@upritemedical.com
//   LEAD_FROM        (optional)  verified sender, default "Uprite Website <noreply@upritemedical.com>"
//
// The sending domain must be verified in Resend before email will deliver.

const TO   = process.env.LEAD_TO   || 'frontdesk@upritemedical.com';
const FROM = process.env.LEAD_FROM || 'Uprite Website <noreply@upritemedical.com>';

function esc(s){return String(s||'').replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}

function brandedEmail(d){
  var when=new Date().toLocaleString('en-US',{timeZone:'America/New_York',dateStyle:'medium',timeStyle:'short'});
  function row(label,val){return val?'<tr><td style="padding:10px 0;border-bottom:1px solid #edf0f5;color:#6a7384;font:600 12px/1.2 Arial,sans-serif;width:140px;vertical-align:top">'+label+'</td><td style="padding:10px 0;border-bottom:1px solid #edf0f5;color:#141821;font:14px/1.5 Arial,sans-serif">'+esc(val)+'</td></tr>':'';}
  return ''+
  '<div style="background:#f4f6fb;padding:28px 0;font-family:Arial,sans-serif">'+
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'+
  '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 14px 40px -18px rgba(10,16,40,.25)">'+
    // header
    '<tr><td style="background:#071335;padding:22px 28px">'+
      '<div style="font:700 19px/1 Arial,sans-serif;color:#ffffff;letter-spacing:.5px">UPRITE MEDICAL</div>'+
      '<div style="font:12px/1.4 Arial,sans-serif;color:#b0c4e6;margin-top:5px">Spine, Orthopedic &amp; Neuroscience Center</div>'+
    '</td></tr>'+
    '<tr><td style="height:4px;background:#1747e6"></td></tr>'+
    // body
    '<tr><td style="padding:26px 28px 8px">'+
      '<div style="font:700 16px/1.3 Arial,sans-serif;color:#141821">New appointment request</div>'+
      '<div style="font:13px/1.5 Arial,sans-serif;color:#6a7384;margin-top:4px">Submitted '+esc(when)+' (ET)</div>'+
    '</td></tr>'+
    '<tr><td style="padding:8px 28px 6px">'+
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'+
        row('Name',d.name)+row('Phone',d.phone)+row('Email',d.email)+row('Message',d.message)+row('From page',d.page)+
      '</table>'+
    '</td></tr>'+
    // CTA
    '<tr><td style="padding:18px 28px 26px">'+
      (d.phone?'<a href="tel:'+esc(String(d.phone).replace(/[^0-9+]/g,''))+'" style="display:inline-block;background:#1747e6;color:#ffffff;text-decoration:none;font:600 14px/1 Arial,sans-serif;padding:12px 20px;border-radius:999px">Call patient back</a>':'')+
    '</td></tr>'+
    // footer
    '<tr><td style="background:#f7f9fc;padding:16px 28px;border-top:1px solid #edf0f5">'+
      '<div style="font:11px/1.6 Arial,sans-serif;color:#8a93a6">Uprite Medical &middot; (201) 849-1000 &middot; Totowa &amp; Hazlet, NJ<br>This lead was sent from the website contact form. Reply to the patient by phone or email above.</div>'+
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
        subject:'New appointment request — '+d.name,
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
