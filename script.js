/* Our Little Date — GitHub Pages + Formspree. No credentials or secret API keys. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaeebzvo';
const STORAGE_KEY = 'our-little-date-forms-v1';
const $ = id => document.getElementById(id);
const MESSAGES = [
  'Чамайг санаад байна.',
  'Хэзээ нэг өдөр home date хийе. 🏠',
  'Чамтай өнгөрөөх секунд бүхэн гоё. ♡',
  'Чамтай юу ч хийхгүй суусан ч гоё.',
  'Нэг оройг хоёулаа хамтдаа өнгөрүүлье. 🤍'
];
const ACTIVITIES = {
  movie:'Кино үзэх', food:'Хамт амттай юм идэх',
  talk:'Зүгээр л ярилцах', all:'Бүгдэнг нь хийе'
};
const MOVIES = {
  'Fall 2':'Уулын нурангид өртсөний улмаас 3000 гаруй футын өндөрт, нимгэн банзан дээр гацаж орхигдсон хоёр эмэгтэй амьд гарахын төлөөх цөхрөлтгүй тэмцэл.',
  'Clayface':'Готамын гудамжны хүүхдээс Холливудын жүжигчин болсон Мэтт Хаген нүүр царайгаа алдсаны дараа дэвшилтэт эмчилгээ хийлгэдэг. Гэвч эмчилгээ түүнийг өшөө авалтын зам руу хөтөлнө.',
  'Incantation':'Зургаан жилийн өмнө Ли Ронан шашны цээрлэлийг зөрчиж хараалд өртсөн. Одоо тэрээр охиноо тэр хараалаас хамгаалах ёстой.',
  'A Moment to Remember':'Су Жин альцгеймерийн өвчний эхэн үеийн оноштой болсноор тэдний хайр дурлал, гэрлэлт хүнд сорилттой тулгардаг.',
  'Us and Them (2018)':'Галт тэргэнд танилцсан хоёр хүн олон жилийн турш дотно холбоотой байдаг. Салж хагацсаны эцэст дахин уулзахдаа өнгөрсөн хайр сэтгэлээ эргэцүүлнэ.',
  'Even If This Love Disappears From the World Tonight':'Унтах бүрдээ шинэ дурсамжаа алддаг охин, түүнтэй үерхдэг хүү хоёрын хайрын түүх.'
};
const WEEKDAYS = ['Ням','Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба'];
function todayInMongolia(){
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const m = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return new Date(Date.UTC(+m.year,+m.month-1,+m.day));
}
const TODAY=todayInMongolia();
const FIRST_MONTH=new Date(Date.UTC(TODAY.getUTCFullYear(),TODAY.getUTCMonth(),1));
const LAST_MONTH=new Date(Date.UTC(TODAY.getUTCFullYear(),TODAY.getUTCMonth()+11,1));
let currentMonth=new Date(FIRST_MONTH);
let date=null, dateUnknown=false, activity='movie', time='20:00', movies=[], activeMovie=null, ownMovieChecked=false, msgIndex=0, toastTimer;
const dateKey=d=>`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
const parseDate=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));};
const monthId=d=>d.getUTCFullYear()*12+d.getUTCMonth();
const formatDate=s=>{const d=parseDate(s);return `${d.getUTCFullYear()} оны ${d.getUTCMonth()+1}-р сарын ${d.getUTCDate()} (${WEEKDAYS[d.getUTCDay()]})`;};
const needsMovie=()=>activity==='movie'||activity==='all';
const TIME_CHOICES=Array.from({length:9},(_,i)=>`${String(18+Math.floor(i/2)).padStart(2,'0')}:${i%2?'30':'00'}`);
const timeInJapan=t=>{const [h,m]=t.split(':').map(Number);return `${String((h+1)%24).padStart(2,'0')}:${String(m).padStart(2,'0')}`;};
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({date,dateUnknown,activity,time,movies,ownMovieChecked,ownMovie:$('ownMovie').value,note:$('note').value}));}catch(e){}}
function load(){
  try{
    const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    if(typeof d.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)){
      const parsed=parseDate(d.date);
      const lastDay=new Date(Date.UTC(LAST_MONTH.getUTCFullYear(),LAST_MONTH.getUTCMonth()+1,1));
      if(dateKey(parsed)===d.date&&parsed>=TODAY&&parsed<lastDay)date=d.date;
    }
    dateUnknown=d.dateUnknown===true;
    if(dateUnknown)date=null;
    if(Object.hasOwn(ACTIVITIES,d.activity))activity=d.activity;
    if([...TIME_CHOICES,'unknown'].includes(d.time))time=d.time;
    // Migrate older single-movie drafts without carrying over removed movies.
    if(Array.isArray(d.movies))movies=[...new Set(d.movies.filter(name=>Object.hasOwn(MOVIES,name)))];
    else if(Object.hasOwn(MOVIES,d.movie))movies=[d.movie];
    activeMovie=movies.at(-1)||null;
    ownMovieChecked=d.ownMovieChecked===true;
    if(typeof d.ownMovie==='string')$('ownMovie').value=d.ownMovie.slice(0,120);
    if(typeof d.note==='string')$('note').value=d.note.slice(0,350);
  }catch(e){}
}
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
function renderCalendar(){
  const y=currentMonth.getUTCFullYear(),m=currentMonth.getUTCMonth();
  $('monthLabel').textContent=`${y} оны ${m+1}-р сар`;
  $('prevMonth').disabled=monthId(currentMonth)<=monthId(FIRST_MONTH);
  $('nextMonth').disabled=monthId(currentMonth)>=monthId(LAST_MONTH);
  $('chooseLater').checked=dateUnknown;
  const root=$('calendarDays');root.replaceChildren();
  const empty=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7;
  for(let i=0;i<empty;i++)root.appendChild(document.createElement('span'));
  const days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  for(let i=1;i<=days;i++){
    const d=new Date(Date.UTC(y,m,i)),key=dateKey(d),b=document.createElement('button');
    b.type='button';b.className=`day${date===key?' selected':''}${dateKey(TODAY)===key?' today':''}`;
    b.textContent=String(i);b.disabled=d<TODAY||dateUnknown;
    b.setAttribute('aria-pressed',String(date===key));
    b.setAttribute('aria-label',formatDate(key)+(date===key?', сонгосон':''));
    b.addEventListener('click',()=>{date=date===key?null:key;$('error').textContent='';save();renderCalendar();});
    root.appendChild(b);
  }
}
function renderChoices(container,attr,value){
  $(container).querySelectorAll('button').forEach(b=>{
    const selected=b.dataset[attr]===value;
    b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));
  });
}
function renderMovie(){
  $('movieSection').hidden=!needsMovie();
  $('ownMovieCheck').checked=ownMovieChecked;
  $('ownMovieGroup').hidden=!ownMovieChecked;
  // Each poster has a real checkbox; multiple choices can stay selected.
  $('movieScroll').querySelectorAll('input[data-movie]').forEach(input=>{
    const selected=movies.includes(input.dataset.movie)&&!ownMovieChecked;
    input.checked=selected;
    input.closest('.movie-card').classList.toggle('selected',selected);
  });
  if(!movies.includes(activeMovie))activeMovie=movies.at(-1)||null;
  $('movieDescription').hidden=!activeMovie||ownMovieChecked;
  if(activeMovie){$('movieName').textContent=activeMovie;$('moviePlot').textContent=MOVIES[activeMovie];}
}
function render(){
  renderCalendar();renderChoices('activityChoices','activity',activity);
  renderChoices('timeChoices','time',time);renderMovie();
  $('timeHint').textContent=time==='unknown'?'Цагаа дараа нь тохиръё':`Японд ${timeInJapan(time)} болно`;
}
function validate(){
  if(!date&&!dateUnknown){$('error').textContent='Боломжтой өдрөө сонгоорой, эсвэл мэдэхгүй гэдгээ тэмдэглээрэй ♡';$('calendarTitle').scrollIntoView({behavior:'smooth',block:'center'});return false;}
  if(needsMovie()&&!ownMovieChecked&&!movies.length){$('error').textContent='Үзэх киногоо сонгоорой ♡';$('movieTitle').scrollIntoView({behavior:'smooth',block:'center'});return false;}
  if(needsMovie()&&ownMovieChecked&&!$('ownMovie').value.trim()){$('error').textContent='Үзмээр байгаа киноныхоо нэрийг бичээрэй ♡';$('ownMovie').focus();return false;}
  $('error').textContent='';return true;
}
async function submitReply(event){
  event.preventDefault();if(!validate())return;
  const button=$('sendButton'),label=$('sendLabel');
  const fields={
    '_subject':'💌 Болзооны хариу — Сайхнаа',
    'Болзох өдөр':dateUnknown?'Одоохондоо хэлж мэдэхгүй байна':formatDate(date),
    'Монголын цаг':time==='unknown'?'Одоохондоо хэлж мэдэхгүй байна':time,
    'Японы цаг':time==='unknown'?'Одоохондоо хэлж мэдэхгүй байна':timeInJapan(time),
    'Хийх зүйл':ACTIVITIES[activity],
    'Кино':!needsMovie()?'Кино үзэхгүй':(ownMovieChecked?'Өөрийн санал болгосон кино':movies.join(', ')),
    'Санал болгосон кино':needsMovie()&&ownMovieChecked?$('ownMovie').value.trim():'',
    'Нэмэлт зурвас':$('note').value.trim()||'—'
  };
  const form=new FormData();Object.entries(fields).forEach(([key,val])=>form.append(key,val));
  button.disabled=true;label.textContent='Илгээж байна...';
  try{
    const response=await fetch(FORMSPREE_ENDPOINT,{
      method:'POST',body:form,headers:{Accept:'application/json'}
    });
    if(!response.ok){
      let detail='';try{const body=await response.json();detail=body?.errors?.[0]?.message||'';}catch(e){}
      throw Error(detail||`HTTP ${response.status}`);
    }
    $('dateForm').hidden=true;$('success').hidden=false;
    $('error').textContent='';
    // Keep draft only until a successful submission; do not resend automatically.
    try{localStorage.removeItem(STORAGE_KEY);}catch(e){}
    $('success').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(e){
    $('error').textContent=`Илгээж чадсангүй. Интернэтээ шалгаад дахин оролдоорой. (${e.message})`;
    $('error').scrollIntoView({behavior:'smooth',block:'center'});
  }finally{button.disabled=false;label.textContent='Илгээх 💌';}
}
function wire(){
  load();render();
  $('heartButton').addEventListener('click',()=>{msgIndex=(msgIndex+1)%MESSAGES.length;$('secret').textContent=MESSAGES[msgIndex];});
  $('prevMonth').addEventListener('click',()=>{currentMonth=new Date(Date.UTC(currentMonth.getUTCFullYear(),currentMonth.getUTCMonth()-1,1));renderCalendar();});
  $('nextMonth').addEventListener('click',()=>{currentMonth=new Date(Date.UTC(currentMonth.getUTCFullYear(),currentMonth.getUTCMonth()+1,1));renderCalendar();});
  $('chooseLater').addEventListener('change',e=>{dateUnknown=e.target.checked;if(dateUnknown)date=null;renderCalendar();save();});
  $('activityChoices').addEventListener('click',e=>{const b=e.target.closest('[data-activity]');if(!b)return;activity=b.dataset.activity;render();save();});
  $('timeChoices').addEventListener('click',e=>{const b=e.target.closest('[data-time]');if(!b)return;time=b.dataset.time;render();save();});
  $('movieScroll').addEventListener('change',e=>{
    const input=e.target.closest('input[data-movie]');if(!input)return;
    const name=input.dataset.movie;
    if(input.checked){
      if(!movies.includes(name))movies.push(name);
      activeMovie=name;
      ownMovieChecked=false;
    }else{
      movies=movies.filter(item=>item!==name);
      if(activeMovie===name)activeMovie=movies.at(-1)||null;
    }
    $('error').textContent='';renderMovie();save();
  });
  $('ownMovieCheck').addEventListener('change',e=>{
    ownMovieChecked=e.target.checked;
    if(ownMovieChecked){movies=[];activeMovie=null;}
    renderMovie();save();
    if(ownMovieChecked)$('ownMovie').focus();
  });
  $('ownMovie').addEventListener('input',save);
  $('note').addEventListener('input',save);
  $('dateForm').addEventListener('submit',submitReply);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
