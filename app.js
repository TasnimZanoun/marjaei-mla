// مرجعي — Educational MLA 9 citation generator. User-provided metadata only.
"use strict";
const types = {
 book:{label:"كتاب",fields:["author","title","contributors","edition","publisher","year","page"]},
 chapter:{label:"فصل في كتاب محرر",fields:["author","title","container","editor","publisher","year","pages","page"]},
 journal:{label:"مقال في مجلة علمية",fields:["author","title","container","volume","issue","year","pages","doi","url","page"]},
 website:{label:"صفحة في موقع إلكتروني",fields:["author","title","container","publisher","date","url","accessed"]},
 report:{label:"تقرير أو وثيقة رسمية",fields:["author","title","publisher","year","url","page"]},
 thesis:{label:"رسالة ماجستير أو أطروحة دكتوراه",fields:["author","title","year","university","thesisType","container","url","page"]},
 news:{label:"مقال صحفي",fields:["author","title","container","date","pages","url","page"]},
 video:{label:"فيديو أو مقطع يوتيوب",fields:["author","title","container","uploader","date","url","timestamp"]},
 interview:{label:"مقابلة شخصية",fields:["author","title","interviewer","date"]},
 image:{label:"صورة أو عمل فني",fields:["author","title","year","container","publisher","url"]},
 webpage:{label:"منشور أو مادة إلكترونية",fields:["author","title","container","date","url","accessed"]},
 presentation:{label:"محاضرة أو عرض تقديمي",fields:["author","title","date","event","institution","url"]},
 translation:{label:"كتاب مترجم",fields:["author","title","translator","publisher","year","page"]}
};
const descriptions = {
 author:["اسم المؤلف أو الجهة","اكتب اسم المؤلف كما يظهر في المصدر؛ افصل بين المؤلفين بعلامة ;","full"],
 authorKind:["نوع المؤلف","اختر شخصا أو جهة مؤسسية."],
 surname:["اسم العائلة (اختياري للتدقيق)","مثل: الزغول. مهم للأسماء المركبة، ويترك فارغا عند توثيق جهة أو مؤسسة."],
 title:["عنوان المصدر","أدخل عنوانا دقيقا كما ورد في الأصل","full"],
 container:["عنوان المجلة / الكتاب / الموقع / المنصة","اسم العمل الذي يضم المصدر","full"],
 contributors:["مساهمون آخرون (اختياري)","مثال: Edited by Sara Ali"],
 editor:["اسم المحرر أو المحررين","مثال: Sara Ali; Omar Saleh"],
 translator:["المترجم","اسم المترجم أو أسماء المترجمين"],
 edition:["الطبعة (إن لم تكن الأولى)","مثال: 2 أو الطبعة الثانية. عادة تحذف الطبعة الأولى."],
 publisher:["الناشر","الجهة الناشرة إن كانت مختلفة عن المؤلف أو الموقع"],
 year:["سنة النشر","مثال: 2023"],
 date:["تاريخ النشر الكامل","مثال: 12 May 2023 أو 12 أيار 2023"],
 volume:["المجلد","مثال: 15"],
 issue:["العدد","مثال: 2"],
 pages:["نطاق الصفحات في المصدر","مثال: 45-62"],
 page:["رقم الصفحة المستشهد بها داخل المتن","مثال: 48، وليس نطاق صفحات المقال"],
 doi:["DOI","مثال: 10.1000/xyz أو https://doi.org/10.1000/xyz","full"],
 url:["رابط المصدر","الرابط المباشر للمصدر","full"],
 accessed:["تاريخ الاطلاع (اختياري)","مثال: 31 Oct. 2026"],
 university:["الجامعة","اسم الجامعة المانحة للدرجة"],
 thesisType:["نوع الرسالة","مثال: MA thesis أو PhD dissertation"],
 uploader:["القناة أو الحساب الرافع","إن اختلف عن المؤلف"],
 timestamp:["التوقيت داخل الفيديو","مثال: 01:24"],
 interviewer:["اسم المحاور (إن وجد)","مثال: Sara Ali"],
 event:["اسم الفعالية أو المحاضرة","إن وجد"],
 institution:["المؤسسة أو موقع الفعالية","إن وجد"]
};
const $=id=>document.getElementById(id);
let last=null, toastTimer;
const arabic=s=>/[\u0600-\u06ff]/.test(s||"");
function esc(s){return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function plain(s){return String(s||"").trim().replace(/\s+/g," ");}
function parts(s){return plain(s).split(";").map(x=>x.trim()).filter(Boolean);}
function westernAuthor(name,reverse){if(arabic(name)||name.includes(",")||!reverse)return name;const p=name.trim().split(/\\s+/);return p.length>1?p.slice(-1)[0]+", "+p.slice(0,-1).join(" "):name;}
function familyName(name,explicit){if(explicit)return plain(explicit);if(name.includes("،"))return name.split("،")[0].trim();if(name.includes(","))return name.split(",")[0].trim();const words=plain(name).split(/\\s+/);return words.length>1?words[words.length-1]:name;}
function invertAuthor(name,kind,explicit){name=plain(name);if(kind==="organization")return name;if(!arabic(name))return westernAuthor(name,true);if(name.includes("،")||name.includes(","))return name;const family=familyName(name,explicit);if(!family||family===name)return name;const pos=name.lastIndexOf(family);if(pos<1)return name;const given=(name.slice(0,pos)+name.slice(pos+family.length)).trim();return given?family+"، "+given:name;}
function authorWorks(raw,kind,explicit){const a=parts(raw);if(!a.length)return "";if(kind==="organization")return a[0];if(a.length===1)return invertAuthor(a[0],kind,explicit);if(a.length===2)return invertAuthor(a[0],kind,explicit)+(arabic(raw)?"، و":" and ")+a[1];return invertAuthor(a[0],kind,explicit)+", et al.";}
function authorText(raw,kind,explicit){const a=parts(raw);if(!a.length)return "";if(kind==="organization")return a[0];if(a.length===1)return familyName(a[0],explicit);if(a.length===2)return familyName(a[0],explicit)+(arabic(raw)?" و":" and ")+familyName(a[1]);return familyName(a[0],explicit)+" et al.";}
function editionValue(raw,isArabic){const e=plain(raw);if(!e)return "";const digits=e.replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-1632));const m=digits.match(/^(?:الطبعة\\s*)?(\\d+)$/);if(!m)return e;const n=Number(m[1]);if(n===1)return "";const words={2:"الثانية",3:"الثالثة",4:"الرابعة",5:"الخامسة",6:"السادسة",7:"السابعة",8:"الثامنة",9:"التاسعة",10:"العاشرة"};if(isArabic)return "الطبعة "+(words[n]||n);const suffix=n%100>=11&&n%100<=13?"th":n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th";return n+suffix+" ed.";}
function titleCase(s){return plain(s);}
function ital(s){return "<em>"+esc(s)+"</em>";}
function quote(s){const q=plain(s);return "“"+esc(/[.!?؟]$/.test(q)?q:q+".")+"”";}
function punct(s){return /[.!؟]$/.test(s)?s:s+".";}
function doiLink(s){let d=plain(s).replace(/^doi:\s*/i,"").replace(/^https?:\/\/(dx\.)?doi\.org\//i,"");return d?"https://doi.org/"+d:"";}
function normalUrl(s){let u=plain(s);if(!u)return "";return u.replace(/^https?:\/\//i,"");}
function pages(s){s=plain(s);if(!s)return "";return /^pp?\.?\s/i.test(s)?s:(s.includes("-")||s.includes("–")?"pp. ":"p. ")+s;}
function cap(s){return s? s.charAt(0).toUpperCase()+s.slice(1):s;}
function segments(a){return a.filter(Boolean).join(", ")+ (a.filter(Boolean).length?".":"");}
function build(d,t){
 const w=[],author=authorWorks(d.author,d.authorKind,d.surname),heading=d.title||d.container||"";
 if(!heading)return {error:"أدخل عنوان المصدر أولا."};
 const n=d.title?d.title:d.container;
 const independent=["book","report","thesis","image","translation"].includes(t);
 const titleMarkup=independent?ital(n):quote(n);
 const embeddedPage=["journal","chapter","news"].includes(t)?pages(d.pages):"";
 const location=doiLink(d.doi)||normalUrl(d.url);
 const publication=d.date||d.year;
 if(d.authorKind!=="organization"&&arabic(d.author)&&parts(d.author).length===1&&plain(d.author).split(/\\s+/).length>1&&!d.surname)w.push("تم تقدير اسم العائلة من الكلمة الأخيرة؛ راجعه، خاصة إذا كان اسم العائلة مركبا.");
 if(d.authorKind==="organization"&&parts(d.author).length>1)w.push("الجهة المؤسسية يجب إدخالها كاسم واحد دون فصل مؤلفين بعلامة ;.");
 if(d.edition&&/^1$|^١$|^الطبعة\\s*(الأولى|1|١)$/.test(plain(d.edition)))w.push("حذفت الطبعة الأولى من المرجع لأنها لا تذكر عادة في MLA؛ تحقق من وجود إصدار مميز.");
 if(d.publisher&&/^(أمازون|amazon(?:\\.com)?|google books|كتب جوجل)$/i.test(plain(d.publisher)))w.push("قد تكون هذه منصة بيع أو توزيع وليست الناشر الفعلي. راجع صفحة العنوان أو حقوق النشر قبل اعتماد المرجع.");
 let arr=[];
 if(author)arr.push(esc(author));
 else w.push("لم تدخل مؤلفا؛ سيبدأ المرجع بالعنوان. تأكد أن المصدر لا يذكر مؤلفا أو جهة مسؤولة.");
 if(t==="book"||t==="translation"){
   arr.push(titleMarkup);
   if(t==="translation"&&d.translator)arr.push("Translated by "+esc(parts(d.translator).join(" and ")));
   if(d.contributors)arr.push(esc(d.contributors));
   if(d.edition&&editionValue(d.edition,arabic(d.title)))arr.push(esc(editionValue(d.edition,arabic(d.title))));
   if(d.publisher)arr.push(esc(d.publisher));else w.push("راجع اسم الناشر في صفحة بيانات الكتاب.");
   if(d.year)arr.push(esc(d.year));else w.push("لم تدخل سنة النشر.");
 } else if(t==="chapter"){
   arr.push(quote(d.title));
   if(d.container)arr.push(ital(d.container));else w.push("أدخل عنوان الكتاب الذي ورد فيه الفصل.");
   if(d.editor)arr.push("edited by "+esc(parts(d.editor).join(" and ")));
   if(d.publisher)arr.push(esc(d.publisher));
   if(d.year)arr.push(esc(d.year));
   if(embeddedPage)arr.push(esc(embeddedPage));
 } else if(t==="journal"){
   arr.push(quote(d.title));
   if(d.container)arr.push(ital(d.container));else w.push("أدخل اسم المجلة.");
   if(d.volume)arr.push("vol. "+esc(d.volume));
   if(d.issue)arr.push("no. "+esc(d.issue));
   if(d.year)arr.push(esc(d.year));else w.push("راجع سنة نشر المقال.");
   if(embeddedPage)arr.push(esc(embeddedPage));
   if(location)arr.push(esc(location));
 } else if(t==="website"||t==="webpage"||t==="news"){
   arr.push(quote(d.title));
   if(d.container)arr.push(ital(d.container));else w.push("تحقق من اسم الموقع أو الصحيفة.");
   if(d.publisher&&plain(d.publisher)!==plain(d.container))arr.push(esc(d.publisher));
   if(publication)arr.push(esc(publication));else w.push("لم تدخل تاريخا؛ راجع إن كان متاحا.");
   if(embeddedPage)arr.push(esc(embeddedPage));
   if(location)arr.push(esc(location));else w.push("يفضل إدخال الرابط المباشر للمادة الإلكترونية.");
   if(d.accessed)arr.push("Accessed "+esc(d.accessed));
 } else if(t==="report"){
   arr.push(ital(d.title));
   if(d.publisher&&plain(d.publisher)!==plain(d.author))arr.push(esc(d.publisher));
   if(publication)arr.push(esc(publication));
   if(location)arr.push(esc(location));
 } else if(t==="thesis"){
   arr.push(ital(d.title));
   if(d.year)arr.push(esc(d.year));
   if(d.university)arr.push(esc(d.university));
   if(d.thesisType)arr.push(esc(d.thesisType));
   if(d.container)arr.push(ital(d.container));
   if(location)arr.push(esc(location));
   if(!d.university)w.push("تحقق من الجامعة المانحة للدرجة.");
 } else if(t==="video"){
   arr.push(quote(d.title));
   if(d.container)arr.push(ital(d.container));else arr.push(ital("YouTube"));
   if(d.uploader)arr.push("uploaded by "+esc(d.uploader));
   if(d.date)arr.push(esc(d.date));
   if(location)arr.push(esc(location));
 } else if(t==="interview"){
   arr.push(quote(d.title));
   if(d.interviewer)arr.push("Interview by "+esc(d.interviewer));
   if(d.date)arr.push(esc(d.date));
   w.push("المقابلات غير المنشورة تختلف عن المقابلات المنشورة؛ تحقق من طبيعة المصدر.");
 } else if(t==="image"){
   arr.push(ital(d.title));
   if(d.year)arr.push(esc(d.year));
   if(d.publisher)arr.push(esc(d.publisher));
   if(d.container)arr.push(ital(d.container));
   if(location)arr.push(esc(location));
 } else if(t==="presentation"){
   arr.push(quote(d.title));
   if(d.date)arr.push(esc(d.date));
   if(d.event)arr.push(esc(d.event));
   if(d.institution)arr.push(esc(d.institution));
   if(location)arr.push(esc(location));
   w.push("تختلف صياغة المحاضرات بحسب كونها منشورة أو غير منشورة ونوع المادة.");
 }
 const works=arr.filter(Boolean).join(". ").replace(/\.\s*\./g,".").replace(/\.\s*,/g,","); // final punctuation adjusted below
 let finished=works.replace(/([.!؟])\. /g,"$1 ")+(/[.!؟]$/.test(works)?"":".");
 // A comma should separate core elements in MLA, not a full stop for each field.
 const finalWorks=(author?esc(author)+". ":"")+segments(arr.slice(author?1:0)).replace(/,?\.$/,".");
 // Build a readable MLA-style string with correct boundary after author and title.
 let body=arr.slice(author?1:0);
 let result;
 if(!body.length)result=finished;
 else {
   const first=body.shift();
   const rest=body.filter(Boolean);
   const firstEnds=/[.!؟]$|[.!?؟]”$/.test(first)?first:first+".";
   result=(author?esc(author)+". ":"")+firstEnds+(rest.length?" "+rest.join(", "):"");
   if(!/[.!؟]$|[.!?؟]”$/.test(result))result+=".";
 }
 const key=authorText(d.author,d.authorKind,d.surname)||heading;
 const locator=plain(d.page)||plain(d.timestamp);
 let intext=key;
 if(!author&&d.title){const short=plain(d.title).split(/\s+/).slice(0,5).join(" ");intext=(independent?short:"“"+short+"”");}
 if(locator)intext+=" "+locator;
 else if(["book","translation","chapter","journal","report","thesis","news"].includes(t))w.push("إذا كان الاستشهاد بمقطع ذي رقم صفحة، أدخل رقم الصفحة الفعلي داخل المتن.");
 if(!d.author&&t!=="interview")w.push("عند غياب المؤلف، يبدأ الاستشهاد بالعنوان المختصر الموافق لبداية مدخل القائمة.");
 w.push("راجع الكتابة الكبيرة والصغيرة لعناوين المصادر الإنجليزية؛ لا يغيرها هذا النموذج تلقائيا.");
 return {works:result,intext:"("+intext+")",warnings:[...new Set(w)],explanation:locator?"تم إنشاء الاستشهاد باستخدام اسم المؤلف أو العنوان ورقم الصفحة/الموضع الذي أدخلته.":"في MLA يرتبط الاستشهاد داخل المتن باسم المؤلف أو العنوان إذا غاب المؤلف، ولا يضاف تاريخ النشر تلقائيا."};
}
function stripHtml(s){const e=document.createElement("div");e.innerHTML=s;return e.textContent||"";}
function field(name){if(name==="authorKind")return '<div class="field"><label class="field-label" for="f_authorKind">نوع المؤلف</label><select class="input" id="f_authorKind" name="authorKind"><option value="person">شخص</option><option value="organization">جهة أو مؤسسة</option></select></div>';const [label,hint,full]=descriptions[name];return '<div class="field '+(full==="full"?"full":"")+'"><label class="field-label" for="f_'+name+'">'+esc(label)+'</label><input class="input" id="f_'+name+'" name="'+name+'" autocomplete="off" placeholder="'+esc(hint)+'" '+(["url","doi"].includes(name)?'dir="ltr"':'dir="auto"')+'><div class="help">'+esc(hint)+'</div></div>';}
function renderFields(){const selected=$("sourceType").value;$("dynamicFields").innerHTML=types[selected].fields.flatMap(x=>x==="author"?[field(x),field("authorKind"),field("surname")]:[field(x)]).join("");last=null;$("resultsContent").hidden=true;$("emptyResults").hidden=false;$("resultState").textContent="في انتظار بياناتك";}
function read(){const d={};new FormData($("citationForm")).forEach((v,k)=>d[k]=plain(v));return d;}
function notify(s){$("toast").textContent=s;$("toast").hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").hidden=true,3200);}
function generate(e){if(e)e.preventDefault();const d=read(),t=$("sourceType").value;const result=build(d,t);if(result.error){notify(result.error);return;}last={...result,type:t,data:d,id:Date.now()};$("worksOutput").innerHTML=result.works;$("intextOutput").textContent=result.intext;const rtl=arabic(d.title)||arabic(d.author);for(const el of [$("worksOutput"),$("intextOutput")]){el.style.direction=rtl?"rtl":"ltr";el.style.textAlign=rtl?"right":"left";}$("warningsList").innerHTML=result.warnings.map(x=>"<li>"+esc(x)+"</li>").join("");$("warningsBox").hidden=!result.warnings.length;$("explanation").textContent=result.explanation;$("resultsContent").hidden=false;$("emptyResults").hidden=true;$("resultState").textContent="جاهز للمراجعة";}
async function copy(s){try{await navigator.clipboard.writeText(s);notify("تم نسخ النص بنجاح");}catch(e){const a=document.createElement("textarea");a.value=s;document.body.append(a);a.select();document.execCommand("copy");a.remove();notify("تم نسخ النص");}}
const storeKey="marjaei_mla_library_v1";
function loadLibrary(){try{const v=JSON.parse(localStorage.getItem(storeKey)||"[]");return Array.isArray(v)?v:[];}catch(e){return [];}}
function saveLibrary(a){try{localStorage.setItem(storeKey,JSON.stringify(a));return true;}catch(e){notify("لم يتمكن المتصفح من حفظ المكتبة؛ يرجى النسخ أو التصدير.");return false;}}
function renderLibrary(){const a=loadLibrary();$("libraryCount").textContent=a.length;$("libraryEmpty").hidden=!!a.length;$("libraryItems").innerHTML=a.map((x,i)=>'<article class="library-item"><div class="library-item-content"><strong>'+esc(types[x.type]?.label||"مرجع")+'</strong><p dir="auto">'+(x.works||"")+'</p></div><button type="button" data-index="'+i+'" aria-label="حذف مرجع">حذف</button></article>').join("");}
function sorted(){return loadLibrary().slice().sort((a,b)=>stripHtml(a.works).localeCompare(stripHtml(b.works),arabic(a.works)||arabic(b.works)?"ar":"en"));}
function allRefs(){return sorted().map(x=>stripHtml(x.works)).join("\n\n");}
function exportWord(){const list=sorted();if(!list.length){notify("مكتبتك فارغة");return;}const style='body{font-family:Georgia,"Times New Roman",serif;font-size:12pt;line-height:2;margin:1in}h1{text-align:center;font-size:14pt}p{margin:0 0 0 0;text-indent:-.5in;margin-left:.5in;direction:auto;unicode-bidi:plaintext}';const html='<!doctype html><html><head><meta charset="utf-8"><style>'+style+'</style></head><body><h1>Works Cited</h1>'+list.map(x=>'<p>'+x.works+'</p>').join('')+'</body></html>';const blob=new Blob(["\ufeff",html],{type:"application/msword;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Marjaei-Works-Cited.doc";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify("تم تجهيز ملف قابل للفتح في Word. راجع التنسيق قبل التسليم.");}
function init(){
 $("sourceType").innerHTML=Object.entries(types).map(([k,v])=>'<option value="'+k+'">'+v.label+'</option>').join("");renderFields();renderLibrary();
 $("sourceType").addEventListener("change",renderFields);
 $("citationForm").addEventListener("submit",generate);
 $("resetBtn").onclick=()=>{renderFields();notify("تم مسح الحقول");};
 $("exampleBtn").onclick=()=>{$("sourceType").value="book";renderFields();$("f_author").value="Mantel, Hilary";$("f_title").value="Wolf Hall";$("f_publisher").value="Picador";$("f_year").value="2010";$("f_page").value="42";generate();};
 $("copyWorks").onclick=()=>last&&copy(stripHtml(last.works));
 $("copyIntext").onclick=()=>last&&copy(last.intext);
 $("copyBoth").onclick=()=>last&&copy(stripHtml(last.works)+"\n"+last.intext);
 $("saveBtn").onclick=()=>{if(!last)return;const a=loadLibrary();a.push(last);if(saveLibrary(a)){renderLibrary();notify("حفظ المرجع في مكتبتك");}};
 $("libraryItems").addEventListener("click",e=>{const b=e.target.closest("button[data-index]");if(!b)return;const a=loadLibrary();a.splice(Number(b.dataset.index),1);if(saveLibrary(a))renderLibrary();});
 $("copyLibrary").onclick=()=>{const s=allRefs();if(!s){notify("مكتبتك فارغة");return;}copy(s);};
 $("exportBtn").onclick=exportWord;
 $("clearLibrary").onclick=()=>{if(!loadLibrary().length)return;if(confirm("هل تريد حذف جميع المراجع المحفوظة من هذا المتصفح؟")){if(saveLibrary([])){renderLibrary();notify("تم حذف المراجع");}}};
}
document.addEventListener("DOMContentLoaded",init);
