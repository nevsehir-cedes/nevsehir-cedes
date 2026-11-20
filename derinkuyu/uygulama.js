const stops = [
  {id:'intro', icon:'🏘️', title:'Karşılama ve Derinkuyu’yu Tanıyalım', sub:'Derinkuyu’nun tarihî, kültürel ve coğrafi özelliklerine kısa bir bakış.'},
  {id:'underground', icon:'🕳️', title:'Derinkuyu Yeraltı Şehri', sub:'Yeraltında kurulan eşsiz yaşam alanını keşfediyoruz.'},
  {id:'church', icon:'⛪', title:'Üzümlü Kilise', sub:'Tarihin derinliklerinden günümüze ulaşan kültürel miras.'},
  {id:'lunch', icon:'🍲', title:'Öğle Yemeği', sub:'Kısa bir mola ve birlikte paylaşım.'},
  {id:'mosque', icon:'🕌', title:'Cumhuriyet Camii', sub:'İlçenin önemli tarihî ve kültürel duraklarından biri.'},
  {id:'park', icon:'🌳', title:'Hakkı Atamulu Kültür Parkı', sub:'Sanat, kültür ve şehir kimliğinin buluştuğu alan.'},
  {id:'reflection', icon:'💬', title:'Değerlerimin İzinde Derinkuyu', sub:'Bugünkü yolculuğumuzu değerlendiriyor, öğrendiklerimizi paylaşıyoruz.'}
];

