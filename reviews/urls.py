from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReviewListCreateView.as_view(), name='review-list-create'),
    path('<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    # path('reviews/<int:pk>/destroy/', views.ReviewDetailView.as_view(), name='review-destroy'),
]