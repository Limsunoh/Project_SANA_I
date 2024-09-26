from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    first_name = None
    last_name = None
    nickname = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    birth = models.DateField()
    email = models.EmailField(max_length=30, unique=False, null=False, blank=False)
    created_at = models.TimeField(auto_now_add=True)
    image = models.ImageField(upload_to="images/")
    introduce = models.TextField(max_length=255)
    followings = models.ManyToManyField('self', symmetrical=False, related_name="followers")