from django.urls import path
from .views import UserCreateView

urlpatterns = [
    path('api/accounts/signup/', UserCreateView.as_view(), name='user-signup'),
]