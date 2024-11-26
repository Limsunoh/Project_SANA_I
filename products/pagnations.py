from rest_framework.pagination import PageNumberPagination


class ProductPagnation(PageNumberPagination):
    page_size = 12
    max_page_size = 100
