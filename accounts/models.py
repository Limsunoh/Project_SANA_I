from django.db import models
from django.contrib.auth.models import AbstractUser
from django.templatetags.static import static

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
    created_at = models.TimeField(auto_now_add=True)  
    image = models.ImageField(upload_to="images/", blank=True, default='images/default_profile.jpg')
    introduce = models.TextField(max_length=255)  
    followings = models.ManyToManyField('self', symmetrical=False, related_name="followers", blank = True)  
    
    
    def get_profile_image_url(self):
        if self.image:
            return self.image.url
        else:
            return static('images/default_profile.jpg')  # static 경로에서 기본 이미지 반환

