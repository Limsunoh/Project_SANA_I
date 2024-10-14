# Generated by Django 4.2 on 2024-10-14 17:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("reviews", "0001_initial"),
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="reviews",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="product_reviews",
                to="reviews.review",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="tags",
            field=models.ManyToManyField(
                blank=True, related_name="products", to="products.hashtag"
            ),
        ),
        migrations.AddField(
            model_name="image",
            name="product",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="images",
                to="products.product",
            ),
        ),
        migrations.AddField(
            model_name="chatroom",
            name="buyer",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="chatrooms_as_buyer",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="chatroom",
            name="product",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="chatrooms",
                to="products.product",
            ),
        ),
        migrations.AddField(
            model_name="chatroom",
            name="seller",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="chatrooms_as_seller",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="chatmessage",
            name="room",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="messages",
                to="products.chatroom",
            ),
        ),
        migrations.AddField(
            model_name="chatmessage",
            name="sender",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sent_messages",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
