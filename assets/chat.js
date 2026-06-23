(function(){
  var fab=document.createElement('button');fab.className='chat-fab';fab.setAttribute('aria-label','Ask a question');
  fab.innerHTML='<svg viewBox="0 0 24 24" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 01-9 8.4L3 21l1.1-9A8.4 8.4 0 1121 11.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var panel=document.createElement('div');panel.className='chat-panel';
  panel.innerHTML=''
   +'<div class="chat-head"><div class="ava">U</div><div><b>Uprite Assistant</b><span>Answers in seconds &middot; not medical advice</span></div><button class="x" aria-label="Close">&times;</button></div>'
   +'<div class="chat-body" id="chatBody"></div>'
   +'<div class="chat-chips" id="chatChips"></div>'
   +'<form class="chat-input" id="chatForm"><input id="chatText" placeholder="Ask a question…" autocomplete="off"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>';
  document.body.appendChild(fab);document.body.appendChild(panel);
  var body=panel.querySelector('#chatBody'),chips=panel.querySelector('#chatChips'),form=panel.querySelector('#chatForm'),text=panel.querySelector('#chatText');
  function open(){panel.classList.add('open');if(!body.children.length)greet();setTimeout(()=>text.focus(),300);}
  function close(){panel.classList.remove('open');}
  fab.addEventListener('click',()=>panel.classList.contains('open')?close():open());
  panel.querySelector('.x').addEventListener('click',close);
  function add(t,who){var d=document.createElement('div');d.className='chat-msg '+who;d.innerHTML=t;body.appendChild(d);body.scrollTop=body.scrollHeight;return d;}
  function botSay(t){setTimeout(()=>add(t,'bot'),260);}

  // ---- clinic data ----
  var PH='(201) 849-1000', TEL='tel:+12018491000';
  var HOURS='Mon&ndash;Wed 9:00 AM&ndash;5:00 PM &middot; Thu 9:00 AM&ndash;4:00 PM &middot; Fri 10:00 AM&ndash;3:00 PM';
  var BRANCHES={
    totowa:{n:'Totowa',d:'Northern NJ flagship office',a:'825 Riverview Dr, Floor 1, Totowa, NJ 07512'},
    hazlet:{n:'Hazlet',d:'Serving Monmouth County',a:'1270 NJ-35, Suite 1, Middletown Twp, NJ 07748'}
  };
  var DISC='<span class="chat-note">General information only &mdash; not a medical diagnosis or treatment advice. Please don’t share sensitive personal or health details here.</span>';
  function actBtns(){return '<div class="chat-act"><a class="cbtn" href="'+TEL+'">Call '+PH+'</a><a class="cbtn ghost" href="contact.html">Request online</a></div>';}

  // page topic (detail pages)
  var h1=document.querySelector('.page-hero h1,h1');var sum=document.querySelector('.page-hero .sum');
  var topic=h1?h1.textContent.trim():''; var topicSum=sum?sum.textContent.trim():'';
  var isDetail=/condition-|procedure-/.test(location.pathname);

  function setChips(arr){chips.innerHTML='';arr.forEach(function(c){var b=document.createElement('button');b.textContent=c;b.addEventListener('click',function(){handle(c);});chips.appendChild(b);});}

  function greet(){
    add('Hi, I’m the Uprite assistant. I can help you <b>book an appointment</b>, check insurance, find a location, or learn about our doctors and treatments.<br>'+DISC,'bot');
    var base=['Book an appointment','Insurance','Locations & hours','Pain evaluation'];
    if(isDetail&&topic)base.unshift('About '+topic);
    setChips(base);
  }

  // ---- booking flow ----
  function startBooking(){
    botSay('Happy to help you book. We have <b>two New Jersey offices</b> &mdash; which one is most convenient? Pick a location below and I’ll show you how to book there.');
    setChips(['Totowa','Hazlet','Not sure — just call me']);
  }
  function branchCard(key){
    var b=BRANCHES[key];
    botSay('<b>'+b.n+'</b> &mdash; '+b.d+'.<br><span class="chat-sub">'+b.a+'</span><br><span class="chat-sub">Hours: '+HOURS+'</span><br><br>To book at <b>'+b.n+'</b>, call us or send a request and our front desk will confirm your time:'+actBtns());
    setChips(['Pick another office','Insurance','Pain evaluation']);
  }

  // ---- compliance: questions we should not answer as medical advice ----
  var ADVICE=['should i','do i have','is it serious','what’s wrong','whats wrong','what is wrong','diagnose','diagnosis','is this','am i','prescribe','prescription','dosage','dose','medication for','treat my','cure','what should i take','is it normal'];
  var REDFLAG=['emergency','911','can’t move','cant move','cannot move','bladder','bowel','saddle','numbness spreading','sudden weakness','chest pain','trouble breathing','slurred','face droop','stroke'];

  var KB=[
    {k:['insurance','cost','price','pay','coverage','copay','bill'],a:'We work with most major insurance plans. For exact coverage and out-of-pocket costs, call <a href="'+TEL+'">'+PH+'</a> and our team will verify your benefits before your visit.'},
    {k:['location','where','office','address','open','time','hour'],a:'We have two NJ offices &mdash; <b>Totowa and Hazlet</b>. Hours: '+HOURS+'. See <a href="locations.html">Locations</a> for maps and directions.'},
    {k:['pain','evaluation','assessment','quiz'],a:'Our <a href="#" data-eval>Free Pain Evaluation</a> asks a few quick questions and gives a personalized recommendation plus a PDF summary you can bring to your visit. '+DISC},
    {k:['recovery','recover','downtime','heal','back to work'],a:'Because our procedures are minimally invasive, most patients have shorter recovery and a faster return to daily life than with traditional surgery. Your specialist will give guidance specific to you.'},
    {k:['doctor','surgeon','who','tawfik','elder','team','provider'],a:'<b>Dr. Tamir Tawfik, MD</b> is our board-certified neurosurgeon (spine), and <b>Dr. Bader Elder, DO</b> is our endovascular (vein) expert. Meet them on the <a href="doctors.html">Doctors</a> page.'},
    {k:['mri','second opinion','scan','review','records'],a:'Already have a diagnosis or MRI? We offer an MRI review &mdash; our team will discuss your options. Call <a href="'+TEL+'">'+PH+'</a> or use <a href="contact.html">Contact</a>.'},
    {k:['phone','call','contact','email','reach','fax'],a:'Call <a href="'+TEL+'">'+PH+'</a> (Fax 551-340-4607) or email <a href="mailto:frontdesk@upritemedical.com">frontdesk@upritemedical.com</a>.'},
    {k:['spine','back','disc','sciatica','stenosis','neck','herniat'],a:'We treat the full range of spine and nerve conditions &mdash; herniated discs, stenosis, sciatica and more. Explore <a href="conditions.html">Conditions</a> and <a href="procedures.html">Procedures</a>, or book a consultation to discuss your case.'},
    {k:['vein','varicose','spider','leg','swelling','venous'],a:'Our endovascular team treats varicose &amp; spider veins, leg swelling and venous insufficiency with quick in-office procedures. See <a href="conditions.html">Conditions</a>.'}
  ];

  function handle(q){
    add(q,'me');var s=q.toLowerCase();

    // 1) emergency / red flags first
    if(REDFLAG.some(function(w){return s.indexOf(w)>=0;})){
      botSay('If this is a medical emergency &mdash; such as loss of bladder or bowel control, saddle numbness, sudden or spreading weakness, chest pain or stroke symptoms &mdash; <b>please call 911 or go to the nearest ER now</b>. For non-emergencies, our team is at <a href="'+TEL+'">'+PH+'</a>.');
      return;
    }
    // 2) branch pick
    var bkey=Object.keys(BRANCHES).find(function(k){return s.indexOf(k)>=0;});
    if(bkey){branchCard(bkey);return;}
    // 3) booking intent
    if(/(book|appointment|schedule|consult|booking|another office|reserve|visit)/.test(s)){startBooking();return;}
    if(s.indexOf('just call me')>=0||s.indexOf('not sure')>=0){botSay('No problem &mdash; call <a href="'+TEL+'">'+PH+'</a> and our front desk will find the office and time that work best for you.'+actBtns());afterChips();return;}
    if(s.indexOf('person')>=0||s.indexOf('human')>=0||s.indexOf('talk to')>=0){botSay('Our team is happy to help &mdash; call <a href="'+TEL+'">'+PH+'</a> or use the <a href="contact.html">Contact</a> form and we’ll reach out.');afterChips();return;}
    // 4) detail-page topic
    if(isDetail&&topic&&s.indexOf('about')>=0){botSay((topicSum||('Learn more about '+topic+'.'))+'<br><br>To discuss '+topic+' with a specialist, book a consultation below.'+actBtns()+DISC);afterChips();return;}
    // 5) compliance: don't give diagnosis / personal medical advice
    if(ADVICE.some(function(w){return s.indexOf(w)>=0;})){
      botSay('I’m not able to give a diagnosis or personal medical advice &mdash; that needs a licensed Uprite specialist who can review your history. The best next step is a quick evaluation. I can help you book one now.'+actBtns()+DISC);
      setChips(['Book an appointment','Free Pain Evaluation','Locations & hours']);
      return;
    }
    // 6) knowledge base
    var hit=KB.find(function(e){return e.k.some(function(w){return s.indexOf(w)>=0;});});
    botSay(hit?hit.a:'I can help with <b>booking</b>, insurance, locations, our doctors and treatments. For anything specific, call <a href="'+TEL+'">'+PH+'</a> or <a href="contact.html">contact us</a>.<br>'+DISC);
    afterChips();
  }
  function afterChips(){setChips(['Book an appointment','Insurance','Locations & hours','Talk to a person']);}

  form.addEventListener('submit',function(e){e.preventDefault();var v=text.value.trim();if(!v)return;text.value='';handle(v);});
})();
