from back.accounts.models import User
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView

# [회원가입 페이지] 회원가입 template
class SignupPageView(TemplateView):
    template_name = "front.template.accounts.signup.html"


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
        username = self.kwargs.get("username")
        profile_user = get_object_or_404(User, username=username)
        context["profile_user"] = profile_user
        context["followings"] = profile_user.followings.all()
        return context


# [팔로워 목록 페이지] 팔로워 목록 template
class FollowersPageView(TemplateView):
    template_name = "followers.html"

    def get_context_data(self, **kwargs):
        # [팔로워 정보 조회] 팔로워 목록과 사용자 정보 추가
        context = super().get_context_data(**kwargs)
        username = self.kwargs.get("username")
        profile_user = get_object_or_404(User, username=username)
        context["profile_user"] = profile_user
        context["followers"] = profile_user.followers.all()
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
