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
    const tagsInput = document.getElementById('tags');
    const tagsError = document.getElementById('tags-error');

    const accessToken = localStorage.getItem('access_token');

    // 해시태그 유효성 검사 함수 (특수문자 및 공백 체크)
    function validateTags(tagsArray) {
        const invalidChars = /[#@!$%^&*()]/;  // 허용하지 않는 특수문자
        return tagsArray.every(tag => {
            return tag !== '' && !tag.includes(' ') && !invalidChars.test(tag);
        });
    }

    // 실시간으로 해시태그 유효성 검사
    tagsInput.addEventListener('input', function () {
        const tagsArray = tagsInput.value.split(',');

        if (!validateTags(tagsArray)) {
            tagsError.style.display = 'block';  // 에러 메시지 표시
        } else {
            tagsError.style.display = 'none';  // 에러 메시지 숨김
        }
    });

    productForm.onsubmit = async function (e) {
        e.preventDefault(); // 기본 폼 제출 동작을 막음

        const formData = new FormData();
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
        formData.append("title", document.getElementById('title').value);
        formData.append("price", document.getElementById('price').value);
        formData.append("content", document.getElementById('content').value);

        // 해시태그 입력값
        let tagsInputValue = tagsInput.value;
        const tagsArray = tagsInputValue.split(',').filter(tag => tag !== '');

        // 해시태그 유효성 검사 (제출 시)
        if (!validateTags(tagsArray)) {
            tagsError.style.display = 'block';
            alert("해시태그가 잘못되었습니다. 해시태그에는 띄어쓰기와 특수문자를 포함할 수 없습니다.");
            return;  // 유효하지 않으면 폼 제출 중단
        }

        formData.append("tags", tagsArray.join(','));

        const images = document.getElementById('image-upload').files;
        const maxFileSize = FileSizeNum * 1024 * 1024;
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];

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
                    "X-CSRFToken": csrfToken,
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                const productPk = responseData.id;
                alert("제품이 성공적으로 등록되었습니다.");
                window.location.href = `/api/products/detail-page/${productPk}/`;
            } else {
                const errorData = await response.json();
                
                if (errorData.ERROR && errorData.ERROR.includes('Image')) {
                    alert("이미지는 필수 항목입니다. 최소 한 개의 이미지를 선택해주세요.");
                } else {
                    alert("제품 등록에 실패했습니다. 다시 시도해주세요.");
                }
            }
        } catch (error) {
            alert("서버와 통신 중 문제가 발생했습니다. 다시 시도해주세요.");
            console.error("서버와 통신 중 문제가 발생했습니다.", error);
        }
    };
});
