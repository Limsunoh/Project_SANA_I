from django.db import models
from django.contrib.auth import get_user_model


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

    def __str__(self):
        return self.name


class Image(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.ImageField(upload_to="images/")


class Hashtag(models.Model):
    name = models.TextField(max_length=50)

