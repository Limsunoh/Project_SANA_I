from django.views.generic import TemplateView

from back.reviews.models import CHECKLIST_OPTIONS


class ReviewCreateView(TemplateView):
    template_name = "review_create.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["product_id"] = kwargs.get("product_id")
        context["checklist_options"] = CHECKLIST_OPTIONS
        return context
