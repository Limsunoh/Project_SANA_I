from django.urls import path

from . import views

urlpatterns = [
    path("products/<int:product_id>/create/", views.ReviewCreateView.as_view(), name="review-create"),
]