const LIVE_CODE = '4826';
const state = JSON.parse(localStorage.getItem('derinkuyu-state') || '{}');
state.completed ??= [];
state.mission ??= {};
state.quiz ??= {};
state.note ??= '';
state.richMission ??= {};
state.richQuiz ??= {};
state.richNotes ??= {};
state.mode ??= 'preview';
if(window.DERINKUYU_CONFIG?.pilotFieldMode === true) state.mode = 'live';
state.orientationSeen ??= false;
state.valueCard ??= {
  school:'',
  grade:'',
  q1:'',
  q2:[],
  q3:'',
  q4:'',
  q5:'',
  q6:'',
  q7:'',
  q8:'',
  oneSentence:'',
  selfEval:''
};
state.valueCardComplete ??= false;
state.valueCardSubmitted ??= false;
state.valueCardSubmittedAt ??= '';
state.participantCode ??= `DK-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

const params = new URLSearchParams(location.search);
if(params.get('gezi') === LIVE_CODE){
  state.mode = 'live';
  state.orientationSeen = false;
  localStorage.setItem('derinkuyu-state', JSON.stringify(state));
}

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

function save(){ localStorage.setItem('derinkuyu-state', JSON.stringify(state)); }
function say(msg){ toast.textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); }
function isLive(){ return state.mode === 'live'; }
function complete(id){
  if(!isLive()) return;
  if(!state.completed.includes(id)) state.completed.push(id);
  save();
}
function progress(){ return Math.round((state.completed.length/stops.length)*100); }
function modeBanner(){
  return isLive()
    ? `<div class="mode-banner live"><strong>🟢 Gezi Modu Açık</strong><span>Görevler ve ilerleme kaydediliyor.</span></div>`
    : `<div class="mode-banner preview"><strong>👀 Gezi Öncesi İnceleme</strong><span>Bilgileri inceleyebilirsin; görevler ve ilerleme henüz kaydedilmez.</span></div>`;
}
function unlockTrip(){
  const code = prompt('Öğretmen gezi kodunu gir:');
  if(code === null) return;
  if(code.trim() === LIVE_CODE){
    state.mode = 'live';
    state.orientationSeen = false;
    save();
    say('Gezi Modu açıldı.');
    setTimeout(()=>renderOrientation(),350);
  } else {
    say('Kod doğru değil.');
  }
}
function setNav(name){ state.currentView=name; save(); document.querySelectorAll('[data-drawer-nav]').forEach(b=>b.classList.toggle('active', b.dataset.drawerNav===name)); }
function go(name){
  window.scrollTo({top:0,behavior:'smooth'});
  setNav(name);
  if(name==='home') renderHome();
  else if(name==='route') renderRoute();
  else if(name==='tasks') renderTasks();
  else if(name==='info') renderInfo();
  else if(name==='about') renderAbout();
}

function refreshDrawerMode(){
  const box=document.querySelector('#drawerMode');
  const main=document.querySelector('#drawerModeActionText');
  const sub=document.querySelector('#drawerModeActionSub');
  if(!box) return;
  if(isLive()){
    box.innerHTML='<span class="drawer-status-dot live"></span><div><strong>Gezi Modu Açık</strong><small>Görev ve testler aktif</small></div>';
    if(main) main.textContent='Gezi Modu Açık';
    if(sub) sub.textContent='Gezi etkinliği aktif';
  }else{
    box.innerHTML='<span class="drawer-status-dot preview"></span><div><strong>Gezi Öncesi İnceleme</strong><small>Bilgiler açık, görevler kilitli</small></div>';
    if(main) main.textContent='Gezi Modunu Aç';
    if(sub) sub.textContent='Öğretmen kodunu gir';
  }
}
function openDrawer(){
  document.querySelector('#sideDrawer')?.classList.add('open');
  document.querySelector('#menuOverlay')?.classList.add('show');
  document.querySelector('#sideDrawer')?.setAttribute('aria-hidden','false');
  refreshDrawerMode();
}
function closeDrawer(){
  document.querySelector('#sideDrawer')?.classList.remove('open');
  document.querySelector('#menuOverlay')?.classList.remove('show');
  document.querySelector('#sideDrawer')?.setAttribute('aria-hidden','true');
}
function toggleDrawer(){
  if(document.querySelector('#sideDrawer')?.classList.contains('open')) closeDrawer(); else openDrawer();
}

document.querySelector('#resetBtn').addEventListener('click',()=>{ if(confirm('Gezi ilerlemesi, cevaplar ve Gezi Modu sıfırlansın mı?')){ localStorage.removeItem('derinkuyu-state'); location.href=location.pathname; }});

document.querySelector('#menuBtn')?.addEventListener('click',openDrawer);
document.querySelector('#drawerClose')?.addEventListener('click',closeDrawer);
document.querySelector('#menuOverlay')?.addEventListener('click',closeDrawer);
document.querySelectorAll('[data-drawer-nav]').forEach(b=>b.addEventListener('click',()=>{ closeDrawer(); go(b.dataset.drawerNav); }));
document.querySelector('[data-drawer-action="orientation"]')?.addEventListener('click',()=>{ closeDrawer(); renderOrientation(); });
document.querySelector('[data-drawer-action="mode"]')?.addEventListener('click',()=>{
  closeDrawer();
  if(isLive()) say('Gezi Modu zaten açık.'); else unlockTrip();
});
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeDrawer(); });




function renderOrientation(){
  setNav('route');
  app.innerHTML=`<section class="screen orientation-screen">
    <div class="orientation-top">
      <div class="orientation-icon">🧭</div>
      <div class="eyebrow">GEZİ MODU</div>
      <h1>Bugün Nasıl Kullanacağız?</h1>
      <p>Telefon, geziyi izlemek için değil; gördüklerini anlamlandırmak için kullanılacak.</p>
    </div>

    <div class="orientation-steps">
      <article class="orientation-step">
        <div class="step-no">1</div>
        <div><h3>Önce Mekânı Keşfet</h3><p>Rehberini ve öğretmenini dinle. Çevrene bak, ayrıntıları fark et. Bu sırada telefon cebinde kalsın.</p></div>
      </article>
      <article class="orientation-step">
        <div class="step-no">2</div>
        <div><h3>Görevini Tamamla</h3><p>“Buraya Dikkat Et” bölümündeki ayrıntıları yerinde bul ve keşif görevlerini işaretle.</p></div>
      </article>
      <article class="orientation-step">
        <div class="step-no">3</div>
        <div><h3>Mini Testi Çöz</h3><p>Gözlem yaptıktan sonra kısa testi çöz. Cevapların gezi ilerlemene kaydedilecek.</p></div>
      </article>
    </div>

    <div class="orientation-rule">
      <strong>📵 Altın Kural</strong>
      <span>Önce gör, dinle ve keşfet; sonra telefonu aç.</span>
    </div>

    <button class="primary-btn" id="orientationStart">Anladım, Geziye Başla →</button>
  </section>`;
  document.querySelector('#orientationStart').onclick=()=>{
    state.orientationSeen=true;
    save();
    renderRoute();
  };
}

function renderHome(){
  document.body.setAttribute('data-view','home');
  app.innerHTML=`<section class="screen exact-home-screen" aria-label="Derinkuyu Dijital Gezi Rehberi ana sayfası">
    <div class="exact-home-stage" id="exactHomeStage">
      <img class="exact-home-image exact-closed" id="exactHomeClosed" src="assets/home-closed.png" alt="Derinkuyu Dijital Gezi Rehberi ana sayfa">
      <img class="exact-home-image exact-open" id="exactHomeOpen" src="assets/home-open.png" alt="Derinkuyu Dijital Gezi Rehberi açılır menü" hidden>

      <button class="exact-hotspot menu-open-hotspot" id="exactMenuOpen" aria-label="Menüyü aç"></button>
      <button class="exact-hotspot start-hotspot" id="exactStart" aria-label="Geziye Başla"></button>

      <div id="exactMenuHotspots" hidden>
        <button class="exact-hotspot menu-close-hotspot" id="exactMenuClose" aria-label="Menüyü kapat"></button>
        <button class="exact-hotspot menu-item-hotspot item-home" data-exact-nav="home" aria-label="Ana Sayfa"></button>
        <button class="exact-hotspot menu-item-hotspot item-route" data-exact-nav="route" aria-label="Gezi Rotası"></button>
        <button class="exact-hotspot menu-item-hotspot item-info" data-exact-nav="info" aria-label="Bilgi Köşesi"></button>
        <button class="exact-hotspot menu-item-hotspot item-tasks" data-exact-nav="tasks" aria-label="Değer Kartım"></button>
        <button class="exact-hotspot menu-item-hotspot item-about" data-exact-nav="about" aria-label="Uygulama Hakkında"></button>
      </div>
    </div>
  </section>`;

  const closed=document.querySelector('#exactHomeClosed');
  const open=document.querySelector('#exactHomeOpen');
  const menuHotspots=document.querySelector('#exactMenuHotspots');
  const showMenu=()=>{ closed.hidden=true; open.hidden=false; menuHotspots.hidden=false; document.querySelector('#exactMenuOpen').hidden=true; };
  const hideMenu=()=>{ open.hidden=true; closed.hidden=false; menuHotspots.hidden=true; document.querySelector('#exactMenuOpen').hidden=false; };
  document.querySelector('#exactMenuOpen').onclick=showMenu;
  document.querySelector('#exactMenuClose').onclick=hideMenu;
  document.querySelector('#exactStart').onclick=()=>{ if(isLive() && !state.orientationSeen) renderOrientation(); else go('route'); };
  document.querySelectorAll('[data-exact-nav]').forEach(btn=>btn.onclick=()=>{
    const dest=btn.dataset.exactNav;
    if(dest==='about') renderAbout(); else go(dest);
  });
}

function renderRoute(){
  document.body.setAttribute('data-view','route');
  const pct=progress();
  const live=isLive();
  app.innerHTML=`<section class="screen premium-route-screen">
    <div class="premium-route-hero">
      <div class="route-hero-overlay"></div>
      <div class="route-hero-content">
        <div class="route-eyebrow">DEĞERLERİMLE ADIM ADIM</div>
        <h2>Bugünkü Yolculuğum</h2>
        <p>Derinkuyu’nun kültürel mirasını değerlerimizin izinde keşfet.</p>
        <div class="route-meta-row">
          <span>25 Kasım 2026</span>
          <b>•</b>
          <span>Yardımlaşma • Güven</span>
        </div>
      </div>
    </div>

    <div class="route-summary-card">
      <div class="route-summary-top">
        <div><small>${live?'GEZİ MODU':'İNCELEME MODU'}</small><strong>${live?'Yolculuk devam ediyor':'Rotayı önceden keşfet'}</strong></div>
        <div class="route-percent">${live?`%${pct}`:'◉'}</div>
      </div>
      ${live
        ? `<div class="premium-progress"><div style="width:${pct}%"></div></div><small class="route-summary-note">Tamamlanan duraklara istediğin zaman yeniden dönebilirsin.</small>`
        : `<small class="route-summary-note">Bilgi sayfaları açık; görev ve mini testler gezi günü etkinleşir.</small>`}
      ${live?`<button class="route-how-btn" id="howToBtn">🧭 Bugün Nasıl Kullanacağız?</button>`:''}
    </div>

    <div class="premium-route-list">
      ${stops.map((s,i)=>{
        const done=state.completed.includes(s.id);
        const prevDone=i===0 || state.completed.includes(stops[i-1].id);
        const available=!live || done || prevDone;
        const active=live && prevDone && !done;
        let label='İncele';
        if(live){
          if(done) label='Tekrar Aç';
          else if(active) label='Başla →';
          else label='Bekliyor';
        }
        return `<article class="premium-stop ${active?'current':''} ${done?'completed':''}">
          <div class="route-line ${i===stops.length-1?'last':''}"></div>
          <div class="stop-number">${done?'✓':String(i+1).padStart(2,'0')}</div>
          <div class="stop-main">
            <div class="stop-icon">${s.icon}</div>
            <div class="stop-copy"><strong>${s.title}</strong><span>${s.sub}</span></div>
          </div>
          <button class="premium-stop-btn ${available?'enabled':'disabled'}" data-stop="${s.id}" ${available?'':'disabled'}>${label}</button>
        </article>`;
      }).join('')}
    </div>

    ${live&&pct===100?`<div class="premium-completion"><div>🏆</div><h2>Derinkuyu Yolculuğu Tamamlandı</h2><p>Kültürel miras rotasını Yardımlaşma ve Güven değerleriyle tamamladın.</p></div>`:''}
  </section>`;
  document.querySelectorAll('[data-stop]').forEach(btn=>btn.addEventListener('click',()=>openStop(btn.dataset.stop)));
  if(document.querySelector('#howToBtn')) document.querySelector('#howToBtn').onclick=renderOrientation;
}

function openStop(id){
  if(id==='intro'){ renderIntro(); return; }
  if(id==='underground'){ renderUnderground(); return; }
  if(['church','mosque','park'].includes(id)){ renderRichStop(id); return; }
  if(id==='lunch'){ renderSimpleStop(id); return; }
  if(id==='reflection'){ renderReflection(); }
}

function renderIntro(){
  setNav('route');
  app.innerHTML=`<section class="screen">
    <div class="page-title"><div class="eyebrow">🏘️ Başlangıç</div><h2>Derinkuyu’yu Tanıyalım</h2><p>Bugünkü yolculuğun amacı, ilçenin kültürel mirasını yerinde tanırken yardımlaşma ve güven değerlerinin izini sürmek.</p></div>
    ${modeBanner()}
    <div class="fact-list">
      <div class="fact"><h3>Bugünkü sorumuz</h3><p>İnsanların birlikte ve güven içinde yaşayabilmeleri için hangi değerlere ihtiyaç vardır?</p></div>
      <div class="fact"><h3>Keşif görevin</h3><p>Gezdiğin yerlerde yardımlaşma, güven, dayanışma, sorumluluk ve kültürel mirasa sahip çıkmanın izlerini ara.</p></div>
    </div>
    ${isLive()?'<div style="padding:0 18px 20px"><button class="primary-btn" id="introDone">Başlangıcı Tamamla ✓</button></div>':'<div class="locked-panel">🔒 Bu bölüm gezi günü “tamamlandı” olarak işaretlenebilir.</div>'}
  </section>`;
  if(document.querySelector('#introDone')) document.querySelector('#introDone').onclick=()=>{complete('intro');say('Başlangıç tamamlandı.');setTimeout(renderRoute,400);};
}

const guideNarration = `Derinkuyu Yeraltı Şehri, Kapadokya'nın jeolojik yapısı içinde geliştirilmiş çok katlı bir yeraltı yerleşimidir. Kültür ve Turizm Bakanlığı tanıtımına göre yapı sekiz katlıdır ve büyük bir topluluğun uzun süre birlikte yaşayabilmesine imkân verecek alanlar içerir. Erzak depoları, havalandırma bacaları, su kuyuları, toplantı alanları, ibadet mekânları ve dar geçitler bu yaşamın izlerini taşır. Bazı tünel girişlerinde güvenlik için büyük taş silindirler kullanılmıştır. Derinkuyu'yu gezerken özellikle havalandırma sistemi, dar geçitler, ortak kullanım alanları ve güvenlik düzeneklerine dikkat et. Bu durak bize birlikte yaşamanın yardımlaşma, sorumluluk, dayanışma ve güven gerektirdiğini düşündürüyor.`;

function speakGuide(){
  if(!('speechSynthesis' in window)){
    say('Bu cihazda sesli okuma desteklenmiyor.');
    return;
  }

  speechSynthesis.cancel();

  const findTurkishVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => (v.lang || '').toLowerCase() === 'tr-tr')
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('tr'))
      || voices.find(v => /turkish|türkçe|turkce/i.test(v.name || ''));
  };

  const speakWithTurkishVoice = () => {
    const turkishVoice = findTurkishVoice();
    if(!turkishVoice){
      say('Bu telefonda Türkçe ses bulunamadı. Telefonun metinden sese ayarlarından Türkçe sesi etkinleştirin. İngilizce ses kullanılmayacak.');
      return false;
    }

    const u = new SpeechSynthesisUtterance(guideNarration);
    u.lang = turkishVoice.lang || 'tr-TR';
    u.voice = turkishVoice;
    u.rate = 0.92;
    u.pitch = 1;
    speechSynthesis.speak(u);
    say('Türkçe rehber anlatımı başladı.');
    return true;
  };

  if(speechSynthesis.getVoices().length){
    speakWithTurkishVoice();
    return;
  }

  let done=false;
  const tryOnce=()=>{
    if(done) return;
    if(speechSynthesis.getVoices().length){
      done=true;
      speechSynthesis.removeEventListener('voiceschanged', tryOnce);
      speakWithTurkishVoice();
    }
  };
  speechSynthesis.addEventListener('voiceschanged', tryOnce);
  setTimeout(()=>{
    if(done) return;
    done=true;
    speechSynthesis.removeEventListener('voiceschanged', tryOnce);
    if(!speakWithTurkishVoice()){
      // Uyarı speakWithTurkishVoice içinde gösterildi.
    }
  }, 1500);
}
function stopGuide(){ if('speechSynthesis' in window) speechSynthesis.cancel(); say('Sesli anlatım durduruldu.'); }

const verifiedImages = {
  undergroundRoom: {
    primary:'assets/underground1.jpg',
    alternate:'assets/underground1.jpg'
  },
  undergroundDoor: {
    primary:'assets/underground2.jpg',
    alternate:'assets/underground2.jpg'
  },
  undergroundStoneDoor2: {
    primary:'assets/underground2.jpg',
    alternate:'assets/underground2.jpg'
  },
  churchExterior: {
    primary:'assets/church1.jpg',
    alternate:'assets/church1.jpg'
  },
  churchFresco: {
    primary:'assets/church2.jpg',
    alternate:'assets/church2.jpg'
  }
};

function resilientImage(primary, alternate, alt, cls=''){
  const p=primary.replace(/'/g,"%27");
  const a=alternate.replace(/'/g,"%27");
  return `<img class="${cls}" src="${p}" data-alt-src="${a}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.tried!=='1'){this.dataset.tried='1';this.src=this.dataset.altSrc;}else{this.onerror=null;this.src='assets/photo-placeholder.svg';}">`;
}

const richStops = {
  church: {
    icon:'⛪',
    title:'Üzümlü Kilise',
    short:'Aziz Theodoros Trion Kilisesi',
    subtitle:'Derinkuyu’nun 19. yüzyıldan günümüze ulaşan önemli kültürel miras yapılarından biri.',
    theme:'Kültürel miras • Saygı • Ortak geçmiş',
    narration:`Üzümlü Kilise olarak bilinen Aziz Theodoros Trion Kilisesi, Derinkuyu’daki önemli Rum Ortodoks yapılarından biridir. Millî Eğitim Bakanlığının Okul Dışı Öğrenme Ortamları bilgisinde, yapının 1856 Islahat Fermanı sonrasında inşa edildiği ve 15 Mayıs 1858 tarihinde ibadete açıldığı belirtilir. Kilise adını Theodor Tiron’dan alır. Dış cephedeki üzüm motifleri nedeniyle halk arasında Üzümlü Kilise adıyla tanınmıştır. Gezerken taş işçiliğine, sütunlara, kemerlere, cephedeki motiflere ve içeride korunmuş süsleme izlerine dikkat et. Bu yapı bize geçmişten kalan eserleri tanımanın, farklı kültürlerin mirasına saygı göstermenin ve ortak tarih bilinci geliştirmenin önemini hatırlatır.`,
    summaryTitle:'19. yüzyıldan günümüze uzanan bir miras',
    summary:'Aziz Theodoros Trion Kilisesi, Derinkuyu’da yaşayan Rum Ortodoks topluluğunun tarihî mirasını günümüze taşıyan yapılardandır. Bugün kültürel mirasın korunması ve farklı dönemlerin izlerinin okunması açısından önemli bir duraktır.',
    history:'MEB Okul Dışı Öğrenme Ortamları kaynağına göre kilise, Sultan Abdülmecid dönemindeki 1856 Islahat Fermanı sonrasında inşa edilmiş ve 15 Mayıs 1858’de ibadete açılmıştır. Yapı Theodor Tiron’a adanmıştır; dış cephedeki üzüm motifleri nedeniyle “Üzümlü Kilise” adıyla da anılır.',
    attention:[
      'Dış cephedeki üzüm ve haç motiflerini bulmaya çalış.',
      'Taş sütun, kemer ve giriş bölümündeki işçiliği incele.',
      'İç mekânda günümüze ulaşan süsleme ve fresk izlerine dikkat et.',
      'Yapının bugün korunarak ziyaret edilebilmesinin neden önemli olduğunu düşün.'
    ],
    valueTitle:'Kültürel mirasa saygı',
    value:'Farklı dönemlerden ve topluluklardan kalan tarihî yapıları korumak; geçmişi anlamamıza, farklılıklara saygı geliştirmemize ve ortak kültürel hafızayı geleceğe taşımamıza yardımcı olur.',
    mission:[
      'Üzüm motiflerinden bir örnek bul.',
      'Taş işçiliğinde dikkatini çeken bir ayrıntı belirle.',
      'Korunması gerektiğini düşündüğün bir bölüm seç.'
    ],
    quiz:[
      {q:'Üzümlü Kilise’nin ibadete açıldığı tarih hangisidir?', opts:['15 Mayıs 1858','29 Ekim 1923','1949','1967'], correct:0},
      {q:'“Üzümlü Kilise” adı en çok hangi özellik ile ilişkilidir?', opts:['Yeraltında olması','Dış cephedeki üzüm motifleri','Bahçesindeki üzüm bağı','Çan kulesinin biçimi'], correct:1}
    ],
    images:[
      {
        url:verifiedImages.churchExterior.primary,
        altUrl:verifiedImages.churchExterior.alternate,
        cap:'Aziz Theodoros Trion Kilisesi dış görünümü.',
        credit:'Geçici uygulama görseli • kullanıcı tarafından sağlanan fotoğraf'
      },
      {
        url:verifiedImages.churchFresco.primary,
        altUrl:verifiedImages.churchFresco.alternate,
        cap:'Kubbedeki fresk ayrıntısı.',
        credit:'Geçici uygulama görseli • kullanıcı tarafından sağlanan fotoğraf'
      }
    ],
    source:'Kaynak: MEB Okul Dışı Öğrenme Ortamları – Derinkuyu Aziz Theodoros Trion Kilisesi (Üzümlü Kilisesi).'
  },
  mosque: {
    icon:'🕌',
    title:'Cumhuriyet Camii',
    short:'Eski Baş Melekler Kilisesi',
    subtitle:'Bir tarihî yapının zaman içinde farklı işlevlerle yaşamaya devam etmesinin dikkat çekici örneklerinden biri.',
    theme:'Ortak miras • Tarih bilinci • Saygı',
    narration:`Derinkuyu Cumhuriyet Camii, ilçenin kültürel sürekliliğini gösteren dikkat çekici yapılardan biridir. Derinkuyu İlçe Millî Eğitim Müdürlüğü tarihçe bilgisinde yapının başlangıçta Baş Melekler Kilisesi olduğu, 1924 yılında ibadete kapatıldığı, 1949 yılında Derinkuyulu Tahsin Ertaş tarafından satın alınarak Diyanet İşleri Başkanlığına bağışlandığı ve daha sonra camiye dönüştürüldüğü belirtilir. Günümüzde Cumhuriyet Camii olarak kullanılmaktadır. Yapıyı gezerken geçmişten kalan mimari izlerle bugünkü kullanım biçiminin nasıl bir arada bulunduğuna dikkat et. Bu durak bize tarihî yapıların toplumların ortak hafızasında taşıdığı anlamı ve kültürel mirasa saygıyı düşündürür.`,
    summaryTitle:'Geçmişten bugüne yaşayan bir yapı',
    summary:'Cumhuriyet Camii, Derinkuyu’nun farklı tarihî dönemlerini aynı yapı üzerinden okumaya imkân verir. Bir dönem kilise olarak kullanılan yapı, daha sonra camiye dönüştürülmüş ve günümüze kadar yaşamaya devam etmiştir.',
    history:'Derinkuyu İlçe Millî Eğitim Müdürlüğü tarihçesine göre yapı Baş Melekler Kilisesi idi. 1924’te ibadete kapatıldı; 1949’da Derinkuyulu Tahsin Ertaş tarafından satın alındı, Diyanet İşleri Başkanlığına bağışlandı ve camiye dönüştürüldü. Günümüzde Cumhuriyet Camii olarak kullanılmaktadır.',
    attention:[
      'Yapının taş mimarisinde geçmişten kalan ayrıntıları incele.',
      'Bugünkü cami kullanımına ait unsurları gözlemle.',
      'Aynı yapının farklı dönemlerde farklı işlevler üstlenmesini düşün.',
      'Bir tarihî yapının korunarak kullanılmasının avantajlarını tartış.'
    ],
    valueTitle:'Ortak mirasa sahip çıkmak',
    value:'Bir yapının geçmişini bilmek, onu yalnız bugünkü işleviyle değil tarih boyunca taşıdığı anlamlarla değerlendirmemizi sağlar. Saygı, tarih bilinci ve ortak mirasa sahip çıkma bu durağın temel değerleridir.',
    mission:[
      'Geçmişten kaldığını düşündüğün bir mimari ayrıntı bul.',
      'Bugünkü kullanımını gösteren bir unsur belirle.',
      '“Ortak miras” kavramını anlatan tek cümle yazmaya hazırlan.'
    ],
    quiz:[
      {q:'Cumhuriyet Camii’nin önceki işlevi neydi?', opts:['Kervansaray','Baş Melekler Kilisesi','Medrese','Han'], correct:1},
      {q:'Yapının Diyanet İşleri Başkanlığına bağışlandığı yıl hangisidir?', opts:['1924','1949','1967','2006'], correct:1}
    ],
    images:[
      {
        url:'https://fibhabercom.teimg.com/fibhaber-com/uploads/2025/12/588918383-18099557470762878-4536720303613962268-n.jpg',
        altUrl:'assets/photo-placeholder.svg',
        cap:'Cumhuriyet Camii – gezi öncesi geçici kaynak görseli.',
        credit:'Fotoğraf alanı • Kendi çektiğimiz görsel gezi sonrası eklenecek'
      }
    ],
    source:'Kaynak: Derinkuyu İlçe Millî Eğitim Müdürlüğü – İlçemizin Tarihçesi.'
  },
  park: {
    icon:'🌳',
    title:'Hakkı Atamulu Kültür Parkı',
    short:'Sanat, şehir kültürü ve ortak emek',
    subtitle:'Derinkuyu’nun sanat, yeşil alan ve şehir hafızasını bir araya getiren kültürel durağı.',
    theme:'Estetik • Emek • Topluma katkı',
    narration:`Hakkı Atamulu Kültür Parkı, Derinkuyu’nun önemli kültürel ve sosyal alanlarından biridir. Derinkuyu Belediyesi ve Kaymakamlığı bilgilerine göre parkın yapım ve düzenlenmesine 1966 yılında, heykeltıraş Hakkı Atamulu’nun belediye başkanlığı döneminde başlanmış ve yaklaşık dört yılda halkın katılımıyla tamamlanmıştır. Yaklaşık yüz bin metrekarelik alanda çeşitli sosyal alanların yanında Hakkı Atamulu’ya ait on beş yapıt ve heykel bulunduğu belirtilir. Park Camii de Hakkı Atamulu tarafından tasarlanmıştır. Parkı gezerken sanat eserleri, yeşil alan, kamusal kullanım ve ortak emek arasındaki ilişkiye dikkat et. Bu durak bize sanatın bir şehrin kimliğine katkısını ve topluma kalıcı eser bırakmanın değerini düşündürür.`,
    summaryTitle:'Bir ilçenin sanat ve şehir hafızası',
    summary:'Kültür Parkı yalnızca dinlenme alanı değildir; Hakkı Atamulu’nun sanat eserleri, park tasarımı, kamusal alanları ve Derinkuyu halkının ortak emeğiyle şekillenmiş bir şehir hafızasıdır.',
    history:'Derinkuyu Belediyesi ve Kaymakamlığına göre parkın yapım ve düzenlenmesine 1966’da başlanmış, çalışmalar halkın katılımıyla yaklaşık dört yılda tamamlanmıştır. Parkta Hakkı Atamulu’ya ait 15 yapıt ve heykel bulunduğu; Park Camii’nin de Atamulu tarafından tasarlandığı belirtilmektedir.',
    attention:[
      'Hakkı Atamulu’ya ait bir eser seç ve biçimini incele.',
      'Parkın sanat ile günlük yaşamı nasıl buluşturduğuna dikkat et.',
      'Ağaçlık alanlar ve kamusal mekân düzenini gözlemle.',
      'Topluma kalıcı eser bırakmanın ne anlama geldiğini düşün.'
    ],
    valueTitle:'Emek ve topluma katkı',
    value:'Bir şehrin kimliği yalnız binalarla değil; sanat, ortak emek, yeşil alanlar ve toplum için üretilen kalıcı eserlerle de oluşur. Bu durak estetik, emek ve sorumluluk değerlerini öne çıkarır.',
    mission:[
      'Seni en çok etkileyen bir sanat eserini seç.',
      'Parkta “ortak yaşam alanı” olduğunu gösteren bir bölüm bul.',
      'Sanatın şehre kattığı değeri tek kelimeyle ifade et.'
    ],
    quiz:[
      {q:'Kültür Parkı’nın düzenlenmesine hangi yılda başlanmıştır?', opts:['1949','1966','1980','2006'], correct:1},
      {q:'Parkta Hakkı Atamulu’ya ait kaç yapıt ve heykel bulunduğu belirtilir?', opts:['5','8','15','25'], correct:2}
    ],
    images:[
      {
        url:'https://haber384com.teimg.com/haber384-com/uploads/2024/04/hakki-atamulu-parki-zenginlestirilecek.jpg',
        altUrl:'assets/photo-placeholder.svg',
        cap:'Hakkı Atamulu Kültür Parkı – gezi öncesi geçici kaynak görseli.',
        credit:'Fotoğraf alanı • Kendi çektiğimiz görsel gezi sonrası eklenecek'
      },
      {
        url:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/cf/8e/9e/park-girisi.jpg?h=1200&s=1&w=1200',
        altUrl:'assets/photo-placeholder.svg',
        cap:'Hakkı Atamulu Kültür Parkı giriş tabelası – gezi öncesi geçici kaynak görseli.',
        credit:'Fotoğraf alanı • Kendi çektiğimiz görsel gezi sonrası eklenecek'
      }
    ],
    source:'Kaynak: Derinkuyu Belediyesi ve Derinkuyu Kaymakamlığı – Hakkı Atamulu Kültür Parkı.'
  }
};


function speakText(text){
  if(!('speechSynthesis' in window)){ say('Bu cihazda sesli okuma desteklenmiyor.'); return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='tr-TR'; u.rate=.92; u.pitch=1;
  speechSynthesis.speak(u);
  say('Rehber anlatımı başladı.');
}


function renderUnderground(tab='discover'){
  setNav('route');
  app.innerHTML=`<section class="screen">
    <div class="page-title"><div class="eyebrow">📍 Durak 2</div><h2>Derinkuyu Yeraltı Şehri</h2><p>Geçmişte insanların birlikte yaşadığı, korunma ve barınma amacıyla kullanılan çok katmanlı yeraltı yerleşimini keşfet.</p></div>
    ${modeBanner()}
    <div class="hero-photo"><div class="caption">Tema bağlantısı: Birlikte yaşam • Güven • Dayanışma</div></div>
    <div class="tabs"><button class="tab ${tab==='discover'?'active':''}" data-tab="discover">🔎 Keşfet</button><button class="tab ${tab==='mission'?'active':''}" data-tab="mission">☑ Görevim</button><button class="tab ${tab==='quiz'?'active':''}" data-tab="quiz">🏆 Mini Test</button></div>
    <div id="tabBody"></div>
  </section>`;
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>renderUnderground(b.dataset.tab));
  const body=document.querySelector('#tabBody');
  if(tab==='discover') body.innerHTML=`<div class="guide-wrap">
    <div class="guide-actions"><button class="listen-btn" id="listenGuide">🔊 Rehberi Dinle</button><button class="stop-btn" id="stopGuide">■ Durdur</button></div>
    <section class="tour-card"><div class="tour-label">KISACA</div><h3>Yer altında kurulmuş çok katlı bir yaşam sistemi</h3><p>Derinkuyu Yeraltı Şehri, büyük bir topluluğun barınma, korunma ve günlük ihtiyaçlarını karşılayabilecek biçimde düzenlenmiş çok katlı bir yeraltı yerleşimidir. Kültür ve Turizm Bakanlığı tanıtımında yapının <strong>sekiz katlı</strong> olduğu belirtilir.</p></section>
    <div class="real-gallery">
      <figure>${resilientImage(verifiedImages.undergroundRoom.primary,verifiedImages.undergroundRoom.alternate,"Derinkuyu Yeraltı Şehri oda ve ortak kullanım alanı")}<figcaption>Yeraltı şehrindeki oda ve ortak kullanım alanlarından bir görünüm.</figcaption></figure>
      <figure>${resilientImage(verifiedImages.undergroundDoor.primary,verifiedImages.undergroundDoor.alternate,"Derinkuyu Yeraltı Şehri taş sürgü kapısı")}<figcaption>Geçitleri kapatmak için kullanılan büyük taş silindir örneklerinden biri.</figcaption></figure>
      <figure>${resilientImage(verifiedImages.undergroundStoneDoor2.primary,verifiedImages.undergroundStoneDoor2.alternate,"Derinkuyu Yeraltı Şehri taş kapı ve geçit")}<figcaption>Taş sürgü kapı ve dar geçitlerden bir görünüm.<small>Kullanıcı tarafından sağlanan fotoğraf</small></figcaption></figure>
    </div>
    <section class="tour-card"><div class="tour-label">TARİHÇE</div><h3>Geçmişin farklı dönemlerinden izler</h3><p>Bakanlığın tanıtım metni, Derinkuyu’nun ilk yerleşim izlerini Asur kolonilerine kadar götürür; özellikle Roma döneminde Kapadokya’ya gelen ilk Hıristiyan toplulukların yeraltı yaşam alanlarını genişlettiğini aktarır. Bu nedenle gezerken yapıyı tek bir odadan değil, zaman içinde büyümüş bir yaşam ağı olarak düşün.</p></section>
    <section class="attention-card"><div class="tour-label">👁 BURAYA DİKKAT ET</div><ul><li><strong>Havalandırma bacaları:</strong> Yer altında temiz hava dolaşımını nasıl sağlıyor?</li><li><strong>Dar tüneller:</strong> Neden bazı geçitler yalnızca bir kişinin geçebileceği kadar dar?</li><li><strong>Taş silindirler:</strong> Güvenlik açısından nasıl bir işlev görüyor olabilir?</li><li><strong>Depo ve ortak alanlar:</strong> Uzun süreli yaşam için hangi ihtiyaçları karşılıyor?</li></ul></section>
    <div class="content-cards">
      <div class="info-card"><div class="bigicon">🏠</div><div><h3>Birlikte Yaşam</h3><p>Erzak depoları, toplantı alanları, ibadet mekânları ve ortak kullanım bölümleri bir topluluğun düzen içinde yaşamasını destekliyordu.</p></div></div>
      <div class="info-card"><div class="bigicon">🌬️</div><div><h3>Havalandırma</h3><p>Havalandırma bacaları, yer altında yaşamın sürdürülebilmesi için temel altyapı unsurlarındandı.</p></div></div>
      <div class="info-card"><div class="bigicon">🛡️</div><div><h3>Güvenlik</h3><p>Dar geçitler ve tünel girişlerini kapatmak için kullanılan büyük taş silindirler savunmaya yardımcı oluyordu.</p></div></div>
    </div>
    <section class="value-link"><span>🤝</span><div><h3>Değer Bağlantısı</h3><p>Bu kadar insanın aynı yerde yaşayabilmesi; <strong>yardımlaşma, sorumluluk, dayanışma ve güven</strong> gerektiriyordu. Gezi boyunca bu değerlerin mimariye nasıl yansıdığını düşün.</p></div></section>
    <div class="source-note"><strong>Kaynak:</strong> T.C. Kültür ve Turizm Bakanlığı – Derinkuyu Yeraltı Şehri tanıtımı. Fotoğraflar: Görseller uygulama içine yerel dosya olarak eklendi.</div>
    <button class="primary-btn" id="toMission">Keşif Görevine Geç →</button>
  </div>`;
  if(tab==='mission' && !isLive()) body.innerHTML=`<div class="locked-panel"><h3>🔐 Keşif Görevi Gezi Günü Açılacak</h3><p>Görevin konusunu şimdi görebilirsin; işaretleme ve ilerleme kaydı Gezi Modu açılınca etkinleşecek.</p><p><strong>Görev:</strong> Yeraltı şehrinde birlikte yaşam, güvenlik, havalandırma ve depolama ile ilgili en az üç ayrıntı bul.</p></div>`;
  if(tab==='mission' && isLive()) body.innerHTML=`<div class="mission"><h3>🔎 DERİNKUYU DEDEKTİFİ</h3><div class="mission-body"><p><strong>Yeraltı şehrinde aşağıdakilerden üçünü bulmaya çalış.</strong></p>${[
    'İnsanların birlikte yaşamasını kolaylaştıran bir bölüm','Güvenlik amacı taşıdığını düşündüğün bir yapı','Havalandırmayı sağlayan bir unsur','Yiyeceklerin korunabileceği bir alan','Seni şaşırtan bir mimari ayrıntı'
  ].map((x,i)=>`<label class="check-row"><input type="checkbox" data-mission="${i}" ${state.mission[i]?'checked':''}><span>${x}</span></label>`).join('')}<button class="primary-btn" id="missionDone">Görevimi Tamamladım ✓</button></div></div>`;
  if(tab==='quiz' && !isLive()) body.innerHTML=`<div class="locked-panel"><h3>🏆 Mini Test Gezi Günü Açılacak</h3><p>Sorular ve puanlama, mekânı yerinde gözlemledikten sonra etkinleşecek.</p></div>`;
  if(tab==='quiz' && isLive()) body.innerHTML=`<div class="quiz-card"><h3>Mini Test</h3><div class="question">1. Yeraltında toplu yaşamın sürdürülebilmesi için hangisi özellikle önemlidir?</div>${['Havalandırma','Reklam tabelaları','Dekorasyon','Otopark'].map((x,i)=>`<label class="choice"><input type="radio" name="q1" value="${i}">${x}</label>`).join('')}<div class="question" style="margin-top:16px">2. Bu durakla en güçlü ilişkilendirebileceğimiz değer hangisidir?</div>${['Gösteriş','Yardımlaşma ve güven','Rekabet','Tüketim'].map((x,i)=>`<label class="choice"><input type="radio" name="q2" value="${i}">${x}</label>`).join('')}<button class="primary-btn" id="quizDone">Cevapları Kontrol Et</button></div>`;

  if(document.querySelector('#toMission')) document.querySelector('#toMission').onclick=()=>renderUnderground('mission');
  if(document.querySelector('#listenGuide')) document.querySelector('#listenGuide').onclick=speakGuide;
  if(document.querySelector('#stopGuide')) document.querySelector('#stopGuide').onclick=stopGuide;
  document.querySelectorAll('[data-mission]').forEach(c=>c.onchange=()=>{if(!isLive()) return; state.mission[c.dataset.mission]=c.checked;save();});
  if(document.querySelector('#missionDone')) document.querySelector('#missionDone').onclick=()=>{const n=Object.values(state.mission).filter(Boolean).length;if(n<3){say('En az üç keşif işaretle.');return;}say('Keşif görevi tamamlandı!');renderUnderground('quiz');};
  if(document.querySelector('#quizDone')) document.querySelector('#quizDone').onclick=()=>{const q1=document.querySelector('input[name=q1]:checked');const q2=document.querySelector('input[name=q2]:checked');if(!q1||!q2){say('İki soruyu da cevapla.');return;}const score=(q1.value==='0'?1:0)+(q2.value==='1'?1:0);state.quiz.underground=score;complete('underground');save();say(`Mini test: ${score}/2 doğru • Durak tamamlandı`);setTimeout(renderRoute,650);};
}


function renderRichStop(id, tab='discover'){
  setNav('route');
  const d=richStops[id];
  const done=state.completed.includes(id);
  app.innerHTML=`<section class="screen">
    <div class="page-title"><div class="eyebrow">📍 ${d.icon} Gezi Durağı</div><h2>${d.title}</h2><p>${d.subtitle}</p></div>
    ${modeBanner()}
    ${isLive()?`<div class="stop-sequence"><span>1. Keşfet</span><b>→</b><span>2. Görev</span><b>→</b><span>3. Mini Test</span></div>`:''}
    <div class="rich-hero rich-hero-photo">
      ${resilientImage(d.images[0].url,d.images[0].altUrl||d.images[0].url,`${d.title} kapak fotoğrafı`,'rich-hero-img')}
      <div class="rich-hero-shade"></div>
      <div class="rich-hero-text"><strong>${d.short}</strong><span>${d.theme}</span></div>
    </div>
    <div class="tabs"><button class="tab ${tab==='discover'?'active':''}" data-rich-tab="discover">🔎 Keşfet</button><button class="tab ${tab==='mission'?'active':''}" data-rich-tab="mission">☑ Görevim</button><button class="tab ${tab==='quiz'?'active':''}" data-rich-tab="quiz">🏆 Mini Test</button></div>
    <div id="richBody"></div>
  </section>`;
  document.querySelectorAll('[data-rich-tab]').forEach(b=>b.onclick=()=>renderRichStop(id,b.dataset.richTab));

  const body=document.querySelector('#richBody');

  if(tab==='discover'){
    body.innerHTML=`<div class="guide-wrap">
      <div class="guide-actions"><button class="listen-btn" id="richListen">🔊 Rehberi Dinle</button><button class="stop-btn" id="richStop">■ Durdur</button></div>
      <section class="tour-card"><div class="tour-label">KISACA</div><h3>${d.summaryTitle}</h3><p>${d.summary}</p></section>
      <div class="rich-gallery">${d.images.map((im,i)=>`<figure class="${i===0?'wide':''}">${resilientImage(im.url,im.altUrl||im.url,`${d.title} gerçek fotoğrafı`)}<figcaption>${im.cap}<small>${im.credit}</small></figcaption></figure>`).join('')}</div>
      <section class="tour-card"><div class="tour-label">TARİHÇE</div><h3>Geçmişten bugüne</h3><p>${d.history}</p></section>
      <section class="attention-card"><div class="tour-label">👁 BURAYA DİKKAT ET</div><ul>${d.attention.map(x=>`<li>${x}</li>`).join('')}</ul></section>
      <section class="value-link"><span>🤝</span><div><h3>${d.valueTitle}</h3><p>${d.value}</p></div></section>
      <div class="source-note"><strong>${d.source}</strong><br>Derinkuyu Yeraltı Şehri ve Üzümlü Kilise görselleri uygulamaya yerel dosya olarak eklendi. Cumhuriyet Camii ve Hakkı Atamulu Kültür Parkı için gezi öncesinde geçici kaynak görselleri kullanılıyor; gezi sonrasında öğrencilerin çektiği fotoğraflarla değiştirilecek.</div>
      <button class="primary-btn" id="richMissionBtn">${isLive()?'Keşif Görevine Geç →':'Gezi Günü Görev Açılacak 🔒'}</button>
    </div>`;
    document.querySelector('#richListen').onclick=()=>speakText(d.narration);
    document.querySelector('#richStop').onclick=stopGuide;
    document.querySelector('#richMissionBtn').onclick=()=>renderRichStop(id,'mission');
    return;
  }

  if(tab==='mission' && !isLive()){
    body.innerHTML=`<div class="locked-panel"><h3>🔐 ${d.title} görevi gezi günü açılacak</h3><p>Şimdilik görevin konusunu görebilirsin; işaretleme ve ilerleme kaydı Gezi Modu açılınca etkinleşecek.</p><ul>${d.mission.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
    return;
  }

  if(tab==='mission' && isLive()){
    const saved=state.richMission[id] || {};
    body.innerHTML=`<div class="mission"><h3>🔎 ${d.title.toUpperCase()} KEŞİF GÖREVİ</h3><div class="mission-body">
      <p><strong>Aşağıdaki üç görevi yerinde tamamla.</strong></p>
      ${d.mission.map((x,i)=>`<label class="check-row"><input type="checkbox" data-rich-mission="${i}" ${saved[i]?'checked':''}><span>${x}</span></label>`).join('')}
      <button class="primary-btn" id="richMissionDone">Görevimi Tamamladım ✓</button>
    </div></div>`;
    document.querySelectorAll('[data-rich-mission]').forEach(c=>c.onchange=()=>{
      state.richMission[id] ??= {};
      state.richMission[id][c.dataset.richMission]=c.checked;
      save();
    });
    document.querySelector('#richMissionDone').onclick=()=>{
      const count=Object.values(state.richMission[id]||{}).filter(Boolean).length;
      if(count<3){ say('Üç görevi de tamamla.'); return; }
      say('Keşif görevi tamamlandı!');
      renderRichStop(id,'quiz');
    };
    return;
  }

  if(tab==='quiz' && !isLive()){
    body.innerHTML=`<div class="locked-panel"><h3>🏆 Mini Test Gezi Günü Açılacak</h3><p>Bilgileri şimdi okuyabilirsin; test, mekânı yerinde gördükten sonra cevaplanacak.</p></div>`;
    return;
  }

  if(tab==='quiz' && isLive()){
    body.innerHTML=`<div class="quiz-card"><h3>${d.title} • Mini Test</h3>
      ${d.quiz.map((q,qi)=>`<div class="question" style="${qi?'margin-top:18px':''}">${qi+1}. ${q.q}</div>${q.opts.map((x,oi)=>`<label class="choice"><input type="radio" name="${id}q${qi}" value="${oi}">${x}</label>`).join('')}`).join('')}
      <button class="primary-btn" id="richQuizDone">${done?'Cevapları Yeniden Kontrol Et':'Cevapları Kontrol Et'}</button>
    </div>`;
    document.querySelector('#richQuizDone').onclick=()=>{
      let score=0;
      for(let qi=0;qi<d.quiz.length;qi++){
        const picked=document.querySelector(`input[name="${id}q${qi}"]:checked`);
        if(!picked){ say('Tüm soruları cevapla.'); return; }
        if(Number(picked.value)===d.quiz[qi].correct) score++;
      }
      state.richQuiz[id]=score;
      complete(id);
      save();
      say(`Mini test: ${score}/${d.quiz.length} doğru • Durak tamamlandı`);
      setTimeout(renderRoute,650);
    };
  }
}

