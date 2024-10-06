from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # 리뷰가 이미 존재하는지 체크
        product = serializer.validated_data['product']
        if Review.objects.filter(author=self.request.user, product=product).exists():
            raise serializers.ValidationError("해당 상품에 대한 리뷰는 이미 작성되었습니다.")
        # 리뷰 생성
        serializer.save(author=self.request.user)