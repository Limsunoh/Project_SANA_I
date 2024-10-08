from django.contrib.auth.password_validation import validate_password
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.templatetags.static import static
from django.core.mail import EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from products.models import Product
from products.serializers import ProductListSerializer, ChatRoomSerializer
from .validata import passwordValidation
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# JWT 토큰 생성하는 함수
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    checkpassword = serializers.CharField(write_only=True, required=True)
    postcode = serializers.CharField()
    mainaddress = serializers.CharField()
    subaddress = serializers.CharField()
    profile_image = serializers.SerializerMethodField()

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
        )
        read_only_fields = ("id",)
        write_only_fields = ("image",)

    def validate(self, data):
        if "email" not in data or not data["email"]:
            raise serializers.ValidationError("이메일을 입력해주세요.")
        # 비밀번호 두개가 일치하는지 확인
        if data["password"] != data["checkpassword"]:
            raise serializers.ValidationError("똑같은 비밀번호를 입력하세요.")
        return data

    def get_profile_image(self, obj):
        return obj.get_profile_image_url()

    def create(self, validated_data):
        # checkpassword 필드는 사용하지 않으므로 제거해야함.
        validated_data.pop("checkpassword")

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            name=validated_data.get("name", ""),
            nickname=validated_data.get("nickname", ""),
            birth=validated_data.get("birth", None),
            postcode=validated_data.get("postcode", ""),
            mainaddress=validated_data.get("mainaddress"),
            subaddress=validated_data.get("subaddress"),
            image=validated_data.get("image"),
            introduce=validated_data.get("introduce", ""),
        )

        user.set_password(validated_data["password"])
        user.is_active = False  # 사용자는 이메일 인증 후 활성화
        user.save()

        # JWT 토큰을 생성
        tokens = get_tokens_for_user(user)

        # 이메일 내용 렌더링 (HTML)
        html_message = render_to_string(
            "accounts/accounts_activate_email.html",
            {
                "user": user,
                "domain": "127.0.0.1:8000",  # 실제 배포할때는 도메인 변경해야함 필수!
                "pk": force_str(urlsafe_base64_encode(force_bytes(user.pk))),
                "token": tokens["access"],
            },
        )

        # sanai.sbmarket@gmail.com이 이메일 전송
        mail_subject = "[SBmarket] 회원가입 인증 메일입니다"
        to_email = user.email
        from_email = settings.DEFAULT_FROM_EMAIL

        # EmailMultiAlternatives를 사용하여 HTML 메일 전송
        # EmailMultiAlternatives이 없으면 메일에 html 형식 다보임
        email = EmailMultiAlternatives(mail_subject, "", from_email, [to_email])
        email.attach_alternative(html_message, "text/html")
        email.send()

        return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)  # 기본 토큰 생성 로직 호출
        data['username'] = self.user.username
        data['nickname'] = self.user.nickname
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
    profile_image = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = User
        fields = (
            "name",
            "nickname",
            "birth",
            "email",
            "mainaddress",
            "created_at",
            "image",
            "profile_image",
            "introduce",
            "products",
            "like_products",
            "followings",
            "followers",
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
        follwers = obj.followers.all()
        return UserFollowSerializer(follwers, many=True).data
    



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
        )
        read_only_fields = ("username",)

    def get_profile_image(self, obj):
        return obj.get_profile_image_url()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    password_check = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("현재 비밀번호가 올바르지 않습니다.")
        return value

    def validate(self, data):
        new_password = data["new_password"]
        password_check = data["password_check"]

        # 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
        if new_password != password_check:
            raise serializers.ValidationError("새 비밀번호가 일치하지 않습니다.")

        # 비밀번호 검증 로직 추가
        if not passwordValidation(new_password):
            raise serializers.ValidationError(
                "비밀번호는 8자 이상이어야 하며, 숫자와 특수 문자를 포함해야 합니다."
            )

        return data

    def update(self, instance, validated_data):
        # 새로운 비밀번호 설정
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance
