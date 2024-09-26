from django.db import models
from django.contrib.auth.models import AbstractUser
from django.templatetags.static import static

class User(AbstractUser):
    first_name = None  # 기본 User 모델의 first_name 필드를 사용하지 않도록 설정
    last_name = None  # 기본 User 모델의 last_name 필드를 사용하지 않도록 설정

    nickname = models.CharField(max_length=50)  # 닉네임 필드
    name = models.CharField(max_length=50)  # 이름 필드
    address = models.CharField(max_length=255)  # 주소 필드 (기본 주소)
    postcode = models.CharField(max_length=10, blank=True, null=True)  # 우편번호 필드
    mainaddress = models.CharField(max_length=255, blank=True, null=True)  # 상세 주소 1
    subaddress = models.CharField(max_length=255, blank=True, null=True)  # 상세 주소 2
    birth = models.DateField()  # 생년월일 필드
    email = models.EmailField(max_length=30, unique=False, null=False, blank=False)  # 이메일 필드
    created_at = models.TimeField(auto_now_add=True)  # 생성일
    image = models.ImageField(upload_to="images/", blank=True, null=True)  # 프로필 이미지 필드
    introduce = models.TextField(max_length=255)  # 소개 필드
    followings = models.ManyToManyField('self', symmetrical=False, related_name="followers")  # 팔로잉/팔로워 관계

    def get_profile_image_url(self):
        """
        프로필 이미지가 설정되어 있지 않으면 기본 이미지를 반환하는 함수
        """
        if self.image:
            return self.image.url
        else:
            # static 파일에서 기본 이미지 경로를 반환
            return static('images/default_profile.jpg')