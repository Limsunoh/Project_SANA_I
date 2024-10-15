from django.db import models
from django.contrib.auth.models import AbstractUser
from django.templatetags.static import static
from django.db.models import Sum

# [사용자 모델] 기본 User 모델을 확장하여 사용자 정보를 정의
class User(AbstractUser):
    first_name = None  # [필드 비활성화] 기본 User 모델의 first_name 필드 사용 안함
    last_name = None  # [필드 비활성화] 기본 User 모델의 last_name 필드 사용 안함

    # [사용자 정보 필드] 닉네임, 이름, 주소 등 사용자의 상세 정보를 저장
    nickname = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    postcode = models.CharField(max_length=10, blank=True, null=True)
    mainaddress = models.CharField(max_length=255, blank=True, null=True)
    subaddress = models.CharField(max_length=255, blank=True, null=True)
    extraaddress = models.CharField(max_length=255, blank=True, null=True)
    birth = models.DateField()
    email = models.EmailField(max_length=30, unique=False, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)  # 생성 일자
    image = models.ImageField(
        upload_to="images/", blank=True, default="images/default_profile.jpg"
    )
    introduce = models.TextField(max_length=255)

    # [팔로우 기능] 비대칭 관계를 가지는 사용자 간 팔로우 관계 정의
    followings = models.ManyToManyField(
        "self", symmetrical=False, related_name="followers", blank=True
    )

    # [프로필 이미지 URL 반환] 프로필 이미지가 있는 경우 해당 URL을 반환, 없으면 기본 이미지 반환
    def get_profile_image_url(self):
        if self.image:  # 프로필 이미지가 있을 시 해당 이미지 url 반환
            return self.image.url
        else:  # 프로필 이미지가 없을 시 static 내 default_image 반환
            return static("images/default_profile.jpg")

    # [리뷰 점수 합산] 사용자가 받은 리뷰의 총 점수를 계산, 기본값은 25
    def total_review_score(self):
        return self.reviews.aggregate(Sum('score'))['score__sum'] or 25
