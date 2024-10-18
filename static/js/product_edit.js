const FILE_SIZE_LIMIT_MB = 10; 
const MAX_PROFILE_IMAGE_SIZE = FILE_SIZE_LIMIT_MB * 1024 * 1024; // MB 단위

// 이미지 미리보기 및 용량 제한 함수
function previewImages(event) {
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = '';

    const files = event.target.files;
    let fileSizeExceeded = false;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일 크기 검사
        if (file.size > MAX_PROFILE_IMAGE_SIZE) {
            alert(`${file.name}의 크기가 ${FILE_SIZE_LIMIT_MB}MB를 초과합니다.`);
            fileSizeExceeded = true;
            break;
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

    // 파일 크기가 초과되었으면 이미지 미리보기를 초기화
    if (fileSizeExceeded) {
        imagePreviewContainer.innerHTML = ''; // 미리보기 비우기
        event.target.value = ''; // 파일 선택 초기화
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-edit-form');
    const productId = window.location.pathname.split('/').slice(-2, -1)[0];

    // 파일 업로드 용량 제한 검사 및 미리보기 등록
    const imageUploadInput = document.getElementById('image-upload');
    imageUploadInput.addEventListener('change', previewImages);

    productForm.onsubmit = async function (e) {
        e.preventDefault();

        const formData = new FormData(productForm);
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        const images = imageUploadInput.files;
        let fileSizeExceeded = false;

        for (let i = 0; i < images.length; i++) {
            // 파일 크기 검사
            if (images[i].size > MAX_PROFILE_IMAGE_SIZE) {
                alert(`${images[i].name}의 크기가 ${FILE_SIZE_LIMIT_MB}MB를 초과합니다.`);
                fileSizeExceeded = true;
                break;
            }
            formData.append('images', images[i]);
        }

        // 파일 크기가 초과되었으면 폼 제출 중단
        if (fileSizeExceeded) {
            return;
        }

        // 해시태그에서 마지막 쉼표 제거
        let tagsInput = document.getElementById("tags").value.trim();
        if (tagsInput.endsWith(',')) {
            tagsInput = tagsInput.slice(0, -1); // 마지막 쉼표 제거
        }
        formData.set('tags', tagsInput); // 수정된 해시태그 값을 formData에 설정

        try {
            const response = await fetch(`/api/products/${productId}/`, {
                method: "PUT",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: formData
            });

            if (response.ok) {
                window.location.href = `/api/products/detail-page/${productId}/`;
            } else {
                const errorData = await response.json();
                console.error("에러 발생:", errorData);
            }
        } catch (error) {
            console.error("서버 통신 중 오류 발생:", error);
        }
    };
});
