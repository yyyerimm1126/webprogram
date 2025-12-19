const stickers = [
  "./stickers/apple.png",
  "./stickers/cookie.png",
  "./stickers/diamond_sword.png",
  "./stickers/experience_points.png",
  "./stickers/eyes.png",
  "./stickers/fish.png",
  "./stickers/flower.png",
  "./stickers/grilled_beef.png",
  "./stickers/grilled_chicken.png",
  "./stickers/heart.png",
  "./stickers/manyheart.png",
  "./stickers/honeybee.png",
  "./stickers/item.png",
];

const photoBox = document.getElementById("photoBox");
const fileInput = document.getElementById("fileInput");
const stickerPanel = document.getElementById("stickerPanel");
const toast = document.getElementById("toast");

let selectedSticker = null;
let action = null;

// 드래그 기준 좌표
let startX = 0;
let startY = 0;

/* 📸 사진 업로드 */
photoBox.addEventListener("click", (e) => {
  if (e.target === photoBox) {
    deselectSticker();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "photo-img";

  photoBox.innerHTML = "";
  photoBox.appendChild(img);
});

/* 🧱 스티커 패널 */
stickers.forEach((src) => {
  const box = document.createElement("div");
  box.className = "sticker-box";

  const img = document.createElement("img");
  img.src = src;
  img.className = "sticker-img";

  box.appendChild(img);
  box.onclick = () => addSticker(src);

  stickerPanel.appendChild(box);
});

/* ➕ 스티커 추가 */
function addSticker(src) {
  const wrap = document.createElement("div");
  wrap.className = "sticker-wrap";
  wrap.style.left = "200px";
  wrap.style.top = "200px";
  wrap.style.width = "120px";
  wrap.style.height = "120px";
  wrap.dataset.rotate = 0;
  wrap.dataset.flip = 1;

  const img = document.createElement("img");
  img.src = src;
  img.className = "placed-sticker";
  wrap.appendChild(img);

  photoBox.appendChild(wrap);
  selectSticker(wrap);

  wrap.onmousedown = (e) => {
    e.stopPropagation();
    selectSticker(wrap);
    action = "drag";
    startX = e.clientX;
    startY = e.clientY;
  };

  const resize = document.createElement("div");
  resize.className = "resize-handle";
  resize.onmousedown = (e) => {
    e.stopPropagation();
    action = "resize";
    startX = e.clientX;
  };

  const rotate = document.createElement("div");
  rotate.className = "rotate-handle";
  rotate.innerText = "⟳";
  rotate.onmousedown = (e) => {
    e.stopPropagation();
    action = "rotate";
    startX = e.clientX;
  };

  wrap.appendChild(resize);
  wrap.appendChild(rotate);
}

/* 🎯 선택 */
function selectSticker(el) {
  deselectSticker();
  selectedSticker = el;
  el.classList.add("selected");
}

function deselectSticker() {
  if (selectedSticker) {
    selectedSticker.classList.remove("selected");
    selectedSticker = null;
  }
}

/* 🖱️ 마우스 이동 */
window.addEventListener("mousemove", (e) => {
  if (!selectedSticker || !action) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (action === "drag") {
    selectedSticker.style.left =
      selectedSticker.offsetLeft + dx + "px";
    selectedSticker.style.top =
      selectedSticker.offsetTop + dy + "px";
  }

  if (action === "resize") {
    const size = Math.max(
      50,
      selectedSticker.offsetWidth + dx
    );
    selectedSticker.style.width = size + "px";
    selectedSticker.style.height = size + "px";
  }

  if (action === "rotate") {
    let r = Number(selectedSticker.dataset.rotate);
    r += dx;
    selectedSticker.dataset.rotate = r;
  }

  applyTransform();
  startX = e.clientX;
  startY = e.clientY;
});

window.addEventListener("mouseup", () => {
  action = null;
});

/* ↔️ 좌우 반전 */
function flipSticker() {
  if (!selectedSticker) return;
  selectedSticker.dataset.flip *= -1;
  applyTransform();
}

function applyTransform() {
  if (!selectedSticker) return;
  const r = selectedSticker.dataset.rotate;
  const f = selectedSticker.dataset.flip;
  selectedSticker.style.transform = `rotate(${r}deg) scaleX(${f})`;
}

/* 🗑️ 삭제 */
function deleteSticker() {
  if (!selectedSticker) return;
  selectedSticker.remove();
  selectedSticker = null;
}

/* ⌨️ Delete 키 */
window.addEventListener("keydown", (e) => {
  if ((e.key === "Delete" || e.key === "Backspace") && selectedSticker) {
    deleteSticker();
  }
});

/* 💾 저장 */
function saveImage() {
  deselectSticker();

  html2canvas(photoBox, { backgroundColor: null, scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "image-editor.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
}

/* ⬅️ 뒤로 */
function goBack() {
  window.location.href = "index.html";
}
