from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .validators import validate_user_data
from django.shortcuts import render,redirect,HttpResponse
from .serializers import UserSerializer
from rest_framework import generics
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMessage
# from .tokens import account_activation_token
# from django.utils.encoding import force_bytes, force_text
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny



class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permissons_classes = [AllowAny]
    # def signup(request):
    #     if request.method == "POST":
    #         if request.POST["password1"] == request.POST["password2"]:
    #             user = User.objects.create_user(
    #                 username=request.POST["username"],
    #                 password=request.POST["password1"])
    #             user.is_active = False
    #             user.save()
    #             nickname = request.POST["nickname"]
    #             user = User(user=user, nickname=nickname)
    #             user.save()
    
    