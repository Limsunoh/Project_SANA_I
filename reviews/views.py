from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer

# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # 점수 계산 후 저장
        serializer.save(author=self.request.user)

# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]