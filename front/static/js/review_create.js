document.addEventListener('DOMContentLoaded', function () {
    const reviewForm = document.getElementById('review-form');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // 체크리스트 값 모으기
            const checklist = [];
            document.querySelectorAll('input[name="checklist"]:checked').forEach(function (checkbox) {
                checklist.push(checkbox.value);
            });

            // 추가 코멘트 값
            const additionalComments = document.getElementById('additional-comments').value;

            // 현재 사용자의 액세스 토큰 및 제품 ID 가져오기
            const productId = document.querySelector('.review-container').getAttribute('data-product-id');
            const apiUrl = `/api/reviews/products/${productId}/`;

            try {
                const response = await fetchWithAuth(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        checklist: checklist,
                        additional_comments: additionalComments
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "리뷰 작성에 실패했습니다.");
                }

                alert("리뷰가 성공적으로 작성되었습니다.");
                window.location.href = `/products/detail-page/${productId}/`;  // 성공 시 상세 페이지로 리다이렉트
            } catch (error) {
                alert(error.message);
                console.error("리뷰 작성 실패:", error);
            }
        });
    }
});
