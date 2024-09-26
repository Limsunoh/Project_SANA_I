from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# 해시태그
class Hashtag(models.Model):
    name = models.TextField(max_length=50, unique=True)
    
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
    # author = models.ForeignKey(get_user_model(),on_delete=models.CASCADE, related_name="author_product")
    title = models.CharField(max_length=50)
    content = models.TextField()
    price = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50,choices=CHOICE_PRODUCT)
    # 해시태그 사용
    tags = models.ManyToManyField(Hashtag, related_name="products", blank=True)
    
    def __str__(self):
        return self.name


class Image(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.ImageField(upload_to="images/")




