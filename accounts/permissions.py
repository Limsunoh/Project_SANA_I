from rest_framework.permissions import BasePermission


    #객체의 소유자만 수정할 수 있고, 나머지 사용자는 읽기만 가능하게 설정.
class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 누구나 허용
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # 쓰기 권한은 객체의 소유자에게만 허용
        return obj == request.user