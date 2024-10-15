from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

app_name = "accounts"
urlpatterns = [
    # API 엔드포인트
    path("signup/", views.UserCreateView.as_view(), name="user-signup"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("users/activate/<pk>/<token>/", views.activate_user, name="activate_user"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    path("profile/<str:username>/", views.UserProfileView.as_view()),
    path("profile/<str:username>/password/",views.ChangePasswordView.as_view()),
    path("follow/<str:username>/", views.FollowView.as_view(), name="follow_view"),
    path("user/<str:username>/followings/", views.UserFollowingListAPIView.as_view(), name="user_followings"),
    path("user/<str:username>/followers/", views.UserFollowerListAPIView.as_view(), name="user_followers"),
    
    # 프론트(화면구성) 주소
    path("signup-page/", views.SignupPageView.as_view(), name="signup-page"),
    path("login-page/", views.LoginPageView.as_view(), name="login-page"),
    path("profile-page/<str:username>/", views.ProfileView.as_view(), name="profile"),
    path("profile_edit-page/<str:username>/", views.Profile_editView.as_view(), name="profile_edit"),
    path("profile/<str:username>/password-page/", views.ChangePasswordPageView.as_view(), name="change_password_page"),
    path('profile/<str:username>/followings/', views.FollowingsPageView.as_view(), name='followings-page'),
    path('profile/<str:username>/followers/', views.FollowersPageView.as_view(), name='followers-page'),
    
]
