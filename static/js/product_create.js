// 이미지 미리보기 함수
var FileSizeNum = 10;  //최대 용량 설정

function previewImages(event) {
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';

    const files = event.target.files;
    const maxFileSize = FileSizeNum * 1024 * 1024    // 업로드 파일 MB단위 용량 제한

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 이미지 첨부 할 때 확인
        if (file.size > maxFileSize) {
            alert(`${file.name}파일의 크기가 ${FileSizeNum}MB를 초과했습니다.\n 용량을 확인해주세요.`);
            continue;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('img-thumbnail', 'me-2', 'mb-2');
            img.style.width = '100px'; 
            imagePreviewContainer.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-create-form');

    const accessToken = localStorage.getItem('access_token');

    productForm.onsubmit = async function (e) {
        e.preventDefault(); // 기본 폼 제출 동작을 막음

        const formData = new FormData();
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
        formData.append("title", document.getElementById('title').value);
        formData.append("price", document.getElementById('price').value);
        formData.append("content", document.getElementById('content').value);
        formData.append("tags", document.getElementById('tags').value);
        formData.append("status", document.getElementById('status').value);

        const images = document.getElementById('image-upload').files;
        const maxFileSize = FileSizeNum * 1024 * 1024;
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];

            // 등록하기 누를 때, 확인함
            if (image.size > maxFileSize) { 
                alert(`${image.name} 파일의 크기가 용량을 초과했습니다. 다른 파일을 선택하세요.`);
                return;
            }

            formData.append('images', image);
        }

        try {
            const response = await fetch("/api/products/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,  // CSRF 토큰 설정
                    "Authorization": `Bearer ${accessToken}`  // 인증 토큰 설정
                },
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                const productPk = responseData.id; // 서버 응답에서 생성된 제품의 pk 값을 추출
                window.location.href = `/api/products/detail-page/${productPk}/`;
                console.log("제품이 성공적으로 등록되었습니다.");
            } else {
                console.error("제품 등록에 실패했습니다.");
                const errorData = await response.json();
                console.log("에러 메시지:", errorData);
            }
        } catch (error) {
            console.error("서버와 통신 중 문제가 발생했습니다.", error);
        }
    };
});