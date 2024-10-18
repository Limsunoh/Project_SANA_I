from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User

# [해시태그 모델] 해시태그 정보를 저장
class Hashtag(models.Model):
    name = models.CharField(max_length=50, unique=True)  # 해시태그 이름
    
    def __str__(self):
        return self.name

    def clean(self):
        # [데이터 유효성 검사] 해시태그에 띄어쓰기 또는 특수문자가 포함되지 않도록 설정
        if ' ' in self.name or any(char in self.name for char in "#@!$%^&*()"):
            raise ValidationError("해시태그는 띄어쓰기와 특수문자를 포함할 수 없습니다.")


# [상품 모델] 상품의 상세 정보
class Product(models.Model):
    CHOICE_PRODUCT = [
        ("sell","판매중"),
        ("reservation","예약중"),
        ("complete","판매완료"),
    ]
    author = models.ForeignKey(User,on_delete=models.CASCADE, related_name="author_product")  # 작성자
    title = models.CharField(max_length=50)
    content = models.TextField()
    price = models.DecimalField(max_digits=20, decimal_places=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50,choices=CHOICE_PRODUCT)
    hits = models.PositiveIntegerField(blank=True, default=0) # 조회수
    likes = models.ManyToManyField(User, related_name='like_products', blank=True) # 좋아요
    tags = models.ManyToManyField(Hashtag, related_name= "products", blank=True) # 해시태그

    def __str__(self):
        return f"User:{self.author} (Status:{self.status})"


# [이미지 모델] 상품과 연결된 이미지 정보를 저장
class Image(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )  # 해당 상품
    image_url = models.ImageField(upload_to="images/") # 이미지 경로


# [채팅방 모델] 각 채팅방을 관리
class ChatRoom(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_seller') # 판매자
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_buyer') # 구매자
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='chatrooms') # 해당 상품
    created_at = models.DateTimeField(auto_now_add=True)
    review_requested = models.BooleanField(default= False)
    status_complate = models.BooleanField(default= False)

    def __str__(self):
        return f"채팅방:{self.pk} 상품: {self.product.title} (판매자: {self.seller.username}, 구매자: {self.buyer.username})"


# [채팅 메시지 모델] 각 채팅 메시지의 내용을 관리
class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages') # 해당 채팅방
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages') # 메시지 발신자
    image = models.ImageField(upload_to="images/", blank=True, null=True) # 메시지 내 이미지 (프론트에서 추가 구현 필요)
    content = models.TextField(blank=True, null=True)  # 메시지 내용
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False) # 메시지를 읽었는지 여부

    def __str__(self):
        return f"[{self.room.id}] {self.sender.username}: {self.content[:30]}"


# [거래 상태 모델] 거래의 진행 상태 관리
class TransactionStatus(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='status') # 해당 채팅방
    is_sold = models.BooleanField(default=False) # 판매 완료 여부
    is_completed = models.BooleanField(default=False) # 거래 완료 여부
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"거래 상태 - 판매 완료: {self.is_sold}, 구매 완료: {self.is_completed}"
