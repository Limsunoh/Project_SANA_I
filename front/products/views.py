from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, TemplateView

from back.products.models import Product


# 상품 목록 template
class HomePageView(TemplateView):
    template_name = "home.html"


# 상품 세부 template
class ProductDetailPageView(DetailView):
    model = Product
    template_name = "product_detail.html"
    context_object_name = "product"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["images"] = self.object.images.all()  
        return context


# 상품 작성 template
class ProductCreateView(TemplateView):
    template_name = "product_create.html"


# 상품 수정 template
class ProductEditPageView(TemplateView):
    template_name = "product_edit.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = get_object_or_404(Product, pk=self.kwargs["pk"])
        context["product"] = product
        return context


# 채팅방 리스트 template
class ChatRoomListHTMLView(TemplateView):
    template_name = "chat_room_list.html"


# 채팅화면 template
class ChatRoomDetailHTMLView(TemplateView):
    template_name = "chat_room.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = get_object_or_404(Product, id=self.kwargs["product_id"])
        context["room_id"] = self.kwargs["room_id"]  
        context["product_id"] = self.kwargs[
            "product_id"
        ]  
        context["product_title"] = product.title
        return context
