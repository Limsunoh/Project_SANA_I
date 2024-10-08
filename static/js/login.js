document.getElementById("login-form").onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataObj = Object.fromEntries(formData.entries());
    

    const response = await fetch("/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
    });
    console.log(formDataObj)


    if (response.ok) {
        const data = await response.json();

        // 액세스 토큰과 리프레시 토큰만 저장
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        // **username이 응답에 포함되어 있다면 로컬 스토리지에 저장**
        if (data.username) {
            localStorage.setItem("current_username", data.username);
        } else {
            console.error("Username not found in response data");
        }

        alert("로그인이 되었습니다.");

        // 프로필 호출 없이 바로 홈 페이지로 이동
        window.location.href = "/api/products/home-page/";
    } else {
        const errorData = await response.json();
        document.getElementById("message").innerText = "아이디 혹은 비밀번호를 확인하세요";
    }
};