function renderSimpleStop(id){
  const s=stops.find(x=>x.id===id);
  const prompts={church:'Bu yapının günümüze ulaşması sana kültürel mirası koruma konusunda ne düşündürüyor?',lunch:'Birlikte yemek yemek ve paylaşmak, yardımlaşma değerini nasıl güçlendirir?',mosque:'Tarihî bir yapının toplumun hafızasındaki yeri sence neden önemlidir?',park:'Sanat ve estetik, bir şehrin kimliğine nasıl katkı sağlar?'};
  app.innerHTML=`<section class="screen"><div class="page-title"><div class="eyebrow">📍 Gezi Durağı</div><h2>${s.title}</h2><p>${s.sub}</p></div>
  ${modeBanner()}
  <div class="note-card"><h3>Düşünme Sorusu</h3><p>${prompts[id]}</p>
  ${isLive()
    ? `<textarea class="textarea" id="stopNote" maxlength="220" placeholder="Kısa düşünceni yazabilirsin…"></textarea><button class="primary-btn" id="finishStop">${state.completed.includes(id)?'Durağı Yeniden İncele ✓':'Bu Durağı Tamamla ✓'}</button>`
    : `<div class="locked-panel inline"><strong>🔒 Cevap alanı gezi günü açılacak.</strong><p>Şimdilik soruyu düşün; cevabını mekânı gördükten sonra yaz.</p></div>`}
  </div></section>`;
  if(document.querySelector('#finishStop')) document.querySelector('#finishStop').onclick=()=>{complete(id);say('Durak tamamlandı. İstediğin zaman tekrar açabilirsin.');setTimeout(renderRoute,500)};
}

