from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.Hashtag)
admin.site.register(models.Product)
admin.site.register(models.Image)
admin.site.register(models.ChatRoom)
admin.site.register(models.ChatMessage)
admin.site.register(models.TransactionStatus)