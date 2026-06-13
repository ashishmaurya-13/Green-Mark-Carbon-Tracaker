// ═══════════════════════════════════
// STEP 1 — DATA SAVE KARO
// ═══════════════════════════════════

function saveAndCalculate() {

  // Form se values lo
  const electricity = parseFloat(document.getElementById('electricity').value) || 0;
  const generator   = parseFloat(document.getElementById('generator').value)   || 0;
  const delivery    = parseFloat(document.getElementById('delivery').value)    || 0;
  const vehicle     = parseFloat(document.getElementById('vehicle').value)     || 0.21;
  const packaging   = parseFloat(document.getElementById('packaging').value)   || 0;

  // CO2 calculate karo
  // (emission factors — standard values hain)
  const co2Electricity = electricity * 0.82;  // 0.82 kg CO2 per kWh
  const co2Generator   = generator   * 2.1;   // 2.1 kg CO2 per hour
  const co2Delivery    = delivery    * vehicle; // vehicle factor
  const co2Packaging   = packaging   * 1.5;   // 1.5 kg CO2 per kg plastic
  const totalCO2       = co2Electricity + co2Generator + co2Delivery + co2Packaging;

  // GreenScore calculate karo (0-100)
  let greenScore;
  if      (totalCO2 < 40)  greenScore = 95;
  else if (totalCO2 < 60)  greenScore = 85;
  else if (totalCO2 < 80)  greenScore = 75;
  else if (totalCO2 < 100) greenScore = 65;
  else if (totalCO2 < 130) greenScore = 50;
  else                     greenScore = 35;

  // Sab data ek object mein daalo
  const result = {
    electricity, generator, delivery, packaging,
    co2Electricity: co2Electricity.toFixed(1),
    co2Generator:   co2Generator.toFixed(1),
    co2Delivery:    co2Delivery.toFixed(1),
    co2Packaging:   co2Packaging.toFixed(1),
    totalCO2:       totalCO2.toFixed(1),
    greenScore
  };

  // localStorage mein save karo
  // (yeh browser ki memory hai — backend nahi hai)
  localStorage.setItem('greenmarkData', JSON.stringify(result));

  // Dashboard pe bhejo
  window.location.href = 'dashboard.html';
}


// ═══════════════════════════════════
// STEP 2 — DASHBOARD MEIN DATA DIKHAO
// ═══════════════════════════════════

// function loadDashboard() {
//   // localStorage se data wapas lo
//   const data = JSON.parse(localStorage.getItem('greenmarkData'));

//   // Agar data nahi hai toh form pe bhejo
//   if (!data) {
//     window.location.href = 'input.html';
//     return;
//   }

//   // HTML mein dikhao
//   document.getElementById('total-co2').innerText   = data.totalCO2 + ' kg';
//   document.getElementById('green-score').innerText  = data.greenScore;
//   document.getElementById('elec-co2').innerText     = data.co2Electricity + ' kg';
//   document.getElementById('delivery-co2').innerText = data.co2Delivery + ' kg';
//   document.getElementById('pack-co2').innerText     = data.co2Packaging + ' kg';

