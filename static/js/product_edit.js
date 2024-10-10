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
    const productForm = document.getElementById('product-edit-form');
    const productId = window.location.pathname.split('/').slice(-2, -1)[0];

    productForm.onsubmit = async function (e) {
        e.preventDefault();

        const formData = new FormData(productForm);
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        const images = document.getElementById('image-upload').files;
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

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
