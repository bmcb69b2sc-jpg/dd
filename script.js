const co_mat = true;
const vang = false;
const students = [
  "Thép", "Elsa", "Sony", "Hưng", "Lâm", "Phong",
  "Kiwi", "Kido", "Lily", "Kitty", "Thư", "Kool", "Hạo Anh"
];

let diem_danh = {};
let currentIndex = -1;

function init() {
  students.forEach(ten => {
    diem_danh[ten] = vang;
  });
  render();
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
        <span class="badge ${isPresent ? 'badge-present' : 'badge-absent'}" onclick="toggleStatus('${ten}')">
          ${isPresent ? 'Có mặt' : 'Vắng'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = students.length - present;
}

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
  let lines = ["--- KẾT QUẢ ĐIỂM DANH ---"];
  let present = 0;
  students.forEach(ten => {
    const status = diem_danh[ten] ? "Có mặt" : "Vắng";
    if (diem_danh[ten]) present++;
    lines.push(`${ten.padEnd(10, " ")}: ${status}`);
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