from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .validators import validate_user_data
from django.shortcuts import render, redirect, HttpResponse
from .serializers import UserSerializer
from rest_framework import generics
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import render, redirect
from rest_framework_simplejwt.tokens import AccessToken
from django.http import HttpResponse


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permissons_classes = [AllowAny]


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