function renderReflection(){
  app.innerHTML=`<section class="screen"><div class="page-title"><div class="eyebrow">❤️ Gezi Sonu</div><h2>Değerlerimin İzinde Derinkuyu</h2><p>Bugünkü yolculuğu tek bir düşüncede buluşturalım.</p></div>
  ${modeBanner()}
  <div class="note-card"><h3>Derinkuyu’dan Kalan Cümlem</h3><p>“Bugünkü gezi bana … düşündürdü.”</p>
  ${isLive()
    ? `<textarea class="textarea" id="finalNote" maxlength="240" placeholder="Tek cümleyle yaz…">${state.note||''}</textarea><button class="primary-btn" id="saveFinal">Geziyi Tamamla 🏆</button>`
    : `<div class="locked-panel inline"><strong>🔒 Gezi sonu değerlendirmesi gezi günü açılacak.</strong><p>Bu bölüm, tüm durakları yerinde gördükten sonra doldurulacak.</p></div>`}
  </div></section>`;
  if(document.querySelector('#saveFinal')) document.querySelector('#saveFinal').onclick=()=>{const v=document.querySelector('#finalNote').value.trim();if(v.length<8){say('Biraz daha açıklayıcı bir cümle yaz.');return;}state.note=v;complete('reflection');save();say('Tebrikler! Derinkuyu yolculuğu tamamlandı.');setTimeout(renderRoute,700)};
}


