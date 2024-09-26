from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, UpdateAPIView

from .models import Product, Image, Hashtag
from .serializers import (
    ProductListSerializer,
    ProductCreateSerializer,
    ProductDetailSerializer,
)
from .pagnations import ProductPagnation


class ProductListAPIView(ListCreateAPIView):
    pagination_class = ProductPagnation
    serializer_class = ProductListSerializer

    def get_queryset(self):
        search = self.request.query_params.get("search")
        order_by = self.request.query_params.get("order_by")
        queryset = Product.objects.all()

        # 검색
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )

        # 정렬
        if order_by == "likes":
            queryset = queryset.annotate(likes_count=Count("likes")).order_by(
                "-likes_count"
            )
        else:  # 기본값은 최신순
            queryset = queryset.order_by("-created_at")

        return queryset

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.serializer_class = ProductCreateSerializer
        images = request.FILES.getlist("images")
        if not images:  # 이미지 key error 처리
            return Response({"ERROR": "Image file is required."}, status=400)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):

        images = self.request.FILES.getlist("images")
        tags = self.request.data.getlist("tags")
        product = serializer.save()
        for image in images:
            Image.objects.create(product=product, image_url=image)
        for tag in tags:
            print(tag)
            hashtag, created = Hashtag.objects.get_or_create(
                name=tag
            )  # 해시태그가 존재하지 않으면 생성
            product.tags.add(hashtag)  # 제품에 해시태그 추가


class ProductDetailAPIView(UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data, status=200)

    def perform_update(self, serializer):
        images_data = self.request.FILES.getlist("images")
        tags = self.request.data.getlist("tags")
        instance = serializer.instance  # 현재 수정 중인 객체

        # 요청에 이미지가 포함된 경우
        if images_data:
            # 기존 이미지 삭제
            instance.images.all().delete()
            for image_data in images_data:
                Image.objects.create(product=instance, image_url=image_data)

        if tags is not None:  # 새로운 해시태그가 제공된 경우
            # 기존 해시태그를 삭제하고 새로운 해시태그를 추가
            instance.tags.clear()  # 기존 해시태그 삭제
            for tag in tags:
                hashtag, created = Hashtag.objects.get_or_create(name=tag)
                instance.tags.add(hashtag)  # 제품에 해시태그 추가

        serializer.save()

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=204)


# class LikeAPIView(APIView):

#     def post(self, request, pk):
#         product = get_object_or_404(Product, pk=pk)

#         if request.user in product.likes.all():
#             product.like.remove(request.user)
#             return Response("찜하기 취소했습니다.", status=200)

#         product.likes.add(request.user)
#         return Response("찜하기 했습니다.", status=200)
