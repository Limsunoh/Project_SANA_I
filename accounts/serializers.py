from .models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from your_jwt_library import JWT_PAYLOAD_HANDLER, JWT_ENCODE_HANDLER  # JWT 핸들러 가져오기
from django.conf import settings  # from_email 사용을 위해 settings 임포트


class UserSerializer(serializers.ModelSerializer):
    # password = serializers.CharField(
    #     write_only=True, required=True, validators=[validate_password]
    # )
    # checkpassword = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "password",
            "name",
            "nickname",
            "birth",
            "email",
            "address",
            "image",
            "introduce",
            "created_at",
            # "checkpassword",
        )
        read_only_fields = ("id",)
        
    # def validate(self, data):
    #     if data["password"] != data["checkpassword"]:
    #         raise serializers.ValidationError("똑같은 비밀번호를 입력하세요.")
    #     return data
    
    # def validate_username(self, obj):
    #     if username.is_valid(obj):
    #         return obj
    #     raise serializers.ValidationError('닉네임은 한 글자 이상이어야 합니다.')
    
    # def validate_email(self, obj):
    #     if email_isvalid(obj):
    #         return obj
    #     raise serializers.ValidationError('메일 형식이 올바르지 않습니다.')
    def create(self, validated_data):
        password = validated_data.get("password")
        user = super().create(validated_data)
        user.set_password(validated_data["password"])
        user.is_active = False
        user.save()
        
        payload = JWT_PAYLOAD_HANDLER(user)
        jwt_token = JWT_ENCODE_HANDLER(payload)
        
        message = render_to_string('accounts/accounts_activate_email.html', {
            'user': user,
            'domain': 'localhost:8000',
            'uid': force_str(urlsafe_base64_encode(force_bytes(user.pk))),
            'token': jwt_token,
        })
        print(message)
        
        mail_subject = '[SDP] 회원가입 인증 메일입니다'
        to_email = user.email
        from_email = settings.DEFAULT_FROM_EMAIL
        
        
        email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
        email.send()
        return user

    
    
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
