document.addEventListener("DOMContentLoaded", function () {
    const changePasswordForm = document.getElementById("change-password-form");
    const messageDiv = document.getElementById("message");

    // URL에서 username 추출
    const profileUsername = window.location.pathname.split('/').filter(Boolean)[3];
    document.getElementById("username").value = profileUsername;

    changePasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const currentPassword = document.getElementById("current_password").value;
        const newPassword = document.getElementById("new_password").value;
        const passwordCheck = document.getElementById("password_check").value;

        // 로컬 스토리지에서 JWT 토큰 가져오기
        const accessToken = localStorage.getItem("access_token");

        try {
            const response = await fetch(`/api/accounts/profile/${username}/password/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,  // JWT 토큰을 Authorization 헤더에 포함
                    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    password_check: passwordCheck
                }),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">비밀번호가 성공적으로 변경되었습니다.</div>`;
                changePasswordForm.reset();
            } else {
                let errorMessage = "비밀번호 변경에 실패했습니다.<br>";
                for (let key in result) {
                    errorMessage += `${key}: ${result[key]}<br>`;
                }
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            messageDiv.innerHTML = `<div class="alert alert-danger">비밀번호 변경 중 오류가 발생했습니다.</div>`;
        }
    });
});
