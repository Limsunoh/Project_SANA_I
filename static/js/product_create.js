// 이미지 미리보기 함수
function previewImages(event) {
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';

    const files = event.target.files;
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        // 파일 크기 확인
        if (file.size > MAX_IMAGE_SIZE) {
            alert("이미지 크기는 10MB 이하이어야 합니다.");
            return; // 크기 초과 시 미리보기와 업로드 중단
        }

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

        // 해시태그 입력값을 처리 (빈 해시태그를 방지)
        let tagsInput = document.getElementById('tags').value.trim();

        // 쉼표로 구분된 해시태그 목록을 분리하고, 빈 문자열을 제거함
        const tagsArray = tagsInput.split(',')
                                   .map(tag => tag.trim()) // 각 해시태그 양쪽 공백 제거
                                   .filter(tag => tag !== ''); // 빈 해시태그 필터링

        // 유효한 해시태그를 쉼표로 연결
        const validTags = tagsArray.join(',');
        
        // 유효한 태그만 formData에 추가
        formData.append("tags", validTags);

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
                const responseData = await response.json();
                const productPk = responseData.id; // 서버 응답에서 생성된 제품의 pk 값을 추출
                window.location.href = `/api/products/detail-page/${productPk}/`;
                alert("제품이 성공적으로 등록되었습니다.");
            } else {
                console.error("제품 등록에 실패했습니다.");
                const errorData = await response.json();
            }
        } catch (error) {
            console.error("서버와 통신 중 문제가 발생했습니다.", error);
        }
    };
});