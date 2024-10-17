from django.db import models
from django.contrib.auth.models import AbstractUser
from django.templatetags.static import static
from django.db.models import Sum

class User(AbstractUser):
    first_name = None  # 기본 User 모델의 first_name 필드를 사용하지 않도록 설정
    last_name = None  # 기본 User 모델의 last_name 필드를 사용하지 않도록 설정

    nickname = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    postcode = models.CharField(max_length=10, blank=True, null=True)
    mainaddress = models.CharField(max_length=255, blank=True, null=True)
    subaddress = models.CharField(max_length=255, blank=True, null=True)
    extraaddress = models.CharField(max_length=255, blank=True, null=True)
    birth = models.DateField()
    email = models.EmailField(max_length=30, unique=False, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="images/", blank=True, default='images/default_profile.jpg')
    introduce = models.TextField(max_length=255)
    followings = models.ManyToManyField('self', symmetrical=False, related_name="followers", blank=True)

    def get_profile_image_url(self):
        if self.image:
            return self.image.url
        else:
            return static('images/default_profile.jpg')  # static 경로에서 기본 이미지 반환
    
    def __str__(self):
        return self.nickname
    
     # [리뷰 점수 합산] 사용자가 받은 리뷰의 총 점수를 계산, 기본값은 25
    def total_review_score(self):
        return self.reviews.aggregate(Sum('score'))['score__sum'] or 25
    
    # @property
    # def total_review_score(self):
    #     """
    #     총 리뷰 점수를 계산하여 기본 점수에 추가합니다.
    #     """
    #     total_score = self.reviews.aggregate(total_score=Sum('score'))['total_score'] or 0
    #     return total_score  # 총 점수 반환