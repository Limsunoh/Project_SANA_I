// 로그인 폼 제출 이벤트 리스너
const loginForm = document.getElementById("login-form");
loginForm.onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataObj = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    // CSRF 토큰 가져오기
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch("/accounts/login/", {  // URL 수정
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken // CSRF 토큰 추가
            },
            body: JSON.stringify(formDataObj),
        });

        if (response.ok) {
            const data = await response.json();

            // 액세스 토큰과 리프레시 토큰 저장
            setAccessToken(data.access);
            setRefreshToken(data.refresh);
            if (data.username) {
                localStorage.setItem("current_username", data.username);
            } else {
                console.error("Username not found in response data");
            }

            alert("로그인이 되었습니다.");
            window.location.href = "/";
        } else {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                console.error("Error parsing JSON response:", e);
                showAlert("로그인 중 문제가 발생했습니다. 다시 시도해 주세요.");
                return;
            }
            // 이메일 인증이 필요한 경우
            const messageElement = document.getElementById("message");
            if (response.status === 403 && errorData.detail === "이메일 인증을 완료해 주세요.") {
                showAlert("이메일 인증을 완료해 주세요.");
            } else if (response.status === 404 && errorData.detail === "No User matches the given query.") {
                showAlert("존재하지 않는 사용자입니다. 아이디를 다시 확인해 주세요.");
            } else {

                if (messageElement) {
                    messageElement.innerText = "아이디 혹은 비밀번호를 확인하세요???";
                } else {
                    console.error("메시지 표시 요소를 찾을 수 없습니다.");
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
};
// 경고 메시지 표시 함수
function showAlert(message) {
    alert(message);  // 기본 alert 팝업
}
// 토큰 저장 함수
function setAccessToken(token) {
    localStorage.setItem("access_token", token);
}
function setRefreshToken(token) {
    localStorage.setItem("refresh_token", token);
}
// 이메일 인증 메시지 확인
const urlParam = new URLSearchParams(window.location.search);
if (urlParam.has('activation')) {
    const activationMessage = "이메일 인증이 완료되었습니다! 로그인하세요.";
    showAlert(activationMessage);
}
