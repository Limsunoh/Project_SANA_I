import sentry_sdk
from django.utils.deprecation import MiddlewareMixin

class SentryUserContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated:
            sentry_sdk.set_user({
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            })
        else:
            sentry_sdk.set_user(None)  # 사용자 정보가 없을 경우 초기화