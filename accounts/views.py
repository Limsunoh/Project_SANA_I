from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    AllowAny,
)
from django.shortcuts import HttpResponse, get_object_or_404
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.http import HttpResponse
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserChangeSerializer,
    ChangePasswordSerializer,
)
from .models import User
from products.models import Product
from .permissions import IsOwnerOrReadOnly
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserListSerializer


class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("데이터 검증 오류:", serializer.errors)  # 데이터 검증 오류 확인
            return Response(serializer.errors, status=400)

        # 데이터가 유효하면 사용자 생성
        self.perform_create(serializer)
        return Response({"message": "success"}, status=201)


def activate_user(request, pk, token):
    try:
        # pk를 디코딩(암호화된걸 복호화하는느낌)하여 사용자 ID 얻기
        pk = force_str(urlsafe_base64_decode(pk))
        user = User.objects.get(pk=pk)
        print(pk)
        print(user)

        # 받은 JWT 토큰이 유효한지 확인
        token_obj = AccessToken(token)
        print(token_obj)

        if token_obj and token_obj["user_id"] == user.id:
            # 이메일 인증 완료, 사용자 계정 False된걸 해제
            user.is_active = True
            user.save()
            return HttpResponse("이메일 인증이 완료되었습니다! 로그인하세요.")
        else:
            return HttpResponse("유효하지 않은 토큰입니다.", status=400)

    except User.DoesNotExist:
        return HttpResponse("사용자가 존재하지 않습니다.", status=400)

    except Exception as e:
        return HttpResponse(f"에러 발생: {e}", status=400)


class UserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    lookup_field = "username"
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserProfileSerializer
        elif self.request.method in ["PATCH", "PUT"]:
            return UserChangeSerializer
        return super().get_serializer_class()
    
    # # 사용자 프로필 반환
    # def get_queryset(self):
    #     return User.objects.all()

    def get(self, request, *args, **kwargs):
        user = self.get_object()  # 현재 사용자 객체 가져오기
        serializer = self.get_serializer(user)

        # 유저의 총 점수 추가
        total_score = user.total_review_score  # 총 점수 계산
        data = serializer.data
        data['total_score'] = total_score  # 총 점수를 응답 데이터에 추가

        return Response(data)

    def destroy(self, request, *args, **kwargs):
        # `lookup_field`를 사용하여 해당 사용자를 찾기
        user = get_object_or_404(User, username=kwargs.get("username"))
        # 요청자가 해당 사용자인지 확인
        if user == request.user:
            # is_active 속성을 False로 설정
            user.is_active = False
            products = Product.objects.filter(author=user)
            products.delete()
            user.save()

            # 성공적으로 업데이트된 응답 반환
            return Response({"message": "삭제처리가 완료되었습니다."}, status=200)
        else:
            # 권한이 없을 때 응답
            return Response({"message": "삭제처리할 권한이 없습니다."}, status=403)

# 유저 비밀번호 변경
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def patch(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response({"message": "success"}, status=200)

        return Response(serializer.errors, status=400)


class FollowView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        user = User.objects.get(username=username)
        is_following = request.user in user.followers.all()
        return Response({'is_following': is_following}, status=200)

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        current_user = request.user
        if current_user in target_user.followers.all():
            target_user.followers.remove(current_user)
            return Response("unfollow했습니다.", status=200)
        else:
            target_user.followers.add(current_user)
            return Response("follow했습니다.", status=200)


class UserFollowingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followings = user.followings.all()
        serializer = UserListSerializer(followings, many=True)
        return Response(serializer.data, status=200)


class UserFollowerListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all()
        serializer = UserListSerializer(followers, many=True)
        return Response(serializer.data, status=200)

# 로그인 시 username을 저장할 수 있도록 토큰을 커스텀하는뷰
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Template 참조 Class

# 회원가입 template
class SignupPageView(TemplateView):
    template_name = "signup.html"

# 로그인 template
class LoginPageView(TemplateView):
    template_name = "login.html"

# 프로필 template
class ProfileView(TemplateView):
    template_name = "profile.html"

# 프로필 수정 template
class Profile_editView(TemplateView):
    template_name = "profile_edit.html"

# 비밀번호 수정 template
class ChangePasswordPageView(TemplateView):
    template_name = "change_password.html"

# followings 목록 template
class FollowingsPageView(TemplateView):
    template_name = "followings.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get('username')
        profile_user = get_object_or_404(User, username=username)
        context['profile_user'] = profile_user
        context['followings'] = profile_user.followings.all()
        return context

# Followers 목록 template
class FollowersPageView(TemplateView):
    template_name = "followers.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get('username')
        profile_user = get_object_or_404(User, username=username)
        context['profile_user'] = profile_user
        context['followers'] = profile_user.followers.all()
        return context
