document.addEventListener('DOMContentLoaded', function () {
    const profileUsername = document.getElementById('profile-username').dataset.username;
    loadFollowerList(profileUsername);
});

async function loadFollowerList(username) {
    const followersListContainer = document.getElementById('followers-list');

    showLoading(); // 로딩 표시

    try {
        const response = await fetch(`/api/accounts/user/${username}/followers/`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('팔로워 목록을 불러오는데 실패했습니다.');
        }

        const followers = await response.json();
        followersListContainer.innerHTML = '';

        followers.forEach(user => {
            const userCard = `
                <div class="card m-2" style="width: 18rem;">
                    <img src="${user.profile_image}" class="card-img-top" alt="${user.username}">
                    <div class="card-body">
                        <h5 class="card-title">${user.nickname} (@${user.username})</h5>
                        <a href="/api/accounts/profile-page/${user.username}/" class="btn btn-primary">프로필 보기</a>
                    </div>
                </div>
            `;
            followersListContainer.insertAdjacentHTML("beforeend", userCard);
        });

        if (followers.length === 0) {
            followersListContainer.innerHTML = "<p>팔로워가 없습니다.</p>";
        }

    } catch (error) {
        console.error('에러 발생:', error);
        followersListContainer.innerHTML = "<p>팔로워 목록을 불러올 수 없습니다.</p>";
    } finally {
        hideLoading(); // 로딩 숨기기
    }
}
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
