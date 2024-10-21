from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import (CreateAPIView, 
                                    RetrieveUpdateDestroyAPIView, 
                                    ListAPIView,
                                    )
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
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _
from .models import User
from products.models import Product
from .permissions import IsOwnerOrReadOnly
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserListSerializer
from products.serializers import ProductListSerializer
from reviews.serializers import ReviewSerializer, PurchaseSerializer

from reviews.models import Review


# [사용자 생성 뷰] 새로운 사용자 계정을 생성
class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # [데이터 검증] 사용자가 입력한 데이터의 유효성 체크
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("데이터 검증 오류:", serializer.errors)
            return Response(serializer.errors, status=400)

        # [사용자 생성] 해당 데이터로 사용자객체 생성
        self.perform_create(serializer)
        return Response({"message": "success"}, status=201)


# [이메일 인증] 이메일 인증 완료 시 is_active = True 해 계정 활성화해주는 로직
def activate_user(request, pk, token):
    try:
        # [사용자 ID 복원] pk를 디코딩하여 사용자 객체를 가져옴
        pk = force_str(urlsafe_base64_decode(pk))
        user = User.objects.get(pk=pk)

        # [토큰 유효성 검증] 제공된 토큰이 유효한지 확인
        token_obj = AccessToken(token)

        if token_obj and token_obj["user_id"] == user.id:
            user.is_active = True  # 사용자의 계정을 활성화
            user.save()
            return HttpResponse("이메일 인증이 완료되었습니다! 로그인하세요.")
        return HttpResponse("유효하지 않은 토큰입니다.", status=400)

    # 기타 오류
    except User.DoesNotExist:
        return HttpResponse("사용자가 존재하지 않습니다.", status=400)

    except Exception as e:
        return HttpResponse(f"에러 발생: {e}", status=400)


# [사용자 프로필 뷰] 프로필 정보 조회, 수정, 삭제
class UserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    lookup_field = "username"
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        # [READ] 프로필 정보 조회 = GET
        if self.request.method == "GET":
            return UserProfileSerializer
        
        # [UPDATE] 프로필 업데이트 = PATCH or PUT
        elif self.request.method in ["PATCH", "PUT"]:
            return UserChangeSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        # [사용자 정보 조회] 모든 사용자 목록을 리턴
        return User.objects.all()
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # form 데이터가 올바르게 전달되었는지 확인
        print("Request Data:", request.data)  # 서버 로그에 request 데이터를 출력

        # [프로필 이미지 삭제] remove_image 플래그 처리
        if request.data.get('remove_image') == 'true':
            if user.image:
                user.image.delete()

        # [프로필 이미지 업데이트] 새로운 이미지가 업로드 되었을 경우
        if 'image' in request.FILES:
            user.image = request.FILES['image']

        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # [사용자 삭제] 계정 비활성화 + 해당 사용자가 등록한 상품 게시글 삭제
        user = get_object_or_404(User, username=kwargs.get("username"))
        if user == request.user:
            user.is_active = False  # 계정 비활성화
            products = Product.objects.filter(author=user)
            products.delete()  # 상품 게시글 삭제
            user.save()
            return Response({"message": "삭제처리가 완료되었습니다."}, status=200)
        return Response({"message": "삭제처리할 권한이 없습니다."}, status=403)


# [비밀번호 변경] 사용자의 비밀번호를 변경
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def patch(self, request, username):
        # [사용자 조회] 비밀번호를 변경할 사용자 조회
        user = get_object_or_404(User, username=username)
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response({"message": "success"}, status=200)
        return Response(serializer.errors, status=400)


# [팔로우 기능] 팔로우 및 언팔로우 처리
class FollowView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        # [팔로우 상태 확인] 요청자가 해당 사용자를 팔로우 중인지 확인
        user = User.objects.get(username=username)
        is_following = request.user in user.followers.all()
        return Response({'is_following': is_following}, status=200)

    def post(self, request, username):
        # [팔로우/언팔로우 처리] 요청자의 팔로우 상태를 변경
        target_user = get_object_or_404(User, username=username)
        current_user = request.user
        if current_user in target_user.followers.all():
            target_user.followers.remove(current_user)
            return Response("unfollow했습니다.", status=200)
        target_user.followers.add(current_user)
        return Response("follow했습니다.", status=200)


# [팔로잉 목록 조회] 사용자의 팔로잉 목록을 반환
class UserFollowingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followings = user.followings.all()
        serializer = UserListSerializer(followings, many=True)
        return Response(serializer.data, status=200)


# [팔로워 목록 조회] 사용자의 팔로워 목록을 반환
class UserFollowerListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all()
        serializer = UserListSerializer(followers, many=True)
        return Response(serializer.data, status=200)


