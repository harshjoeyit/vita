# Generated by Django 3.1.1 on 2020-10-28 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('membership', '0001_initial'),
        ('video', '0002_auto_20201028_1010'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='allowed_membership',
            field=models.ManyToManyField(blank=True, to='membership.Membership'),
        ),
    ]