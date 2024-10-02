from django.urls import path
from . import views

app_name= "reviews"

# router= DefaultRouter()
# router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path("detail/", views.ReviewViewSet, name= "product_review"),
    path("all/", views.ReviewViewSet, name= "user_reviews"),
    path("create/", views.ReviewViewSet, name= "review_create"),
]