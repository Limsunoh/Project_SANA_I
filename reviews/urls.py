from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet

app_name= "reviews"

# urlpatterns = [
#     path("<int:pk>/", ReviewViewSet.as_view({'get' : 'retrieve'}), name= "product_review"),
#     path("", ReviewViewSet.as_view({'get' : 'list'}), name= "author_reviews"), # 작성한 리뷰
#     path("", ReviewViewSet.as_view({'get' : 'list'}), name= "reviewed_reviews"), # 작성 받은 리뷰
#     path("create/", ReviewViewSet.as_view({'post' : 'create'}), name= "review_create"),
#     path("delete/", ReviewViewSet.as_view({'delete' : 'destroy'}), name= "review_delete"),
# ]

router= DefaultRouter()
router.register(r'review', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]