const valueOptions = ['Yardımlaşma','Güven','Sorumluluk','Sabır','Dayanışma'];
const visitedPlaces = ['Derinkuyu Yeraltı Şehri','Üzümlü Kilise','Cumhuriyet Camii','Hakkı Atamulu Kültür Parkı'];

function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function valueCardCount(){
  const v=state.valueCard;
  return [
    v.q1.trim(),
    v.q2.length ? 'x':'',
    v.q3.trim(),
    v.q4.trim(),
    v.q5,
    v.q6.trim(),
    v.q7.trim(),
    v.q8.trim(),
    v.oneSentence.trim(),
    v.selfEval
  ].filter(Boolean).length;
}
function saveValueField(field, value){
  state.valueCard[field]=value;
  state.valueCardComplete=valueCardCount()===10;
  state.valueCardSubmitted=false;
  save();
  const meter=document.querySelector('#valueMeterText');
  const fill=document.querySelector('#valueMeterFill');
  if(meter) meter.textContent=`${valueCardCount()}/10`;
  if(fill) fill.style.width=`${valueCardCount()*10}%`;
}
function bindValueCardAutosave(){
  document.querySelectorAll('[data-vtext]').forEach(el=>{
    el.addEventListener('input',()=>saveValueField(el.dataset.vtext,el.value));
  });
  document.querySelectorAll('[data-vradio]').forEach(el=>{
    el.addEventListener('change',()=>saveValueField(el.dataset.vradio,el.value));
  });
  document.querySelectorAll('[data-vcheck]').forEach(el=>{
    el.addEventListener('change',()=>{
      const selected=[...document.querySelectorAll('[data-vcheck]:checked')].map(x=>x.value);
      saveValueField('q2',selected);
    });
  });
}
function valueCardPayload(){
  const v=state.valueCard;
  return {
    participant_code: state.participantCode,
    school: v.school || null,
    grade: v.grade || null,
    q1_most_impressive: v.q1,
    q2_values: v.q2,
    q3_helping_example: v.q3,
    q4_safety_measure: v.q4,
    q5_most_memorable_place: v.q5,
    q6_why_protect_heritage: v.q6,
    q7_key_learning: v.q7,
    q8_theme_reflection: v.q8,
    one_sentence_derinkuyu: v.oneSentence,
    self_evaluation: v.selfEval,
    trip_date: '2026-11-25',
    submitted_at: new Date().toISOString()
  };
}
async function submitValueCard(){
  if(valueCardCount()<10){
    say('Göndermeden önce Değer Kartındaki tüm bölümleri tamamla.');
    return;
  }
  const cfg=window.DERINKUYU_CONFIG || {};
  if(!cfg.supabaseUrl || !cfg.supabaseAnonKey){
    state.valueCardComplete=true;
    save();
    say('Kart cihazda kaydedildi. Merkezi gönderim portal bağlantısından sonra açılacak.');
    const status=document.querySelector('#submitStatus');
    if(status) status.innerHTML='<strong>✓ Cihazda kaydedildi.</strong><span>Merkezi cevap toplama bağlantısı henüz yapılandırılmadı.</span>';
    return;
  }
  const btn=document.querySelector('#submitValueCard');
  if(btn){ btn.disabled=true; btn.textContent='Gönderiliyor…'; }
  try{
    const table=cfg.responsesTable || 'derinkuyu_deger_karti';
    const url=`${cfg.supabaseUrl.replace(/\/$/,'')}/rest/v1/${table}`;
    const res=await fetch(url,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':cfg.supabaseAnonKey,
        'Authorization':`Bearer ${cfg.supabaseAnonKey}`,
        'Prefer':'return=minimal'
      },
      body:JSON.stringify(valueCardPayload())
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    state.valueCardSubmitted=true;
    state.valueCardSubmittedAt=new Date().toISOString();
    state.valueCardComplete=true;
    save();
    say('Değer Kartın başarıyla gönderildi.');
    renderTasks();
  }catch(err){
    console.error(err);
    say('Gönderilemedi. Cevapların cihazda kayıtlı; internet gelince tekrar dene.');
    const status=document.querySelector('#submitStatus');
    if(status) status.innerHTML='<strong>⚠ Gönderim bekliyor.</strong><span>Cevapların bu cihazda korunuyor; bağlantı geldiğinde tekrar deneyebilirsin.</span>';
  }finally{
    if(btn){ btn.disabled=false; btn.textContent='Değer Kartımı Gönder →'; }
  }
}