# [커스텀 토큰 생성] 사용자 이름을 포함한 JWT 토큰 생성
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
    # 사용자가 입력한 username으로 사용자 객체를 가져옴
        user = get_object_or_404(User, username=request.data.get('username'))
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "아이디나 비밀번호를 확인해주세요."}, status=401)
        if not user.is_active:
            return Response({"detail": "이메일 인증을 완료해 주세요."}, status=403)
        return super().post(request, *args, **kwargs)


# [찜한 상품 목록 조회 API] 사용자가 찜한 상품 목록 반환
class LikeListForUserAPIView(APIView):
    permission_classes = [AllowAny]

    # 사용자가 찜한 상품 목록을 조회하고 반환
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        liked_products = Product.objects.filter(likes=user)
        serializer = ProductListSerializer(liked_products, many=True)
        return Response(serializer.data, status=200)


# [사용자 상품 목록 API] 사용자가 작성한 상품 목록 조회
class UserProductsListView(ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Product.objects.filter(author__username=username)


# [사용자 구매 내역 API] 사용자가 구매한 상품 목록 조회
class PurchaseHistoryListView(ListAPIView):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(chatrooms__buyer=user, chatrooms__status__is_sold=True)


# [사용자 작성한 후기 API] 사용자가 작성한 후기 목록 조회
class UserReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return Review.objects.filter(author=user, is_deleted=False)


# [사용자 받은 후기 API] 사용자가 받은 후기 조회 (매너점수 클릭 시)
class ReceivedReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return Review.objects.filter(product__author=user, is_deleted=False)



# ------------------------------------------------------------------------------
# Template View 

# [회원가입 페이지] 회원가입 template
class SignupPageView(TemplateView):
    template_name = "signup.html"


# [로그인 페이지] 로그인 template
class LoginPageView(TemplateView):
    template_name = "login.html"


# [프로필 페이지] 프로필 template
class ProfileView(TemplateView):
    template_name = "profile.html"


# [프로필 수정 페이지] 프로필 수정 template
class Profile_editView(TemplateView):
    template_name = "profile_edit.html"


# [비밀번호 변경 페이지] 비밀번호 변경 template
class ChangePasswordPageView(TemplateView):
    template_name = "change_password.html"


# [팔로잉 목록 페이지] 팔로잉 목록 template
class FollowingsPageView(TemplateView):
    template_name = "followings.html"

    def get_context_data(self, **kwargs):
        # [팔로잉 정보 조회] 팔로잉 목록과 사용자 정보 추가
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get('username')
        profile_user = get_object_or_404(User, username=username)
        context['profile_user'] = profile_user
        context['followings'] = profile_user.followings.all()
        return context


# [팔로워 목록 페이지] 팔로워 목록 template
class FollowersPageView(TemplateView):
    template_name = "followers.html"

    def get_context_data(self, **kwargs):
        # [팔로워 정보 조회] 팔로워 목록과 사용자 정보 추가
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get('username')
        profile_user = get_object_or_404(User, username=username)
        context['profile_user'] = profile_user
        context['followers'] = profile_user.followers.all()
        return context


# 사용자가 찜한 리스트 template
class LikeProductsPageView(TemplateView):
    template_name = "liked_products.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")
        profile_user = get_object_or_404(User, username=username)
        context["profile_user"] = profile_user
        return context


# 사용자가 작성한 상품 리스트 template
class UserProductsListPageView(TemplateView):
    template_name = "user_products.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")  # URL에서 username 가져오기
        profile_user = get_object_or_404(
            User, username=username
        )  # username으로 사용자 객체 가져오기
        context["profile_user"] = profile_user  # 템플릿에 profile_user 추가
        return context


# 사용자가 구매한 제품 목록 template
class PurchaseHistoryListViewTemplate(TemplateView):
    template_name = "purchase_history_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")  # URL에서 username 가져오기
        profile_user = get_object_or_404(
            User, username=username
        )  # username으로 사용자 객체 가져오기
        context["profile_user"] = profile_user  # 템플릿에 profile_user 추가
        return context


# 사용자가 작성한 후기 목록 template
class UserReviewListViewTemplate(TemplateView):
    template_name = "user_review_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")  # URL에서 username 가져오기
        profile_user = get_object_or_404(
            User, username=username
        )  # username으로 사용자 객체 가져오기
        context["profile_user"] = profile_user  # 템플릿에 profile_user 추가
        return context


# 사용자가 받은 후기 목록 template(매너온도 클릭 시)
class ReceivedReviewListViewTemplate(TemplateView):
    template_name = "received_review_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")  # URL에서 username 가져오기
        profile_user = get_object_or_404(
            User, username=username
        )  # username으로 사용자 객체 가져오기
        context["profile_user"] = profile_user  # 템플릿에 profile_user 추가
        return context