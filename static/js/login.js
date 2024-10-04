document.getElementById("login-form").onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataObj = Object.fromEntries(formData.entries());

    const response = await fetch("/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
    });

    if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        alert("로그인이 되었습니다.");
        window.location.href = "/home/";  // 로그인 성공 후 홈 페이지로 이동
    } else {
        const errorData = await response.json();
        document.getElementById("message").innerText = "아이디 혹은 비밀번호를 확인하세요";
    }
};
