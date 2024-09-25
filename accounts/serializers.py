from .models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings  
# from_email 사용을 위해 settings 임포트
from rest_framework_simplejwt.tokens import RefreshToken


# JWT 토큰 생성하는 함수
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    checkpassword = serializers.CharField(write_only=True, required=True)

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
            "address",
            "image",
            "introduce",
            "created_at",
        )
        read_only_fields = ("id",)

    def validate(self, data):
        # 비밀번호 두개가 일치하는지 확인
        if data["password"] != data["checkpassword"]:
            raise serializers.ValidationError("똑같은 비밀번호를 입력하세요.")
        return data
    

    def create(self, validated_data):
        # checkpassword 필드는 사용하지 않으므로 제거해야함.
        validated_data.pop('checkpassword')
        
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            nickname=validated_data.get('nickname', ''),
            birth=validated_data.get('birth', None),
            address=validated_data.get('address', ''),
            image=validated_data.get('image', None),
            introduce=validated_data.get('introduce', ''),
        )
        
        user.set_password(validated_data['password'])
        user.is_active = False  # 사용자는 이메일 인증 후 활성화
        user.save()

        # JWT 토큰을 생성
        tokens = get_tokens_for_user(user)

        # 이메일 내용 렌더링 (HTML)
        html_message = render_to_string('accounts/accounts_activate_email.html', {
            'user': user,
            'domain': 'localhost:8000',  # 실제 배포할때는 도메인 변경해야함 필수!
            'pk': force_str(urlsafe_base64_encode(force_bytes(user.pk))),
            'token': tokens['access'],
        })

        # sanai.sbmarket@gmail.com이 이메일 전송
        mail_subject = '[SBmarket] 회원가입 인증 메일입니다'
        to_email = user.email
        from_email = settings.DEFAULT_FROM_EMAIL

        # EmailMultiAlternatives를 사용하여 HTML 메일 전송
        # EmailMultiAlternatives이 없으면 메일에 html 형식 다보임
        email = EmailMultiAlternatives(mail_subject, '', from_email, [to_email])
        email.attach_alternative(html_message, "text/html")
        email.send()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
