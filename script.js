const co_mat = true;
const vang = false;

const defaultStudents = [];

let students = [...defaultStudents];
let diem_danh = {};
let classTitle = "Điểm Danh Học Sinh";
let autoSave = true;
let currentIndex = -1;

function init() {
  const savedAutoSave = localStorage.getItem("dd_autoSave");
  if (savedAutoSave !== null) {
    autoSave = savedAutoSave === "true";
    document.getElementById("autoSaveToggle").checked = autoSave;
  }

  if (autoSave) {
    const savedStudents = localStorage.getItem("dd_students");
    const savedStatus = localStorage.getItem("dd_status");
    const savedTitle = localStorage.getItem("dd_title");

    if (savedStudents) students = JSON.parse(savedStudents);
    if (savedStatus) diem_danh = JSON.parse(savedStatus);
    if (savedTitle) classTitle = savedTitle;
  }

  students.forEach(ten => {
    if (diem_danh[ten] === undefined) {
      diem_danh[ten] = vang;
    }
  });

  document.getElementById("classTitle").textContent = classTitle;
  document.getElementById("classNameInput").value = classTitle;
  render();
}

function saveData() {
  if (!autoSave) return;
  localStorage.setItem("dd_students", JSON.stringify(students));
  localStorage.setItem("dd_status", JSON.stringify(diem_danh));
  localStorage.setItem("dd_title", classTitle);
}

function render() {
  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";

  let present = 0;

  students.forEach((ten, idx) => {
    const isPresent = diem_danh[ten];
    if (isPresent) present++;

    const tr = document.createElement("tr");
    if (idx === currentIndex) tr.classList.add("highlight");

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${ten}</strong></td>
      <td>
        <span class="badge ${isPresent ? 'badge-present' : 'badge-absent'}" onclick="toggleStatus('${ten.replace(/'/g, "\\'")}')">
          ${isPresent ? 'Có mặt' : 'Vắng'}
        </span>
      </td>
      <td style="text-align: center;">
        <button class="btn-delete" onclick="removeStudent(${idx})" title="Xóa học sinh">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("classSubtitle").textContent =
    `Danh sách ${students.length} học sinh — bấm vào trạng thái để đổi nhanh hoặc dùng chế độ hỏi từng bạn.`;
  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = students.length - present;

  saveData();
}

/* --- Tính năng Cài đặt --- */
function toggleSettings() {
  document.getElementById("settingsBox").classList.toggle("active");
}

function saveClassName() {
  const val = document.getElementById("classNameInput").value.trim();
  if (val) {
    classTitle = val;
    document.getElementById("classTitle").textContent = classTitle;
    saveData();
  }
}

function toggleAutoSave() {
  autoSave = document.getElementById("autoSaveToggle").checked;
  localStorage.setItem("dd_autoSave", autoSave);
  if (autoSave) {
    saveData();
  } else {
    localStorage.removeItem("dd_students");
    localStorage.removeItem("dd_status");
    localStorage.removeItem("dd_title");
  }
}

function markAllPresent() {
  stopSequential();
  students.forEach(ten => {
    diem_danh[ten] = co_mat;
  });
  render();
}

function restoreDefaultStudents() {
  if (!confirm("Khôi phục lại danh sách 13 học sinh mặc định ban đầu?")) return;
  stopSequential();
  students = [...defaultStudents];
  diem_danh = {};
  students.forEach(ten => {
    diem_danh[ten] = vang;
  });
  render();
}

/* --- Tính năng Thêm & Xóa học sinh --- */
function addStudent() {
  const input = document.getElementById("newStudentInput");
  const raw = input.value.trim();
  if (!raw) return;

  // Hỗ trợ nhập 1 tên hoặc nhiều tên cách nhau bởi dấu phẩy
  const names = raw.split(",").map(s => s.trim()).filter(s => s !== "");

  names.forEach(ten => {
    if (!students.includes(ten)) {
      students.push(ten);
      diem_danh[ten] = vang;
    } else {
      alert(`Học sinh "${ten}" đã có trong danh sách!`);
    }
  });

  input.value = "";
  render();
}

function handleAddKey(event) {
  if (event.key === "Enter") {
    addStudent();
  }
}

function removeStudent(index) {
  const ten = students[index];
  delete diem_danh[ten];
  students.splice(index, 1);

  if (currentIndex >= students.length) {
    stopSequential();
  } else {
    render();
  }
}

/* --- Điểm danh & Hỏi lần lượt --- */
function toggleStatus(ten) {
  diem_danh[ten] = !diem_danh[ten];
  render();
}

function resetAll() {
  stopSequential();
  students.forEach(ten => {
    diem_danh[ten] = vang;
  });
  render();
}

function startSequential() {
  if (students.length === 0) return;
  currentIndex = 0;
  document.getElementById("promptBox").classList.add("active");
  updatePrompt();
}

function stopSequential() {
  currentIndex = -1;
  document.getElementById("promptBox").classList.remove("active");
  render();
}

function updatePrompt() {
  if (currentIndex >= students.length) {
    stopSequential();
    return;
  }
  const ten = students[currentIndex];
  document.getElementById("promptQuestion").textContent = `${ten} có mặt không? (c/k):`;
  const input = document.getElementById("answerInput");
  input.value = "";
  input.focus();
  render();
}

function submitAnswer() {
  if (currentIndex < 0 || currentIndex >= students.length) return;
  const tra_loi = document.getElementById("answerInput").value.trim().toLowerCase();
  const ten = students[currentIndex];
  if (tra_loi === "c" || tra_loi === "co" || tra_loi === "có") {
    diem_danh[ten] = co_mat;
  } else {
    diem_danh[ten] = vang;
  }
  currentIndex++;
  updatePrompt();
}

function handleKey(event) {
  if (event.key === "Enter") {
    submitAnswer();
  }
}

function downloadResult() {
  let lines = [`--- ${classTitle.toUpperCase()} ---`];
  let present = 0;
  students.forEach(ten => {
    const status = diem_danh[ten] ? "Có mặt" : "Vắng";
    if (diem_danh[ten]) present++;
    lines.push(`${ten.padEnd(14, " ")}: ${status}`);
  });
  lines.push(`\nTổng kết: ${present} có mặt | ${students.length - present} vắng`);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ket_qua_diem_danh.txt";
  a.click();
  URL.revokeObjectURL(url);
}

init();
