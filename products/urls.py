from django.urls import path

from . import views


app_name = "products"
urlpatterns = [
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path("<int:pk>", views.ProductDetailAPIView.as_view(), name="product_detail"),
]