// 이미지 미리보기 함수
function previewImages(event) {
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';

    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
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
                window.location.href = "/api/products/detail-page/ <int:pk>/";
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
