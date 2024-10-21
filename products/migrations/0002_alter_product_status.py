# Generated by Django 4.2 on 2024-10-21 16:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="status",
            field=models.CharField(
                choices=[
                    ("sell", "판매중"),
                    ("reservation", "예약중"),
                    ("complete", "판매완료"),
                ],
                default="sell",
                max_length=50,
            ),
        ),
    ]
