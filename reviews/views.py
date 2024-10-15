from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, serializers
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product

# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        product_id = self.kwargs.get('product_id')

        if user_id:  # 유저 프로필 페이지에서 작성한 리뷰 조회
            return Review.objects.filter(author__id=user_id)
        elif product_id:  # 제품 상세 페이지에서 리뷰 조회
            return Review.objects.filter(product__id=product_id)
        else:  # 빈 쿼리셋 반환
            return Review.objects.none()

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')

        if product_id:
            product = get_object_or_404(Product, pk=product_id)
            serializer.save(author=self.request.user, product=product)
        else:
            raise serializers.ValidationError("제품 ID가 필요합니다.")

# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            print(f"Deleting review with id: {instance.id}")  # 삭제 전 로그 출력
        self.perform_destroy(instance)
        return Response({"message": "리뷰가 성공적으로 삭제되었습니다."}, status=200)
