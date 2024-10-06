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

        // 액세스 토큰과 리프레시 토큰 저장
        setAccessToken(data.access);
        setRefreshToken(data.refresh);

        alert("로그인이 되었습니다.");

        // 로그인 성공 후 프로필 API 호출
        const accessToken = data.access;
        try {
            const profileResponse = await fetch("/api/accounts/profile/", {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                const username = profileData.username;  // 프로필 API 응답에서 username 가져오기

                console.log("프로필 API에서 가져온 username:", username);

                // username을 localStorage에 저장
                localStorage.setItem("current_username", username);

                // 홈 페이지로 이동
                window.location.href = "/api/products/home-page/";
            } else {
                alert("프로필 정보를 불러오는 데 실패했습니다.");
                console.error("프로필 API 호출 에러:", await profileResponse.text());
            }
        } catch (profileError) {
            console.error("프로필 API 호출 중 오류 발생:", profileError);
            alert("로그인된 사용자의 정보를 가져오는 중 오류가 발생했습니다.");
        }
    } else {
        const errorData = await response.json();
        document.getElementById("message").innerText = "아이디 혹은 비밀번호를 확인하세요";
    }
};
