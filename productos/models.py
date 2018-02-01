from django.db import models
from django.core.exceptions import ValidationError
from django.utils.html import mark_safe
from django.conf import settings



class Familia(models.Model):
    nom = models.CharField(max_length=50)

    def __str__(self):
        return self.nom

class Categoria(models.Model):
    nom = models.CharField(max_length=50)

    def __str__(self):
        return self.nom


class Producte(models.Model):

    UNITATS_MESURA = (('kg','kg'),
                      ('u', 'unitat'))

    codi = models.IntegerField(unique=True)
    nom = models.CharField(max_length=150)
    preu = models.FloatField()
    unitat = models.CharField(null=True, choices=UNITATS_MESURA, max_length=5)
    descripcio = models.TextField(blank=True, default='')
    familia = models.ManyToManyField(Familia)
    categoria = models.ManyToManyField(Categoria)
    date_created = models.DateField(auto_now=True)

    def __str__(self):
        return self.nom


