const img = document.getElementById("resultImage");

// editor에서 저장한 이미지 불러오기
const savedImage = localStorage.getItem("finalImage");

if (savedImage) {
  img.src = savedImage;
} else {
  alert("저장된 이미지가 없습니다.");
}

// 되돌아가기
function goBack() {
  window.location.href = "editor.html"; 
  // 또는 index.html 로 바꿔도 됨
}
