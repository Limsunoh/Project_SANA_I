"""
URL configuration for sbmarket project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from products.views import HomePageView


def trigger_error(request):
    1 / 0


urlpatterns = [
    path("", HomePageView.as_view(), name="home-page"),
    path("admin/", admin.site.urls),
    path("api/products/", include("products.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/manager/", include("manager.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("sentry-debug/", trigger_error),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
