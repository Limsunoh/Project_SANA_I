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