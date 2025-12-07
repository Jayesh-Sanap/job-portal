/* Beginner-friendly Job Portal JS
   Features: Add / Edit / Delete / Search / Category filter / LocalStorage
*/

// --- DOM references ---
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const titleInput = document.getElementById("jobTitle");
const compInput = document.getElementById("jobCompany");
const catInput = document.getElementById("jobCategory");
const descInput = document.getElementById("jobDesc");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

const jobListEl = document.getElementById("jobList");
const statsEl = document.getElementById("stats");

// storage key
const KEY = "simple_jobs_v1";

// jobs array & editing flag
let jobs = [];
let editingId = null;

// --- helpers ---
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

// load from localStorage
function loadJobs(){
  const raw = localStorage.getItem(KEY);
  jobs = raw ? JSON.parse(raw) : [];
}

// save to localStorage
function saveJobsToStorage(){
  localStorage.setItem(KEY, JSON.stringify(jobs));
}

// render list with optional filter text
function renderJobs(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const cat = filterCategory.value || "all";

  jobListEl.innerHTML = "";
  let filtered = jobs.filter(j => {
    const textMatch = (j.title + " " + j.company + " " + (j.desc||"")).toLowerCase().includes(q);
    const catMatch = cat === "all" ? true : (j.category === cat);
    return textMatch && catMatch;
  });

  statsEl.textContent = `${filtered.length} job${filtered.length !== 1 ? "s" : ""}`;

  if(filtered.length === 0){
    jobListEl.innerHTML = `<div style="color:var(--muted);padding:14px;border-radius:8px;background:rgba(255,255,255,0.02)">No jobs yet — add one!</div>`;
    return;
  }

  filtered.forEach(job => {
    const li = document.createElement("li");
    li.className = "job-card";
    li.innerHTML = `
      <div class="job-left">
        <div class="logo">${job.company ? job.company[0].toUpperCase() : "J"}</div>
        <div class="job-info">
          <h4>${job.title}</h4>
          <div class="meta">${job.company} • <span style="color:var(--muted)">${job.category}</span></div>
          <div class="meta" style="margin-top:6px;font-size:12px;color:var(--muted)">Posted: ${new Date(job.posted).toLocaleString()}</div>
          ${job.desc ? `<div class="meta" style="margin-top:6px">${job.desc}</div>` : ""}
        </div>
      </div>
      <div class="actions">
        <button class="small apply" data-id="${job.id}">Apply</button>
        <button class="small edit" data-id="${job.id}">Edit</button>
        <button class="small remove" data-id="${job.id}">Delete</button>
      </div>
    `;
    jobListEl.appendChild(li);
  });

  // attach buttons (simple approach)
  document.querySelectorAll(".remove").forEach(b => b.onclick = e => {
    const id = e.target.dataset.id;
    if(confirm("Delete this job?")) { jobs = jobs.filter(x => x.id !== id); saveJobsToStorage(); renderJobs(); }
  });
  document.querySelectorAll(".edit").forEach(b => b.onclick = e => {
    const id = e.target.dataset.id;
    startEdit(id);
  });
  // apply button currently UI-only
  document.querySelectorAll(".apply").forEach(b => b.onclick = e => {
    alert("Apply clicked — this is demo UI. Implement backend to receive applications.");
  });
}

// --- form actions ---
function clearForm(){
  titleInput.value = "";
  compInput.value = "";
  catInput.value = "IT";
  descInput.value = "";
  editingId = null;
  saveBtn.textContent = "Add Job";
}

function startEdit(id){
  const j = jobs.find(x => x.id === id);
  if(!j) return;
  titleInput.value = j.title;
  compInput.value = j.company;
  catInput.value = j.category;
  descInput.value = j.desc || "";
  editingId = id;
  saveBtn.textContent = "Update Job";
  window.scrollTo({top:0,behavior:"smooth"});
}

function saveForm(){
  const title = titleInput.value.trim();
  const company = compInput.value.trim();
  const category = catInput.value;
  const desc = descInput.value.trim();

  if(!title || !company){
    alert("Please enter title and company.");
    return;
  }

  if(editingId){
    // update existing
    const obj = jobs.find(x => x.id === editingId);
    if(obj){
      obj.title = title; obj.company = company; obj.category = category; obj.desc = desc; obj.updated = Date.now();
    }
    editingId = null;
    saveBtn.textContent = "Add Job";
  } else {
    const newJob = { id: uid(), title, company, category, desc, posted: Date.now() };
    jobs.unshift(newJob); // newest first
  }

  saveJobsToStorage();
  clearForm();
  renderJobs();
}

// --- events ---
saveBtn.addEventListener("click", saveForm);
clearBtn.addEventListener("click", ()=>{ if(confirm("Reset form?")) clearForm(); });

searchInput.addEventListener("input", renderJobs);
filterCategory.addEventListener("change", renderJobs);

// init
(function init(){
  loadJobs();
  renderJobs();
})();
console.log("git test");