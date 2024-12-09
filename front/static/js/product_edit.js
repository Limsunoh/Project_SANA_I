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

    const imageUploadInput = document.getElementById('image-upload');
    const tagsInput = document.getElementById('tags');
    const tagsError = document.getElementById('tags-error');

    // 파일 업로드 용량 제한 검사 및 미리보기 등록
    imageUploadInput.addEventListener('change', previewImages);

    // 해시태그 유효성 검사 함수
    function validateTags(tagsArray) {
        const invalidChars = /[#@!$%^&*()]/;  // 허용하지 않는 특수문자
        return tagsArray.every(tag => {
            return tag !== '' && !tag.includes(' ') && !invalidChars.test(tag);
        });
    }

    // 해시태그 입력 시 유효성 검사
    tagsInput.addEventListener('input', function () {
        const tags = tagsInput.value.split(',').map(tag => tag.trim());

        if (!validateTags(tags)) {
            tagsError.style.display = 'block';  // 에러 메시지 표시
        } else {
            tagsError.style.display = 'none';  // 에러 메시지 숨김
        }
    });

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
            alert("파일 크기가 너무 큽니다. 다시 시도해주세요.");
            return;
        }

        // 해시태그에서 마지막 쉼표 제거
        let tagsInputValue = tagsInput.value.trim();
        const tagsArray = tagsInputValue.split(',').map(tag => tag.trim());

        // 해시태그 유효성 검사 (제출 시)
        if (!validateTags(tagsArray)) {
            tagsError.style.display = 'block';
            alert("해시태그가 유효하지 않습니다. 띄어쓰기나 특수문자는 허용되지 않습니다.");
            return;  // 유효하지 않으면 폼 제출 중단
        } else {
            tagsError.style.display = 'none';  // 유효하면 에러 메시지 숨김
        }

        // 최종 유효한 해시태그만 formData에 추가
        formData.set('tags', tagsArray.join(','));

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
                alert("제품이 성공적으로 수정되었습니다.");
                window.location.href = `/api/products/detail-page/${productId}/`;
            } else {
                const errorData = await response.json();
                alert("제품 수정에 실패했습니다: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("서버 통신 중 오류 발생:", error);
            alert("서버와 통신 중 문제가 발생했습니다. 나중에 다시 시도해주세요.");
        }
    };
});
