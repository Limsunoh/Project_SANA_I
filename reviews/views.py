from rest_framework import generics, permissions, serializers
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product
from django.shortcuts import get_object_or_404


# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    # queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        product_id = self.kwargs.get('product_id')

        if user_id:
            # 유저 프로필 페이지에서 해당 유저가 작성한 리뷰 조회
            return Review.objects.filter(author__id=user_id)
        elif product_id:
            # 제품 상세 페이지에서 해당 제품에 대한 리뷰 조회
            return Review.objects.filter(products__id=product_id)
        else:
            return Review.objects.none()  # 기본적으로 빈 쿼리셋 반환

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')

        if product_id:
            product = get_object_or_404(Product, pk=product_id)
            serializer.save(author=self.request.user, products=product)
        else:
            raise serializers.ValidationError("제품 ID가 필요합니다.")
        
        # user_pk = self.kwargs['user_id'] 
        # return Review.objects.filter(user__pk= user_pk)
        # 점수 계산 후 저장
        # serializer.save(author=self.request.user)

# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    # def destroy(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     if instance:
    #         print(f"Deleting review with id: {instance.id}") 
    #     self.perform_destroy(instance)
    #     return Response({"message": "리뷰가 성공적으로 삭제되었습니다."}, status=200)