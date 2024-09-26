from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('signup/', views.UserCreateView.as_view(), name='user-signup'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/activate/<pk>/<token>/', views.activate_user, name='activate_user'),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", TokenBlacklistView.as_view(), name='logout'),
    path('<str:username>/', views.UserProfileView.as_view()),
    path('<str:username>/password/', views.ChangePasswordView.as_view(),),
    # path('<str:username>/review/',)
    path('follow/<str:username>/', views.FollowView.as_view(), name='follow_view'),
]