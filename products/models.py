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
    price = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50,choices=CHOICE_PRODUCT)
    hits = models.PositiveIntegerField(blank=True, default=0)
    likes = models.ManyToManyField(User, related_name='like_products', blank=True)
    # 해시태그 사용
    tags = models.ManyToManyField(Hashtag, related_name= "products", blank=True)
    reviews = models.ForeignKey(Review, on_delete=models.CASCADE, related_name= "product_reviews", null= True, blank= True)
    
    def __str__(self):
        return f"User:{self.author} (Status:{self.status})"


class Image(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.ImageField(upload_to="images/")

# 각 채팅방을 관리하는 모델
class ChatRoom(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_seller')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_buyer')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='chatrooms')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"채팅방: 상품: {self.product.title} (판매자: {self.seller.username}, 구매자: {self.buyer.username})"

# 채팅 메시지 모델: 각 메시지의 내용을 관리
class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    image = models.ImageField(upload_to="images/", blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # 메시지를 읽었는지 여부

    def __str__(self):
        return f"[{self.room.id}] {self.sender.username}: {self.content[:30]}"

# 거래 상태 모델: '판매 완료', '구매 완료' 등 상태를 관리
class TransactionStatus(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='status')
    is_sold = models.BooleanField(default=False)  # 판매 완료 여부
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"거래 상태 - 판매 완료: {self.is_sold}, 구매 완료: {self.is_completed}"
