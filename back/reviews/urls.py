from django.urls import path

from . import views

urlpatterns = [
    path("user/<int:user_id>/", views.ReviewListCreateView.as_view(), name="user-review-list"),
    path("products/<int:product_id>/", views.ReviewListCreateView.as_view(), name="product-review-create"),
    path("<int:pk>/", views.ReviewDetailView.as_view(), name="review-detail"),
]
