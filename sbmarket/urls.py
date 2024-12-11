from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from back.products.views import HomePageView

urlpatterns = [
    path("", HomePageView.as_view(), name="home-page"),
    path("admin/", admin.site.urls),
    path("api/accounts/", include("back.accounts.urls")),
    path("accounts/", include("front.accounts.urls")),
    path("api/products/", include("back.products.urls")),
    path("products/", include("front.products.urls")),
    path("api/reviews/", include("back.reviews.urls")),
    path("reviews/", include("front.reviews.urls")),
    path("api/manager/", include("back.manager.urls")),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
