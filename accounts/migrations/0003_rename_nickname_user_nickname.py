# Generated by Django 4.2 on 2024-09-25 17:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_email"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="Nickname",
            new_name="nickname",
        ),
    ]
