from django.urls import path
from .views import ReviewViewSet

app_name= "reviews"

# router= DefaultRouter()
# router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path("detail/", ReviewViewSet.as_view({'get' : 'retrieve'}), name= "product_review"),
    path("all/", ReviewViewSet.as_view({'get' : 'list'}), name= "user_reviews"),
    path("create/", ReviewViewSet.as_view({'post' : 'create'}), name= "review_create"),
]