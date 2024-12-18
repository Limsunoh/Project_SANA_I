from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from back.products.models import Product
from back.products.serializers import ProductListSerializer
from back.reviews.models import Review
from back.reviews.serializers import ReviewSerializer

from .models import User
from .validata import passwordValidation


# [JWT 토큰 생성 함수] 사용자에 대한 access 및 refresh 토큰을 생성
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    checkpassword = serializers.CharField(write_only=True, required=True)
    postcode = serializers.CharField()
    mainaddress = serializers.CharField()
    subaddress = serializers.CharField()
    profile_image = serializers.SerializerMethodField()
    total_score = serializers.FloatField(read_only=True)  # total_score 필드 추가

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "password",
            "checkpassword",
            "name",
            "nickname",
            "birth",
            "email",
            "postcode",
            "mainaddress",
            "subaddress",
            "extraaddress",
            "image",
            "profile_image",
            "introduce",
            "created_at",
            "total_score",  # 필드에 total_score 추가
        )
        read_only_fields = ("id", "created_at", "total_score")
        write_only_fields = ("image",)

    # [데이터 유효성 검사] 이메일 입력 여부와 비밀번호 일치 여부 확인.
    def validate(self, data):
        if "email" not in data or not data["email"]:
            raise serializers.ValidationError("이메일을 입력해주세요.")
        if data["password"] != data["checkpassword"]:
            raise serializers.ValidationError("똑같은 비밀번호를 입력하세요.")
        return data

    # [프로필 이미지 URL 반환] 사용자의 프로필 이미지 URL 반환
    def get_profile_image(self, obj):
        return obj.get_profile_image_url()

    # [사용자 생성] 사용자 객체 생성.
    def create(self, validated_data):
        validated_data.pop("checkpassword")
        image = validated_data.get("image")
        if not image:
            image = "images/default_profile.jpg"  # 이미지 필드에 추가한 프로필 이미지가 없을 경우 default_profile 로 설정

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            name=validated_data.get("name", ""),
            nickname=validated_data.get("nickname", ""),
            birth=validated_data.get("birth", None),
            postcode=validated_data.get("postcode", ""),
            mainaddress=validated_data.get("mainaddress"),
            subaddress=validated_data.get("subaddress"),
            image=image,
            introduce=validated_data.get("introduce", ""),
        )
        user.set_password(validated_data["password"])
        user.is_active = False
        user.total_score = 30  # 기본 점수 설정
        # 이메일 인증 후 계정 사용 가능하게 처리 (is_active = True)

        user.save()  # 상태 저장

        tokens = get_tokens_for_user(user)

        # [이메일 전송] 사용자에게 계정 활성화를 위한 이메일 발송.
        html_message = render_to_string(
            "accounts_activate_email.html",
            {
                "user": user,
                "domain": "http://127.0.0.1:8000",
                "pk": force_str(urlsafe_base64_encode(force_bytes(user.pk))),
                "token": tokens["access"],
            },
        )
        mail_subject = "[딸기마켓] 회원가입 인증 메일입니다"
        to_email = user.email
        from_email = settings.DEFAULT_FROM_EMAIL

        email = EmailMultiAlternatives(mail_subject, "", from_email, [to_email])
        email.attach_alternative(html_message, "text/html")
        email.send()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # [JWT 토큰 생성] 사용자 이름 포함 토큰 생성.
    def validate(self, attrs):
        data = super().validate(attrs)

        # 이메일 인증 확인
        if not self.user.is_active:
            raise serializers.ValidationError({"detail": "이메일 인증이 완료되지 않은 계정입니다."}, code="not_verified")
        data["username"] = self.user.username
        return data


class UserFollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "nickname",
            "image",
        )


class UserProfileSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    like_products = serializers.SerializerMethodField()
    followings = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    total_score = serializers.FloatField(read_only=True)  # 여기에 total_score 추가
    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = User
        fields = (
            "name",
            "nickname",
            "birth",
            "email",
            "postcode",
            "mainaddress",
            "subaddress",
            "extraaddress",
            "created_at",
            "image",
            "profile_image",
            "introduce",
            "products",
            "like_products",
            "followings",
            "followers",
            "reviews",
            "total_score",
        )

    def get_profile_image(self, obj):
        return obj.get_profile_image_url()

    def get_products(self, obj):
        products = Product.objects.filter(author=obj)
        return ProductListSerializer(products, many=True).data

    def get_like_products(self, obj):
        like_products = obj.like_products.all()
        return ProductListSerializer(like_products, many=True).data

    def get_followings(self, obj):
        followings = obj.followings.all()
        return UserFollowSerializer(followings, many=True).data

    def get_followers(self, obj):
        followers = obj.followers.all()
        return UserFollowSerializer(followers, many=True).data

    def get_reviews(self, obj):
        reviews = Review.objects.filter(author=obj)
        return ReviewSerializer(reviews, many=True).data

    # 유저가 작성한 제품에 대한 리뷰 점수의 총합 계산
    def get_review_score_total(self, obj):
        total_score = 0
        products = Product.objects.filter(author=obj)  # 유저가 작성한 제품 가져오기

        # 각 제품에 연결된 리뷰의 점수를 합산
        for product in products:
            if product.reviews:  # 리뷰가 존재할 경우
                total_score += product.reviews.score  # 해당 제품의 리뷰 점수 합산

        return total_score


class UserChangeSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "username",
            "nickname",
            "name",
            "postcode",
            "mainaddress",
            "subaddress",
            "extraaddress",
            "birth",
            "email",
            "image",
            "profile_image",
            "introduce",
        )
        read_only_fields = ("username",)

    def get_profile_image(self, obj):
        return obj.get_profile_image_url()


class ChangePasswordSerializer(serializers.Serializer):
    # [비밀번호 재생성을 위한 입력 필드] 각각 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인 입력을 위한 필드
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    password_check = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("현재 비밀번호가 올바르지 않습니다.")
        return value

    def validate(self, data):
        if data["new_password"] != data["password_check"]:
            raise serializers.ValidationError("새 비밀번호가 일치하지 않습니다.")
        if not passwordValidation(data["new_password"]):
            raise serializers.ValidationError("비밀번호는 8자 이상이며, 숫자와 특수 문자를 포함해야 합니다.")
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "nickname",
            "profile_image",
        )

    def get_profile_image(self, obj):
        return obj.get_profile_image_url()