//   // Score ring color update karo
//   const ring = document.getElementById('score-ring');
//   if (data.greenScore >= 80) ring.style.background = '#2ECC71'; // green
//   else if (data.greenScore >= 60) ring.style.background = '#F39C12'; // orange  
//   else ring.style.background = '#E74C3C'; // red
// }
function loadDashboard() {

  // localStorage se data lo
  const data = JSON.parse(localStorage.getItem('greenmarkData'));
  if (!data) {
    window.location.href = 'input.html';
    return;
  }

  // ── Numbers dikhao ──
  document.getElementById('total-co2').innerText    = data.totalCO2 + ' kg';
  document.getElementById('green-score').innerText  = data.greenScore;
  document.getElementById('elec-co2').innerText     = data.co2Electricity + ' kg';
  document.getElementById('delivery-co2').innerText = data.co2Delivery + ' kg';
  document.getElementById('pack-co2').innerText     = data.co2Packaging + ' kg';

  // ── Breakdown values ──
  document.getElementById('bval-elec').innerText = data.co2Electricity + ' kg';
  document.getElementById('bval-del').innerText  = data.co2Delivery + ' kg';
  document.getElementById('bval-pack').innerText = data.co2Packaging + ' kg';

  // ── Progress bars animate karo ──
  const total = parseFloat(data.totalCO2);
  setTimeout(() => {
    document.getElementById('bar-elec').style.width =
      ((data.co2Electricity / total) * 100) + '%';
    document.getElementById('bar-del').style.width  =
      ((data.co2Delivery / total) * 100) + '%';
    document.getElementById('bar-pack').style.width =
      ((data.co2Packaging / total) * 100) + '%';
  }, 200);

  // ── Score ring color ──
  const ring = document.getElementById('score-ring');
  const grade = document.getElementById('score-grade');
  const compare = document.getElementById('score-compare');

  if (data.greenScore >= 80) {
    ring.style.background = '#2ECC71';
    grade.innerText = '⭐ Excellent!';
    compare.innerText = 'Top 20% businesses mein ho!';
  } else if (data.greenScore >= 60) {
    ring.style.background = '#d9f312';
    grade.innerText = '👍 Good Performance';
    compare.innerText = 'Top 45% businesses mein ho!';
  } else {
    ring.style.background = '#E74C3C';
    grade.innerText = '⚠️ Needs Improvement';
    compare.innerText = 'Suggestions follow karo!';
  }

  // ── Bar Chart — Chart.js use hoga yahan ──
  // Fake weekly data — real app mein database se aayega
  const weeklyData = [65, 72, 58, 80, 68, 55, parseFloat(data.totalCO2)];

  new Chart(document.getElementById('weeklyChart'), {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
      datasets: [{
        label: 'CO2 (kg)',
        data: weeklyData,
        backgroundColor: weeklyData.map((val, i) =>
          i === 6 ? '#97BC62' : '#3D7A3E'
        ),
        borderRadius: 6
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#E8F4E8' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ═══════════════════════════════════
// STEP 3 — SUGGESTIONS LOGIC
// ═══════════════════════════════════

function loadSuggestions() {

  const data = JSON.parse(localStorage.getItem('greenmarkData'));
  if (!data) { window.location.href = 'input.html'; return; }

  // ── Tips define karo — condition ke saath ──
  const allTips = [
    {
      condition: parseFloat(data.co2Electricity) > 30,
      icon: '💡',
      title: 'Switch to LED Lighting',
      desc: 'Teri electricity usage industry average se zyada hai. LED lights lagane se 60% consumption kam hoga — same brightness, kam bill.',
      money: 'Rs.2,400/month bachega',
      co2: '8kg CO2 less/day',
      level: 'High Impact',
      levelColor: '#E74C3C',
      bgColor: '#FFF3E0'
    },
    {
      condition: parseFloat(data.co2Delivery) > 12,
      icon: '🗺️',
      title: 'Optimize Delivery Route',
      desc: 'Delivery kms zyada hain. Stop order change karke 22km daily bachao. Nearby areas ek hi din mein cover karo.',
      money: 'Rs.1,800/month bachega',
      co2: '12% fuel cut',
      level: 'High Impact',
      levelColor: '#E74C3C',
      bgColor: '#E8F8E8'
    },
    {
      condition: parseFloat(data.co2Packaging) > 5,
      icon: '📦',
      title: 'Eco Packaging Switch Karo',
      desc: 'EcoWrap supplier GreenMark directory mein verified hai. Kraft paper packaging same price mein milti hai.',
      money: 'Same cost',
      co2: '60% less plastic',
      level: 'Medium Impact',
      levelColor: '#F39C12',
      bgColor: '#FFF8E6'
    },
    {
      condition: true, // Yeh hamesha show hoga
      icon: '☀️',
      title: 'PM Surya Ghar Solar Subsidy',
      desc: 'Government 40% subsidy de rahi hai rooftop solar pe. Teri electricity usage ke hisaab se 18 months mein ROI milega.',
      money: 'Rs.4,200/month bachega',
      co2: '80% electricity CO2 cut',
      level: 'Long Term',
      levelColor: '#2C5F2D',
      bgColor: '#FFFDE7'
    }
  ];

  // Sirf woh tips jo condition match karti hain
  const activeTips = allTips.filter(tip => tip.condition);

  // ── Summary calculate karo ──
  let totalSaving = 0;
  let totalCO2Cut = 0;

  if (parseFloat(data.co2Electricity) > 30) {
    totalSaving += 2400;
    totalCO2Cut += 8;
  }
  if (parseFloat(data.co2Delivery) > 12) {
    totalSaving += 1800;
    totalCO2Cut += 5;
  }

  document.getElementById('potential-saving').innerText =
    'Rs.' + totalSaving.toLocaleString() + '/mo';
  document.getElementById('co2-reduction').innerText =
    totalCO2Cut + 'kg/day';
  document.getElementById('tips-count').innerText =
    activeTips.length;

  // ── HTML render karo — template literal ──
  const container = document.getElementById('tips-container');

  container.innerHTML = activeTips.map(tip => `
    <div class="tip-card" style="border-left: 4px solid ${tip.levelColor};">

      <div class="tip-header">
        <span class="tip-icon" 
              style="background:${tip.bgColor}">
          ${tip.icon}
        </span>
        <div>
          <span class="tip-level" 
                style="background:${tip.levelColor}20; 
                       color:${tip.levelColor};">
            ${tip.level}
          </span>
          <h3 class="tip-title">${tip.title}</h3>
        </div>
      </div>

      <p class="tip-desc">${tip.desc}</p>

      <div class="tip-pills">
        <span class="pill gold">💰 ${tip.money}</span>
        <span class="pill green">🌿 ${tip.co2}</span>
      </div>

    </div>
  `).join('');
}
// ═══════════════════════════════════
// STEP 4 — CERTIFICATE LOAD
// ═══════════════════════════════════

function loadCertificate() {


  // USER NAME LOAD
  const userName = localStorage.getItem("greenmarkUser");

  if(userName){

    document.getElementById("cert-business").innerText = userName;

  }
  else{

    document.getElementById("cert-business").innerText = "GreenMark User";

  }

document.getElementById("user-name").innerText =
localStorage.getItem("greenmarkUser");

  // DATA LOAD

  const data = JSON.parse(localStorage.getItem('greenmarkData'));

  if(!data){

    window.location.href = "input.html";
    return;

  }



  // SCORE

  document.getElementById("cert-score-num").innerText =
  data.greenScore;


  document.getElementById("cert-co2").innerText =
  data.totalCO2 + " kg";



  const circle =
  document.getElementById("cert-circle");


  const grade =
  document.getElementById("cert-grade");


  const rank =
  document.getElementById("cert-rank");



  if(data.greenScore >= 80){


    circle.style.background =
    `conic-gradient(
    #2ECC71 0% ${data.greenScore}%,
    #E8F4E8 ${data.greenScore}% 100%)`;


    grade.innerText =
    "⭐ Excellent Performance";


    rank.innerText =
    "Top 20% businesses mein!";


  }

  else if(data.greenScore >= 60){


    circle.style.background =
    `conic-gradient(
    #F39C12 0% ${data.greenScore}%,
    #E8F4E8 ${data.greenScore}% 100%)`;


    grade.innerText =
    "👍 Good Performance";


    rank.innerText =
    "Top 45% businesses mein!";


  }


  else{


    circle.style.background =
    `conic-gradient(
    #E74C3C 0% ${data.greenScore}%,
    #E8F4E8 ${data.greenScore}% 100%)`;


    grade.innerText =
    "⚠️ Needs Improvement";


    rank.innerText =
    "Suggestions follow karo!";

  }





  // DATE

  let today = new Date();


  document.getElementById("cert-date").innerText =
  today.toLocaleDateString("en-IN");



  document.getElementById("cert-validity").innerText =
  "Jan 2026 - Dec 2026";




  // CERTIFICATE ID

  document.getElementById("cert-id").innerText =
  "GM-2026-" +
  Math.random()
  .toString(36)
  .substring(2,6)
  .toUpperCase();


}



// ═══════════════════════════════════
// USER NAME SAVE
// ═══════════════════════════════════


function setName(){


 let name =
 document.getElementById("userNameInput").value.trim();



 if(name === ""){

  alert("Please enter business name");

  return;

 }



 localStorage.setItem(
 "greenmarkUser",
 name
 );



 document.getElementById(
 "cert-business"
 ).innerText = name;



 alert("Name saved successfully ✅");


}




// ═══════════════════════════════════
// DOWNLOAD CERTIFICATE
// ═══════════════════════════════════


function downloadCertificate(){


 const card =
 document.getElementById("certificate-card");


 html2canvas(card,{
   scale:2,
   backgroundColor:"#ffffff",
   useCORS:true

 }).then(canvas=>{


 const image =
 canvas.toDataURL("image/png");


 const link =
 document.createElement("a");


 link.download =
 "GreenMark_Certificate.png";


 link.href=image;


 link.click();



 });


}
async function getAIResponse() {
  const input = document.getElementById("userInput").value;

  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: input })
  });

  const data = await res.json();

  document.getElementById("result").innerText = data.result;
}console.log("PAGE LOADED");