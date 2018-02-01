from django.contrib import admin
from productos.models import *

class producteAdmin(admin.ModelAdmin):
    list_display = ('codi','nom','preu','unitat' )
    search_fields = ['codi','familia','categoria','nom','preu','tipologia','area']
    list_filter = ['familia', 'categoria']

admin.site.register(Producte, producteAdmin)


class familiaAdmin(admin.ModelAdmin):
    list_display = ('pk','nom')

admin.site.register(Familia, familiaAdmin)


class categoriaAdmin(admin.ModelAdmin):
    list_display = ('pk','nom')

admin.site.register(Categoria, categoriaAdmin)