function renderTasks(){
  document.body.setAttribute('data-view','tasks');
  const v=state.valueCard;
  const count=valueCardCount();
  if(!isLive()){
    app.innerHTML=`<section class="screen">
      <div class="page-title"><div class="eyebrow">📝 Değer Kartım</div><h2>Gezi ve Değer Kartı</h2><p>25 Kasım 2026 • Tema: Yardımlaşma ve Güven</p></div>
      ${modeBanner()}
      <div class="valuecard-preview">
        <div class="valuecard-preview-icon">🧭</div>
        <h3>Bu bölüm gezi günü aktif olacak</h3>
        <p>Gezi sırasında gözlemlerini kaydedecek, ziyaret ettiğimiz yerleri değerlerle ilişkilendirecek ve gezi sonunda kendi değerlendirmene ulaşacaksın.</p>
        <div class="preview-questions">
          <span>1–4 • Gezerken Gözlemle</span>
          <span>5–8 • Değerlerin İzinde Derinkuyu</span>
          <span>✓ • Tek Cümleyle Derinkuyu ve Öz Değerlendirme</span>
        </div>
        <button class="secondary-btn" id="taskUnlock">🔐 Gezi Modunu Aç</button>
      </div>
    </section>`;
    document.querySelector('#taskUnlock').onclick=unlockTrip;
    return;
  }

  app.innerHTML=`<section class="screen valuecard-screen">
    <div class="page-title">
      <div class="eyebrow">📝 DEĞERLERİMLE ADIM ADIM</div>
      <h2>Derinkuyu Gezi ve Değer Kartı</h2>
      <p>25 Kasım 2026 • Yardımlaşma ve Güven</p>
    </div>
    ${modeBanner()}

    <div class="valuecard-id">
      <div><small>Anonim katılımcı kodun</small><strong>${state.participantCode}</strong></div>
      <span>Ad-soyad istenmez</span>
    </div>

    <div class="valuecard-meter">
      <div><strong>Kart ilerlemen</strong><span id="valueMeterText">${count}/10</span></div>
      <div class="progress-track"><div class="progress-fill" id="valueMeterFill" style="width:${count*10}%"></div></div>
      <small>Cevapların yazarken otomatik olarak bu cihazda kaydedilir.</small>
    </div>

    <section class="valuecard-section">
      <div class="valuecard-section-title"><span>👁</span><div><strong>Gezerken Gözlemle</strong><small>Gördüğünü değerlerle ilişkilendir.</small></div></div>

      <label class="vc-field">
        <span class="vc-no">1</span>
        <strong>Derinkuyu Yeraltı Şehri’nde seni en çok etkileyen bölüm hangisiydi? Neden?</strong>
        <textarea data-vtext="q1" maxlength="500" placeholder="Kendi cümlenle yaz…">${escapeHtml(v.q1)}</textarea>
      </label>

      <div class="vc-field">
        <div class="vc-question"><span class="vc-no">2</span><strong>Yeraltı şehrinde insanların birlikte yaşayabilmeleri için hangi değerlere ihtiyaç duyduklarını düşünüyorsun?</strong></div>
        <div class="vc-chip-grid">${valueOptions.map(x=>`<label class="vc-chip"><input type="checkbox" data-vcheck value="${x}" ${v.q2.includes(x)?'checked':''}><span>${x}</span></label>`).join('')}</div>
      </div>

      <label class="vc-field">
        <span class="vc-no">3</span>
        <strong>Yeraltı şehrinde “yardımlaşma” değerini hatırlatan bir yapı, bölüm veya uygulama yaz.</strong>
        <textarea data-vtext="q3" maxlength="400" placeholder="Gözlemlediğin örnek…">${escapeHtml(v.q3)}</textarea>
      </label>

      <label class="vc-field">
        <span class="vc-no">4</span>
        <strong>İnsanların kendilerini güvende hissetmeleri için geçmişte alınan tedbirlerden bir örnek ver.</strong>
        <textarea data-vtext="q4" maxlength="400" placeholder="Bir güvenlik önlemi…">${escapeHtml(v.q4)}</textarea>
      </label>
    </section>

    <section class="valuecard-section">
      <div class="valuecard-section-title"><span>🧩</span><div><strong>Değerlerin İzinde Derinkuyu</strong><small>Gezinin tamamını değerlendir.</small></div></div>

      <div class="vc-field">
        <div class="vc-question"><span class="vc-no">5</span><strong>Bugün ziyaret ettiğimiz yerlerden hangisi sende en fazla iz bıraktı?</strong></div>
        <div class="vc-radio-list">${visitedPlaces.map(x=>`<label><input type="radio" name="q5" data-vradio="q5" value="${x}" ${v.q5===x?'checked':''}><span>${x}</span></label>`).join('')}</div>
      </div>

      <label class="vc-field">
        <span class="vc-no">6</span>
        <strong>Kültürel mirasımızı korumak neden önemlidir?</strong>
        <textarea data-vtext="q6" maxlength="500" placeholder="Düşünceni yaz…">${escapeHtml(v.q6)}</textarea>
      </label>

      <label class="vc-field">
        <span class="vc-no">7</span>
        <strong>Bugün öğrendiğim ve arkadaşlarıma anlatmak istediğim en önemli bilgi:</strong>
        <textarea data-vtext="q7" maxlength="500" placeholder="En önemli öğrendiğin bilgi…">${escapeHtml(v.q7)}</textarea>
      </label>

      <label class="vc-field">
        <span class="vc-no">8</span>
        <strong>“Yardımlaşma ve Güven” teması bana şunu düşündürdü:</strong>
        <textarea data-vtext="q8" maxlength="500" placeholder="Bu tema sana ne düşündürdü?">${escapeHtml(v.q8)}</textarea>
      </label>
    </section>

    <section class="valuecard-section vc-highlight">
      <div class="valuecard-section-title"><span>✍️</span><div><strong>Tek Cümleyle Derinkuyu</strong><small>Kendi cümleni tamamla.</small></div></div>
      <label class="vc-sentence">
        <span>“Derinkuyu benim için</span>
        <input type="text" data-vtext="oneSentence" maxlength="160" value="${escapeHtml(v.oneSentence)}" placeholder="… demektir.">
        <span>demektir.”</span>
      </label>
    </section>

    <section class="valuecard-section">
      <div class="valuecard-section-title"><span>⭐</span><div><strong>Gezi Sonu Kendimi Değerlendiriyorum</strong></div></div>
      <div class="vc-selfeval">
        ${[
          ['Çok şey öğrendim','🌟'],
          ['Biraz öğrendim','🙂'],
          ['Daha çok öğrenmek istiyorum','🔎']
        ].map(([x,icon])=>`<label><input type="radio" name="selfEval" data-vradio="selfEval" value="${x}" ${v.selfEval===x?'checked':''}><span><b>${icon}</b>${x}</span></label>`).join('')}
      </div>
    </section>

    <section class="valuecard-section vc-optional">
      <div class="valuecard-section-title"><span>🏫</span><div><strong>İsteğe Bağlı Bilgi</strong><small>Kişisel isim bilgisi alınmaz.</small></div></div>
      <label class="vc-field compact"><strong>Okul</strong><input type="text" data-vtext="school" maxlength="120" value="${escapeHtml(v.school)}" placeholder="İstersen okulunu yaz"></label>
      <label class="vc-field compact"><strong>Sınıf düzeyi</strong>
        <select data-vradio="grade">
          <option value="">Seçmek zorunlu değil</option>
          ${['5','6','7','8','9','10','11','12'].map(x=>`<option value="${x}" ${v.grade===x?'selected':''}>${x}. sınıf</option>`).join('')}
        </select>
      </label>
    </section>

    <div class="valuecard-submit">
      <div class="submit-status ${state.valueCardSubmitted?'sent':''}" id="submitStatus">
        ${state.valueCardSubmitted
          ? `<strong>✅ Değer Kartın gönderildi.</strong><span>${new Date(state.valueCardSubmittedAt).toLocaleString('tr-TR')}</span>`
          : `<strong>${count===10?'✓ Kartın tamamlandı.':'Kartın henüz tamamlanmadı.'}</strong><span>${count===10?'Göndermeye hazırsın.':'Tüm ana bölümleri tamamladığında gönderebilirsin.'}</span>`}
      </div>
      <button class="primary-btn" id="submitValueCard" ${state.valueCardSubmitted?'disabled':''}>${state.valueCardSubmitted?'Gönderildi ✓':'Değer Kartımı Gönder →'}</button>
      <small class="privacy-note">Cevaplar yalnızca gezi değerlendirmesi için kullanılacaktır. Ad-soyad toplanmaz.</small>
    </div>
  </section>`;

  bindValueCardAutosave();
  document.querySelector('#submitValueCard').onclick=submitValueCard;
}

