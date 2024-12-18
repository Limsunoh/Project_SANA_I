document.addEventListener("DOMContentLoaded", function () {
    const changePasswordForm = document.getElementById("change-password-form");
    const messageDiv = document.getElementById("message");

    // URL에서 username 추출
    const profileUsername = window.location.pathname.split('/').filter(Boolean)[2];
    console.log("URL에서 추출된 profileUsername:", profileUsername);

    // current_username 필드 설정
    const currentUsernameField = document.getElementById("current_username");
    if (!currentUsernameField) {
        console.error("current_username 필드가 없습니다.");
        return; // 필드가 없으면 종료
    }
    currentUsernameField.value = profileUsername;

    if (!changePasswordForm) {
        console.error("change-password-form이 없습니다.");
        return; // 폼이 없으면 종료
    }

    changePasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("current_username").value;
        const currentPassword = document.getElementById("current_password").value;
        const newPassword = document.getElementById("new_password").value;
        const passwordCheck = document.getElementById("password_check").value;

        const accessToken = localStorage.getItem("access_token");

        try {
            const response = await fetch(`/api/accounts/profile/${username}/password/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
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
                // 프로필 호출 없이 바로 홈 페이지로 이동
                window.location.href = "/";
            } else {
                let errorMessage = "비밀번호 변경에 실패했습니다.<br>";
                for (let key in result) {
                    errorMessage += `${key}: ${result[key]}<br>`;
                }
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            messageDiv.innerHTML = `<div class="alert alert-danger">오류로 인해 비밀번호 변경이 실패했습니다.</div>`;
        }
    });
});
