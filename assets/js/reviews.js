/* Alagar Public School — reviews (display only) */
(function () {
  var REVIEWS = [
    { name: "Ramesh & Family", role: "Parents of two students", rating: 5, text: "Choosing Alagar was the best decision we made for our children. The blissful, stress-free environment combined with strong academic results gives us complete peace of mind." },
    { name: "Lakshmi S.", role: "Parent of a Grade I student", rating: 5, text: "The personalized attention my daughter received in the Montessori block transformed her expressive abilities. She looks forward to her classes every single morning." },
    { name: "Vijay K.", role: "Alumnus, Batch of 2019", rating: 5, text: "The foundation Alagar gave me carried me through my engineering degree and beyond. The teachers taught us how to think, question and lead — not just subjects." },
    { name: "Priya M.", role: "Parent of a Grade 8 student", rating: 5, text: "The teachers genuinely care. My son struggled with maths, and the patient support he received here turned it into his favourite subject." },
    { name: "Arun Prakash", role: "Alumnus, Batch of 2016", rating: 5, text: "Alagar shaped who I am today. Beyond academics, the values, discipline and confidence I gained here have stayed with me through college and work." }
  ];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function stars(n) { n = Math.max(1, Math.min(5, parseInt(n, 10) || 5)); var s = ""; for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆"; return s; }
  function card(r) {
    var initial = (String(r.name || "?").trim().charAt(0) || "?").toUpperCase();
    var role = r.role ? ('<small>' + esc(r.role) + '</small>') : "";
    return '<div class="testi reveal in"><div class="quote-mark">&#8220;</div>' +
      '<div class="stars" role="img" aria-label="Rated ' + (parseInt(r.rating, 10) || 5) + ' out of 5">' + stars(r.rating) + '</div>' +
      '<p>' + esc(r.text) + '</p>' +
      '<div class="who"><span class="av">' + esc(initial) + '</span><div><strong>' + esc(r.name) + '</strong>' + role + '</div></div></div>';
  }
  function render(el, limit) {
    if (!el) return;
    var list = REVIEWS.slice(0, limit || REVIEWS.length);
    el.innerHTML = list.map(card).join("");
  }
  function init() {
    render(document.getElementById("reviewsHome"), 3);
    render(document.getElementById("reviewsAll"), 5);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
