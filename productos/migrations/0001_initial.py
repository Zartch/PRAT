# Generated by Django 2.0.1 on 2018-01-25 20:15

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Familia',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Producte',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codi', models.IntegerField(unique=True)),
                ('nom', models.CharField(max_length=150)),
                ('preu', models.FloatField()),
                ('unitat', models.CharField(choices=[('kg', 'kg'), ('u', 'unitat')], max_length=5, null=True)),
                ('descripcio', models.TextField(blank=True, default='')),
                ('date_created', models.DateField(auto_now=True)),
                ('categoria', models.ManyToManyField(to='productos.Categoria')),
                ('familia', models.ManyToManyField(to='productos.Familia')),
            ],
        ),
    ]
