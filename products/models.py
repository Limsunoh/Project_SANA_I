from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User
from reviews.models import Review

# 해시태그
class Hashtag(models.Model):
    name= models.TextField(unique=True)
    
    def __str__(self):
        return self.name

    def clean(self):
        # 해시태그는 띄어쓰기와 특수문자를 포함할 수 없음
        if ' ' in self.name or any(char in self.name for char in "#@!$%^&*()"):
            raise ValidationError("해시태그는 띄어쓰기와 특수문자를 포함할 수 없습니다.")


class Product(models.Model):
    CHOICE_PRODUCT = [
        ("sell","판매중"),
        ("reservation","예약중"),
        ("complete","판매완료"),
    ]
    author = models.ForeignKey(User,on_delete=models.CASCADE, related_name="author_product")
    title = models.CharField(max_length=50)
    content = models.TextField()
    price = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50,choices=CHOICE_PRODUCT)
    hits = models.PositiveIntegerField(blank=True, default=0)
    likes = models.ManyToManyField(User, related_name='like_products', blank=True)
    # 해시태그 사용
    tags = models.ManyToManyField(Hashtag, related_name= "products", blank=True)
    review = models.OneToOneField(Review, related_name= "reviews", blank= True)
    
    def __str__(self):
            return f"User:{self.name} (Status:{self.status})"


class Image(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.ImageField(upload_to="images/")