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

let selectedSticker = null;
let action = null;
let hasPhoto = false;

let startX = 0;
let startY = 0;

/* ================= 상태 저장 / 복원 ================= */

function saveEditorState() {
  const state = {
    photo: photoBox.querySelector("img")?.src || null,
    stickers: [...photoBox.querySelectorAll(".sticker-wrap")].map(wrap => ({
      src: wrap.querySelector("img").src,
      left: wrap.style.left,
      top: wrap.style.top,
      width: wrap.style.width,
      height: wrap.style.height,
      rotate: wrap.dataset.rotate,
      flip: wrap.dataset.flip
    }))
  };
  localStorage.setItem("editorState", JSON.stringify(state));
}

function restoreEditorState() {
  const state = JSON.parse(localStorage.getItem("editorState"));
  if (!state) return;

  photoBox.innerHTML = "";
  hasPhoto = false;

  if (state.photo) {
    const img = document.createElement("img");
    img.src = state.photo;
    img.className = "photo-img";
    img.alt = "업로드한 사용자 이미지";
    photoBox.appendChild(img);
    hasPhoto = true;
  }

  state.stickers.forEach(s => {
    const wrap = createSticker(s.src);
    wrap.style.left = s.left;
    wrap.style.top = s.top;
    wrap.style.width = s.width;
    wrap.style.height = s.height;
    wrap.dataset.rotate = s.rotate;
    wrap.dataset.flip = s.flip;
    applyTransform(wrap);
  });
}

/* ================= 사진 업로드 ================= */

photoBox.addEventListener("click", (e) => {
  if (e.target !== photoBox) return;
  if (!hasPhoto) fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) {
    alert("파일이 선택되지 않았습니다.");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    fileInput.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB 이하만 업로드 가능합니다.");
    fileInput.value = "";
    return;
  }

  photoBox.innerHTML = "";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "photo-img";
  img.alt = "업로드한 사용자 이미지";

  img.onerror = () => {
    alert("이미지 로드에 실패했습니다.");
  };

  photoBox.appendChild(img);
  hasPhoto = true;
  saveEditorState();
});

/* ================= 스티커 패널 ================= */

stickers.forEach((src) => {
  const box = document.createElement("div");
  box.className = "sticker-box";

  const img = document.createElement("img");
  img.src = src;
  img.className = "sticker-img";
  img.alt = "decorative sticker";

  box.appendChild(img);
  box.onclick = () => addSticker(src);
  stickerPanel.appendChild(box);
});

/* ================= 스티커 생성 ================= */

function createSticker(src) {
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
  img.alt = "decorative sticker";

  const resize = document.createElement("div");
  resize.className = "resize-handle";

  const rotate = document.createElement("div");
  rotate.className = "rotate-handle";
  rotate.innerText = "⟳";

  wrap.append(img, resize, rotate);
  photoBox.appendChild(wrap);

  wrap.onmousedown = (e) => {
    e.stopPropagation();
    selectSticker(wrap);
    action = "drag";
    startX = e.clientX;
    startY = e.clientY;
  };

  resize.onmousedown = (e) => {
    e.stopPropagation();
    action = "resize";
    startX = e.clientX;
  };

  rotate.onmousedown = (e) => {
    e.stopPropagation();
    action = "rotate";
    startX = e.clientX;
  };

  return wrap;
}

function addSticker(src) {
  if (!hasPhoto) return;
  const wrap = createSticker(src);
  selectSticker(wrap);
  saveEditorState();
}

/* ================= 편집 ================= */

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

window.addEventListener("mousemove", (e) => {
  if (!selectedSticker || !action) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (action === "drag") {
    selectedSticker.style.left = selectedSticker.offsetLeft + dx + "px";
    selectedSticker.style.top = selectedSticker.offsetTop + dy + "px";
  }

  if (action === "resize") {
    const size = Math.max(50, selectedSticker.offsetWidth + dx);
    selectedSticker.style.width = size + "px";
    selectedSticker.style.height = size + "px";
  }

  if (action === "rotate") {
    selectedSticker.dataset.rotate =
      Number(selectedSticker.dataset.rotate) + dx;
  }

  applyTransform(selectedSticker);
  startX = e.clientX;
  startY = e.clientY;
});

window.addEventListener("mouseup", () => {
  if (action) saveEditorState();
  action = null;
});

function applyTransform(el) {
  el.style.transform =
    `rotate(${el.dataset.rotate}deg) scaleX(${el.dataset.flip})`;
}

/* ================= 버튼 ================= */

function flipSticker() {
  if (!selectedSticker) return;
  selectedSticker.dataset.flip *= -1;
  applyTransform(selectedSticker);
  saveEditorState();
}

function deleteSticker() {
  if (!selectedSticker) return;
  selectedSticker.remove();
  selectedSticker = null;
  saveEditorState();
}

/* ================= 저장 (🔥 핵심) ================= */

function saveImage() {
  if (!hasPhoto) {
    alert("먼저 사진을 업로드해주세요.");
    return;
  }

  deselectSticker();

  const uiElements = photoBox.querySelectorAll(
    ".resize-handle, .rotate-handle"
  );

  uiElements.forEach(el => el.style.display = "none");

  html2canvas(photoBox, { backgroundColor: null, scale: 2 })
    .then(canvas => {
      const dataURL = canvas.toDataURL("image/png");

      // UI 복구
      uiElements.forEach(el => el.style.display = "");

      if (!dataURL) {
        alert("이미지 생성에 실패했습니다.");
        return;
      }

      localStorage.setItem("finalImage", dataURL);
      window.location.href = "result.html";
    })
    .catch(err => {
      console.error(err);
      alert("이미지 저장 중 오류가 발생했습니다.");
      uiElements.forEach(el => el.style.display = "");
    });
}

/* 되돌아가기 */
function goBack() {
  restoreEditorState();
}

/* 새로 만들기 */
function newStart() {
  localStorage.removeItem("editorState");
  location.reload();
}
