/* =====================================================================
   ALAGAR PUBLIC SCHOOL — Classic theme chrome + interactions
   ===================================================================== */
(function () {
  "use strict";
  var CURRENT = (window.ALAGAR_PAGE || "home");
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "about", label: "About Us", href: "about.html", items: [
      ["Origin of the School", "about.html#origin"],
      ["Vision & Mission", "about.html#vision"],
      ["Message from Chairman", "about.html#chairman"],
      ["Message from Correspondent", "about.html#correspondent"],
      ["Message from Principal", "about.html#principal"],
      ["Mandatory Disclosure", "about.html#disclosure"],
      ["Annual Report", "about.html#annual-report"]
    ]},
    { id: "academics", label: "Academics", href: "academics.html", items: [
      ["Foundation Years (Nursery–Gr 2)", "academics.html#foundation"],
      ["Discoverers (Grade 3–5)", "academics.html#discoverers"],
      ["Innovators (Grade 6–8)", "academics.html#innovators"],
      ["Trailblazers (Grade 9–12)", "academics.html#trailblazers"],
      ["Student Council", "academics.html#student-council"],
      ["Book List", "academics.html#book-list"]
    ]},
    { id: "admission", label: "Admission", href: "admission.html", items: [
      ["Admission Procedure", "admission.html#procedure"],
      ["Rules and Regulations", "admission.html#rules"],
      ["Examination", "admission.html#examination"],
      ["TC Issued Details", "admission.html#tc"]
    ]},
    { id: "resources", label: "Resources", href: "resources.html", items: [
      ["Facilities", "resources.html#facilities"],
      ["School Transport", "resources.html#transport"],
      ["New Initiatives", "resources.html#initiatives"],
      ["Field Trips & Camps", "resources.html#field-trips"]
    ]},
    { id: "student-life", label: "Student Life", href: "student-life.html", items: [
      ["Activities", "student-life.html#activities"],
      ["Competitions", "student-life.html#competitions"],
      ["Achievement", "student-life.html#achievement"],
      ["Gallery", "student-life.html#gallery"]
    ]},
    { id: "news-events", label: "News & Events", href: "news-events.html", items: [
      ["Latest News", "news-events.html#news"],
      ["Calendar", "news-events.html#calendar"],
      ["Circulars", "news-events.html#circulars"],
      ["Newsletter", "news-events.html#newsletter"]
    ]},
    { id: "careers", label: "Careers", href: "careers.html", items: [
      ["Current Openings", "careers.html#openings"],
      ["Why Join Us", "careers.html#why-join"],
      ["Application Form", "careers.html#apply"]
    ]},
    { id: "contact", label: "Contact Us", href: "contact.html" }
  ];

  function sym(n) { return '<span class="sym" aria-hidden="true">' + n + "</span>"; }

  function buildHeader() {
    var topnav = NAV.filter(function (n) { return n.id !== "contact"; }).map(function (n) {
      var cur = n.id === CURRENT ? " current" : "";
      var carel = n.items ? '<span class="sym caret" aria-hidden="true">expand_more</span>' : "";
      var sub = n.items ? '<ul class="dropdown">' + n.items.map(function (it) {
        return '<li><a href="' + it[1] + '">' + it[0] + "</a></li>";
      }).join("") + "</ul>" : "";
      return "<li>" + '<a href="' + n.href + '" class="' + cur.trim() + '">' + n.label + carel + "</a>" + sub + "</li>";
    }).join("");

    var drawer = NAV.map(function (n) {
      if (!n.items) return '<div class="dgroup"><a href="' + n.href + '">' + n.label + "</a></div>";
      var subs = n.items.map(function (it) { return '<a href="' + it[1] + '">' + it[0] + "</a>"; }).join("");
      return '<div class="dgroup"><button type="button" aria-expanded="false">' + n.label + '<span class="sym caret" aria-hidden="true">expand_more</span></button><div class="dsub">' + subs + "</div></div>";
    }).join("");

    return '' +
      '<div class="topbar"><div class="wrap">' +
        '<div class="topbar-info">' +
          '<a class="tb-item tb-affil" href="about.html">' + sym("workspace_premium") + '<span class="tb-affil-text">CBSE Affiliation No. 1930418</span></a>' +
          '<div class="tb-contact">' +
            '<div class="tb-phone">' +
              '<button type="button" class="tb-item tb-phone-btn" id="tbPhoneBtn" aria-label="Show phone numbers" aria-expanded="false">' + sym("call") + '<span class="tb-text">0461 2347300 · +91 88700 01209</span></button>' +
              '<div class="tb-pop"><a href="tel:04612347300">0461 2347300</a><a href="tel:+918870001209">+91 88700 01209</a></div>' +
            "</div>" +
            '<a class="tb-item tb-mail" href="mailto:alagarschool@gmail.com" aria-label="Email us">' + sym("mail") + '<span class="tb-text">alagarschool@gmail.com</span></a>' +
          "</div>" +
        "</div>" +
        '<div class="topbar-actions">' +
          '<a href="admission.html" class="btn btn-accent topbar-apply">' + sym("edit_document") + "Apply Now</a>" +
        "</div>" +
      "</div></div>" +
      '<header class="header" id="header"><div class="wrap">' +
        '<a href="index.html" class="brand" aria-label="Alagar Public School">' +
          '<img src="assets/img/image_0.png" alt="Alagar Public School" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline\'">' +
          '<span class="brand__fallback">Alagar Public School</span>' +
        "</a>" +
        '<nav aria-label="Primary" style="display:contents"><ul class="nav">' + topnav + "</ul></nav>" +
        '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">' + sym("menu") + "</button>" +
      "</div></header>" +
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="drawer" id="drawer">' +
        '<div class="drawer__head"><img src="assets/img/image_0.png" alt="Alagar"><button class="drawer__close" id="closeBtn" aria-label="Close">' + sym("close") + "</button></div>" +
        '<nav class="drawer__nav" aria-label="Mobile">' + drawer + "</nav>" +
        '<div class="drawer__cta"><a href="admission.html" class="btn btn-accent" style="width:100%;justify-content:center">' + sym("edit_document") + "Apply Now</a></div>" +
      "</aside>";
  }

  function buildFooter() {
    return '' +
      '<footer class="footer"><div class="wrap">' +
        '<div class="foot-news">' +
          '<div class="fn-head">' + sym("mail") + '<div><strong>Subscribe to Our Newsletter</strong><small>School news, events and updates — straight to your inbox.</small></div></div>' +
          '<form class="fn-form" data-enquiry><input type="email" required placeholder="Enter your email address" aria-label="Your email address"><button class="btn btn-accent" type="submit">Subscribe</button></form>' +
          '<div class="form-success">&#10003; Thank you! You are now subscribed to our newsletter.</div>' +
        "</div>" +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<img src="assets/img/image_0.png" alt="Alagar Public School">' +
            "<p>The best CBSE school in Thoothukudi — joyful, holistic and future-ready learning from Montessori to Grade 12. Promoted &amp; managed by the Alagar Charitable Foundation since 2009.</p>" +
            '<div class="footer-soc">' +
              '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.8-.1-1.6-.15-2.4-.15-2.4 0-4 1.45-4 4.1v2.35H7.5V13h2.8v8z"/></svg></a>' +
              '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.05-.41-2.22C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.74.07-.92.04-1.42.2-1.75.33-.44.17-.75.37-1.08.7-.33.33-.53.64-.7 1.08-.13.33-.29.83-.33 1.75-.06 1.21-.07 1.56-.07 4.27s.01 3.06.07 4.27c.04.92.2 1.42.33 1.75.17.44.37.75.7 1.08.33.33.64.53 1.08.7.33.13.83.29 1.75.33 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.92-.04 1.42-.2 1.75-.33.44-.17.75-.37 1.08-.7.33-.33.53-.64.7-1.08.13-.33.29-.83.33-1.75.06-1.21.07-1.56.07-4.27s-.01-3.06-.07-4.27c-.04-.92-.2-1.42-.33-1.75a2.9 2.9 0 0 0-.7-1.08 2.9 2.9 0 0 0-1.08-.7c-.33-.13-.83-.29-1.75-.33C15.5 4.01 15.15 4 12 4zm0 3.05A4.95 4.95 0 1 1 7.05 12 4.95 4.95 0 0 1 12 7.05zm0 8.17A3.22 3.22 0 1 0 8.78 12 3.22 3.22 0 0 0 12 15.22zm6.31-8.39a1.16 1.16 0 1 1-1.16-1.15 1.16 1.16 0 0 1 1.16 1.15z"/></svg></a>' +
              '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.4h3.5V21H3.4zM9.4 8.4h3.35v1.72h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34V21h-3.5v-5.36c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.4z"/></svg></a>' +
              '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51A3.02 3.02 0 0 0 23.5 17.5 31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5zM9.6 15.6V8.4l6.25 3.6z"/></svg></a>' +
            "</div>" +
          "</div>" +
          '<div class="footer-col"><h4>Quick Links</h4><ul>' +
            '<li><a href="index.html">Home</a></li>' +
            '<li><a href="about.html">About Us</a></li>' +
            '<li><a href="admission.html">Admissions</a></li>' +
            '<li><a href="about.html#disclosure">Mandatory Disclosure</a></li>' +
            '<li><a href="contact.html">Contact Us</a></li>' +
          "</ul></div>" +
          '<div class="footer-col"><h4>Explore</h4><ul>' +
            '<li><a href="academics.html">Academics</a></li>' +
            '<li><a href="student-life.html">Student Life</a></li>' +
            '<li><a href="news-events.html">News &amp; Events</a></li>' +
            '<li><a href="careers.html">Careers</a></li>' +
          "</ul></div>" +
          '<div class="footer-col"><h4>Get In Touch</h4><ul class="footer-contact">' +
            "<li>" + sym("location_on") + "<span>4/42/3 Muthammal Colony Extension, Sankaraperi, Thoothukudi – 628002, Tamil Nadu.</span></li>" +
            "<li>" + sym("call") + "<span>0461 2347300 · +91 88700 01209</span></li>" +
            "<li>" + sym("mail") + "<span>alagarschool@gmail.com</span></li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="footer-bottom">' +
          "<p>&copy; 2026 Alagar Public School. All Rights Reserved.</p>" +
          '<p><a href="#">Privacy Policy</a> &nbsp;·&nbsp; <a href="#">Terms &amp; Conditions</a></p>' +
        "</div>" +
      "</div></footer>";
  }

  function mount(id, html) { var el = document.getElementById(id); if (el) el.outerHTML = html; }
  mount("site-header", buildHeader());
  mount("site-footer", buildFooter());
  document.querySelectorAll(".sym").forEach(function (s) { s.setAttribute("aria-hidden", "true"); });
  document.querySelectorAll(".footer-soc svg, .news-ig svg, .soc-row svg").forEach(function (s) { s.setAttribute("aria-hidden", "true"); });

  var header = document.getElementById("header");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var burger = document.getElementById("burger");
  var closeBtn = document.getElementById("closeBtn");

  function openDrawer() { drawer.classList.add("open"); scrim.classList.add("show"); if (burger) burger.setAttribute("aria-expanded", "true"); }
  function closeDrawer() { drawer.classList.remove("open"); scrim.classList.remove("show"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger) burger.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (scrim) scrim.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll(".dgroup > button").forEach(function (b) {
    b.addEventListener("click", function () {
      var g = b.parentElement;
      var wasOpen = g.classList.contains("open");
      drawer.querySelectorAll(".dgroup.open").forEach(function (o) { o.classList.remove("open"); var ob = o.querySelector("button"); if (ob) ob.setAttribute("aria-expanded", "false"); });
      if (!wasOpen) { g.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  /* desktop: parent menus with a submenu reveal it instead of navigating */
  document.querySelectorAll(".nav > li > a").forEach(function (a) {
    if (a.parentElement.querySelector(".dropdown")) {
      a.addEventListener("click", function (e) {
        if (window.innerWidth > 1180) e.preventDefault();
      });
    }
  });

  window.addEventListener("scroll", function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  });

  /* topbar phone reveal — small screens only */
  var tbPhone = document.querySelector(".tb-phone");
  var tbPhoneBtn = document.getElementById("tbPhoneBtn");
  if (tbPhone && tbPhoneBtn) {
    tbPhoneBtn.addEventListener("click", function (e) {
      if (window.innerWidth > 768) return;
      e.stopPropagation();
      var open = tbPhone.classList.toggle("open");
      tbPhoneBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!tbPhone.contains(e.target)) { tbPhone.classList.remove("open"); tbPhoneBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (REDUCE) { el.textContent = Math.round(target) + suffix; return; }
    var dur = 1500, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        if (en.target.hasAttribute("data-count")) countUp(en.target);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal,[data-count]").forEach(function (el) { io.observe(el); });

  document.querySelectorAll("form[data-enquiry]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      f.style.display = "none";
      var ok = f.parentElement.querySelector(".form-success");
      if (ok) ok.style.display = "block";
    });
  });

  /* scroll to top */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<span class="sym">keyboard_arrow_up</span>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", function () { toTop.classList.toggle("show", window.scrollY > 400); });

  /* video popup (any [data-video] element opens it) */
  var vmodal = document.createElement("div");
  vmodal.className = "video-modal";
  vmodal.innerHTML = '<div class="vm-overlay"></div><div class="vm-dialog">' +
    '<button class="vm-close" aria-label="Close">&times;</button>' +
    '<video class="vm-player" controls playsinline></video></div>';
  document.body.appendChild(vmodal);
  var vmPlayer = vmodal.querySelector(".vm-player");
  function closeVideo() { vmodal.classList.remove("open"); vmPlayer.pause(); vmPlayer.removeAttribute("src"); vmPlayer.load(); }
  function openVideo(src) { if (!src) return; vmPlayer.src = src; vmodal.classList.add("open"); var p = vmPlayer.play(); if (p && p.catch) p.catch(function () {}); }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-video]");
    if (t) { e.preventDefault(); openVideo(t.getAttribute("data-video")); return; }
    if (e.target.classList.contains("vm-overlay") || e.target.classList.contains("vm-close")) closeVideo();
  });

  /* promo image popup — home page, 10s after load */
  if (CURRENT === "home") {
    var promo = document.createElement("div");
    promo.className = "promo-modal";
    promo.innerHTML = '<div class="promo-overlay"></div><div class="promo-dialog">' +
      '<button class="promo-close" aria-label="Close">&times;</button>' +
      '<a href="admission.html"><img src="assets/img/banner-2.jpg" alt="Admissions open at Alagar Public School"></a>' +
      '<div class="promo-cap"><strong>Admissions Open 2026–27</strong>' +
      '<span>Give your child the Alagar advantage — limited seats available.</span>' +
      '<a class="btn btn-accent" href="admission.html">' + sym("edit_document") + ' Apply Now</a></div></div>';
    document.body.appendChild(promo);
    promo.addEventListener("click", function (e) {
      if (e.target.classList.contains("promo-overlay") || e.target.classList.contains("promo-close")) promo.classList.remove("open");
    });
    if (!sessionStorage.getItem("apsPromoSeen")) {
      setTimeout(function () { promo.classList.add("open"); sessionStorage.setItem("apsPromoSeen", "1"); }, 10000);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeVideo();
      var pm = document.querySelector(".promo-modal.open");
      if (pm) pm.classList.remove("open");
    }
  });

  /* ===================== Admission Enquiry & Campus Visit popup forms ===================== */
  (function () {
    var RECIPIENT = "green.ragul@gmail.com";
    var WEB3FORMS_KEY = ""; /* <-- paste your Web3Forms access key here for automatic email; leave "" to use the visitor's email app (mailto) */

    var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    function fmtDate(v){ if(!v) return ""; var d=new Date(v+"T00:00:00"); if(isNaN(d)) return v; return (d.getDate()<10?"0":"")+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear(); }
    function ageYM(v){ var d=new Date(v+"T00:00:00"), n=new Date(); var y=n.getFullYear()-d.getFullYear(), m=n.getMonth()-d.getMonth(); if(n.getDate()<d.getDate()) m--; if(m<0){ y--; m+=12; } return {y:y,m:m}; }
    function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

    var GRADES=["Kindergarten (LKG/UKG)","Primary (Grades 1-5)","Middle School (Grades 6-8)","High School (Grades 9-12)"];
    var SLOTS=["Morning: 09:30 AM – 11:30 AM","Afternoon: 02:00 PM – 04:00 PM"];
    function opts(arr,ph){ return '<option value="">'+ph+'</option>'+arr.map(function(o){return '<option>'+o+'</option>';}).join(''); }
    var today=new Date().toISOString().slice(0,10);

    function field(label, inner, req){
      return '<div class="fm-field"><label>'+label+(req?' <span class="fm-req">*</span>':' <span class="fm-opt">(optional)</span>')+inner+'</label><div class="fm-err"></div></div>';
    }

    var admBody =
      field("Student Full Name", '<input type="text" name="Student Name" data-req placeholder="Child’s full name">', true)+
      field("Student Date of Birth", '<input type="date" name="_dob" id="admDob" data-req max="'+today+'"><div class="fm-dob" id="admDobOut"></div>', true)+
      field("Grade / Standard Seeking", '<select name="Grade Seeking" data-req>'+opts(GRADES,"Select grade")+'</select>', true)+
      field("Parent / Guardian Name", '<input type="text" name="Parent / Guardian" data-req placeholder="Your full name">', true)+
      field("Contact Number", '<input type="tel" name="Contact Number" data-req placeholder="+91 XXXXX XXXXX">', true)+
      field("Email Address", '<input type="email" name="Email" data-email placeholder="you@example.com">', false);

    var campBody =
      field("Parent / Guardian Name", '<input type="text" name="Parent / Guardian" data-req placeholder="Your full name">', true)+
      field("Mobile Number", '<input type="tel" name="Mobile Number" data-req placeholder="10-digit number">', true)+
      field("Preferred Visit Date", '<input type="date" name="_visit" id="campVisit" data-req min="'+today+'">', true)+
      field("Preferred Time Window", '<select name="Preferred Time" data-req>'+opts(SLOTS,"Select slot")+'</select>', true)+
      field("Email Address", '<input type="email" name="Email" data-email placeholder="you@example.com">', false);

    function buildModal(id, title, sub, body, submitLabel){
      var m=document.createElement("div");
      m.className="form-modal"; m.id=id;
      m.setAttribute("role","dialog"); m.setAttribute("aria-modal","true"); m.setAttribute("aria-labelledby",id+"-t");
      m.innerHTML='<div class="fm-overlay"></div><div class="fm-dialog">'+
        '<button type="button" class="fm-close" aria-label="Close form">'+sym("close")+'</button>'+
        '<div class="fm-head"><h2 id="'+id+'-t">'+title+'</h2><p>'+sub+'</p></div>'+
        '<form class="fm-form" novalidate>'+body+
          '<button type="submit" class="btn btn-accent fm-submit">'+sym("send")+' '+submitLabel+'</button>'+
        '</form>'+
        '<div class="fm-success"><span class="sym">check_circle</span><strong>Thank you!</strong><p class="fm-success-msg"></p></div>'+
      '</div>';
      document.body.appendChild(m);
      return m;
    }

    var admModal=buildModal("admissionModal","Admission Enquiry","Fill in the details and our admissions office will contact you within one working day.",admBody,"Submit Enquiry");
    var campModal=buildModal("campusModal","Book a Campus Visit","Choose a date and time and we will confirm your guided campus tour.",campBody,"Schedule Visit");

    var admDob=admModal.querySelector("#admDob"), admDobOut=admModal.querySelector("#admDobOut");
    if(admDob){ admDob.addEventListener("change",function(){
      if(admDob.value){ var a=ageYM(admDob.value); admDobOut.textContent=fmtDate(admDob.value)+", "+a.y+"Yr "+a.m+"M"; admDobOut.style.display="block"; }
      else admDobOut.style.display="none";
    }); }

    function openModal(m, trigger){
      var pm=document.querySelector(".promo-modal.open"); if(pm) pm.classList.remove("open");
      m._opener=trigger||null;
      m.classList.add("open"); document.body.style.overflow="hidden";
      var f=m.querySelector("input,select"); if(f) setTimeout(function(){f.focus();},60);
    }
    function closeModal(m){
      m.classList.remove("open"); document.body.style.overflow="";
      var form=m.querySelector(".fm-form"); if(form){ form.reset(); form.style.display=""; }
      m.querySelector(".fm-success").classList.remove("show");
      if(admDobOut) admDobOut.style.display="none";
      m.querySelectorAll(".fm-field").forEach(function(fl){ fl.classList.remove("bad"); var e=fl.querySelector(".fm-err"); if(e) e.textContent=""; });
      if(m._opener && m._opener.focus) m._opener.focus();
    }

    [admModal,campModal].forEach(function(m){
      m.querySelector(".fm-close").addEventListener("click",function(){ closeModal(m); });
    });

    function handle(m, subjectFn){
      var form=m.querySelector(".fm-form");
      form.addEventListener("submit",function(e){
        e.preventDefault();
        var ok=true, first=null;
        form.querySelectorAll(".fm-field").forEach(function(fl){
          var inp=fl.querySelector("[data-req],[data-email]"); if(!inp) return;
          var msg="";
          if(inp.hasAttribute("data-req") && !inp.value.trim()) msg="This field is required.";
          else if(inp.hasAttribute("data-email") && inp.value.trim() && !validEmail(inp.value.trim())) msg="Enter a valid email address.";
          fl.classList.toggle("bad",!!msg);
          fl.querySelector(".fm-err").textContent=msg;
          if(msg){ ok=false; if(!first) first=inp; }
        });
        if(!ok){ if(first) first.focus(); return; }

        var data={};
        form.querySelectorAll("input,select").forEach(function(inp){
          var n=inp.getAttribute("name"); if(!n) return;
          if(n==="_dob"){ if(inp.value){ var a=ageYM(inp.value); data["Date of Birth"]=fmtDate(inp.value); data["Age"]=a.y+" Yr "+a.m+" M"; } }
          else if(n==="_visit"){ if(inp.value) data["Preferred Visit Date"]=fmtDate(inp.value); }
          else if(inp.value.trim()) data[n]=inp.value.trim();
        });
        var subject=subjectFn(data), reply=data["Email"]||"";
        send(subject,data,reply);

        form.style.display="none";
        var sc=m.querySelector(".fm-success"); sc.classList.add("show");
        m.querySelector(".fm-success-msg").textContent="Your "+(m===campModal?"campus visit request":"admission enquiry")+" has been submitted. We will be in touch shortly.";
        setTimeout(function(){ closeModal(m); }, 3500);
      });
    }
    handle(admModal,function(d){ return "New Admission Enquiry — "+(d["Student Name"]||"Alagar Public School"); });
    handle(campModal,function(d){ return "New Campus Visit Request — "+(d["Parent / Guardian"]||"Alagar Public School"); });

    function send(subject,fields,reply){
      if(WEB3FORMS_KEY){
        var payload={access_key:WEB3FORMS_KEY,subject:subject,from_name:"Alagar Public School Website"};
        Object.keys(fields).forEach(function(k){ payload[k]=fields[k]; });
        if(reply) payload.replyto=reply;
        fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)}).catch(function(){ mailto(subject,fields); });
      } else { mailto(subject,fields); }
    }
    function mailto(subject,fields){
      var body="Alagar Public School — new form submission\n\n";
      Object.keys(fields).forEach(function(k){ body+=k+": "+fields[k]+"\n"; });
      body+="\nSubmitted: "+new Date().toLocaleString();
      var a=document.createElement("a");
      a.href="mailto:"+RECIPIENT+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    document.addEventListener("click",function(e){
      var el=e.target.closest && e.target.closest("a,button"); if(!el) return;
      if(el.closest(".form-modal")) return;
      var txt=(el.textContent||"").replace(/\s+/g," ").trim();
      if(/Book a Campus Visit/.test(txt)){ e.preventDefault(); openModal(campModal, el); return; }
      var inNav=el.closest(".nav");
      if((!inNav && el.matches('a[href="admission.html"]')) || /Apply Now|Apply for 20|Start Admission Enquiry/.test(txt)){ e.preventDefault(); openModal(admModal, el); return; }
    });
  })();

})();