function renderAbout(){
  document.body.setAttribute('data-view','about');
  app.innerHTML=`<section class="screen about-screen">
    <div class="page-title">
      <div class="eyebrow">NEVŞEHİR ÇEDES DİJİTAL</div>
      <h2>Uygulama Hakkında</h2>
      <p>Değerlerimle Adım Adım • Kültürel Miras Yolculuğu</p>
    </div>
    <div class="about-card">
      <img src="assets/cedes-logo.jpg" alt="ÇEDES resmî logosu">
      <p>Bu dijital gezi rehberi, Nevşehir İl Millî Eğitim Müdürlüğü ÇEDES İl Koordinatörlüğü tarafından “Değerlerimle Adım Adım – Kültürel Miras Yolculuğu” kapsamında hazırlanmıştır.</p>
      <div class="about-meta"><strong>Derinkuyu</strong><span>25 Kasım 2026</span><span>Yardımlaşma • Güven</span></div>
    </div>
  </section>`;
}

function renderInfo(){
  document.body.setAttribute('data-view','info');
  app.innerHTML=`<section class="screen">
    <div class="page-title"><div class="eyebrow">📚 Dijital Tur Rehberi</div><h2>Bilgi Köşesi</h2><p>Gezilen yerleri tarihî ve kültürel yönleriyle tekrar inceleyebilirsin.</p></div>
    <div class="guide-index visual-guide-index">
      <button class="guide-place guide-place-photo featured" data-guide-open="underground">
        <div class="guide-thumb">${resilientImage(verifiedImages.undergroundRoom.primary,verifiedImages.undergroundRoom.alternate,"Derinkuyu Yeraltı Şehri")}</div>
        <div class="guide-place-copy"><strong>Derinkuyu Yeraltı Şehri</strong><small>Çok katlı yaşam sistemi • güvenlik • havalandırma</small></div><b>İncele →</b>
      </button>
      <button class="guide-place guide-place-photo featured" data-guide-open="church">
        <div class="guide-thumb">${resilientImage(verifiedImages.churchExterior.primary,verifiedImages.churchExterior.alternate,"Üzümlü Kilise")}</div>
        <div class="guide-place-copy"><strong>Üzümlü Kilise</strong><small>1858 • taş işçiliği • kültürel miras</small></div><b>İncele →</b>
      </button>
      <button class="guide-place guide-place-photo featured" data-guide-open="mosque">
        <div class="guide-thumb"><img src="https://fibhabercom.teimg.com/fibhaber-com/uploads/2025/12/588918383-18099557470762878-4536720303613962268-n.jpg" alt="Cumhuriyet Camii – geçici kaynak görseli" onerror="this.src='assets/photo-placeholder.svg'"></div>
        <div class="guide-place-copy"><strong>Cumhuriyet Camii</strong><small>Baş Melekler Kilisesi’nden günümüze • ortak miras</small></div><b>İncele →</b>
      </button>
      <button class="guide-place guide-place-photo featured" data-guide-open="park">
        <div class="guide-thumb"><img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/cf/8e/9e/park-girisi.jpg?h=1200&s=1&w=1200" alt="Hakkı Atamulu Kültür Parkı – geçici kaynak görseli" onerror="this.src='assets/photo-placeholder.svg'"></div>
        <div class="guide-place-copy"><strong>Hakkı Atamulu Kültür Parkı</strong><small>Sanat • şehir kültürü • ortak emek</small></div><b>İncele →</b>
      </button>
    </div>
    <section class="about-app-card">
      <div class="about-app-head">
        <span>◉</span>
        <div><strong>Uygulama Hakkında</strong><small>Nevşehir ÇEDES Dijital Eğitim Çalışması</small></div>
      </div>
      <p>Bu dijital gezi rehberi, Nevşehir İl Millî Eğitim Müdürlüğü ÇEDES İl Koordinatörlüğü tarafından “Değerlerimle Adım Adım – Kültürel Miras Yolculuğu” kapsamında hazırlanmıştır.</p>
      <div class="about-app-footer">Nevşehir İl Millî Eğitim Müdürlüğü • ÇEDES İl Koordinatörlüğü • 2026</div>
    </section>
    <div class="fact-list">
      <div class="fact"><h3>Yardımlaşma</h3><p>Bir topluluğun güçlükleri birlikte aşabilmesi, ortak sorumluluk alması ve birbirini desteklemesidir.</p></div>
      <div class="fact"><h3>Güven</h3><p>Birlikte yaşamın temelidir. Söz, sorumluluk ve karşılıklı saygıyla güçlenir.</p></div>
      <div class="fact"><h3>Kültürel Miras</h3><p>Geçmişten devraldığımız tarihî, kültürel ve sanatsal değerleri tanımak ve korumak ortak sorumluluğumuzdur.</p></div>
      <div class="fact"><h3>Gezi Kuralı</h3><p>Tarihî alanlara zarar vermeden hareket et; rehber ve öğretmen yönlendirmelerine uy; grup düzenini koru.</p></div>
    </div>
  </section>`;
  document.querySelectorAll('[data-guide-open]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.guideOpen;
    if(id==='underground') renderUnderground();
    else renderRichStop(id);
  });
}

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
go('home');
