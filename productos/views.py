from django.shortcuts import render
from .models import Producte, Familia, Categoria
from django.shortcuts import render
from django.views.generic.base import View
from wkhtmltopdf.views import PDFTemplateResponse
import os
from django.conf import settings
from productos.utils import extract_request_variables, link_callback
from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from wkhtmltopdf.views import PDFTemplateView
import logging
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist

def producteView(request):
    fam = request.GET.get('f') or None
    context = get_productes_context(fam)

    return render(request, "llistatproductes.html", context)


def headerview(request):
    return render(request, "header.html", {})


def render_pdf(request):

    fam = request.GET.get('f') or None
    data = render_to_string("llistatproductes.html",get_productes_context(fam))

    template_path = 'pdf/user_printer.html'
    context = {'data': data }

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="report.pdf"'

    html = render_to_string(template_path,context)

    pisaStatus = pisa.CreatePDF(html, dest=response, link_callback=link_callback)
    if pisaStatus.err:
        return HttpResponse('We had some errors with code %s <pre>%s</pre>' % (pisaStatus.err, html))
    return response


def get_productes_context(familia = None):

    if familia:
        familia = Familia.objects.filter(nom=familia)
    else:
        familia = Familia.objects.all()

    productes = {}

    cat = Categoria.objects.all()

    for f in familia:
         for c in cat:
            productes_a_categoria = Producte.objects.filter(familia=f, categoria=c)
            if productes_a_categoria.count() > 0:
                productes[c] = productes_a_categoria
    context =  {'productes':productes}

    return context


def upload_csv(request):
    data = {}

    try:
        csv_file = request.FILES["csv_file"]
        import csv

        def decode_utf8(input_iterator):
            for l in input_iterator:
                yield l.decode('utf-8')

        # reader = csv.DictReader(decode_utf8(request.FILES['csv_file']), delimiter=';')
        # reader = csv.DictReader(request.FILES['csv_file'])

        import chardet

        # Detectar la codificación del archivo
        file_content = request.FILES['csv_file'].read()
        detected_encoding = chardet.detect(file_content)['encoding']
        print(detected_encoding)

        # Decodificar el contenido del archivo
        decoded_content = file_content.decode(detected_encoding)

        # Leer el archivo decodificado como un archivo StringIO
        from io import StringIO
        file_io = StringIO(decoded_content)

        reader = csv.DictReader(file_io, delimiter=';')


        for data_dict in reader:
            print(data_dict)
            # Recuperamos el producto por el codigo, si no lo creamos
            try:
                prod = Producte.objects.get(codi=data_dict["CODI"])
                # actualitzem les dades:
                prod.preu = data_dict["PREU"]
                prod.unitat = data_dict["unitatMesura"]
                prod.descripcio = data_dict["Descripcio"]

            except ObjectDoesNotExist:
                prod = Producte.objects.create(codi=data_dict["CODI"],
                                               nom=data_dict["NOM"],
                                               preu=data_dict["PREU"],
                                               unitat=data_dict["unitatMesura"],
                                               descripcio=data_dict["Descripcio"])

            # controlem les families y les categories
            families = data_dict["FAMILIA"].split(",")
            for familia in families:
                # comprobem si la familia existeix y si no la creem:
                fam, created = Familia.objects.get_or_create(nom=familia)
                if not fam in prod.familia.all():
                    prod.familia.add(fam)

            categories = data_dict["CATEGORIA"].split(",")
            for categoria in categories:
                cat, created = Categoria.objects.get_or_create(nom=categoria)
                if not cat in prod.categoria.all():
                    prod.categoria.add(cat)

            prod.save()
            print(prod)


        file_data = csv_file.read().decode("utf-8")

        lines = file_data.split("\n")
        # loop over the lines and save them in db. If error , store as string and then display
        for line in lines:
            print(line)
            fields = line.split(";")
            data_dict = {}
            #saltar la primera linea si es el titulo o si son lineas vacias:
            if str(fields[0]) == 'CODI' or len(fields) < 7:
                continue
            data_dict["codi"] = fields[0].upper()
            data_dict["nom"] = fields[1].upper()


            data_dict["preu"] = float(fields[2].replace(',','.'))
            data_dict["familia"] = fields[3].upper()
            data_dict["categoria"] = fields[4].upper()
            data_dict["unitat_mesura"] = fields[5]
            data_dict["descripcio"] = fields[6]

            #Recuperamos el producto por el codigo, si no lo creamos
            try:
                prod = Producte.objects.get(codi = data_dict["codi"])
                #actualitzem les dades:
                prod.preu = data_dict["preu"]
                prod.unitat = data_dict["unitat_mesura"]
                prod.descripcio = data_dict["descripcio"]

            except ObjectDoesNotExist:
                prod = Producte.objects.create(codi = data_dict["codi"],
                                               nom = data_dict["nom"],
                                               preu = data_dict["preu"],
                                               unitat = data_dict["unitat_mesura"],
                                               descripcio = data_dict["descripcio"])


            #controlem les families y les categories
            families = data_dict["familia"].split(",")
            for familia in families:
                #comprobem si la familia existeix y si no la creem:
                fam, created = Familia.objects.get_or_create(nom = familia)
                if not fam in prod.familia.all():
                    prod.familia.add(fam)

            categories = data_dict["categoria"].split(",")
            for categoria in categories:
                cat, created = Categoria.objects.get_or_create(nom = categoria)
                if not cat in prod.categoria.all():
                    prod.categoria.add(cat)

            prod.save()
            print(prod)

    except Exception as e:
        logging.getLogger("error_logger").error("Unable to upload file. " + repr(e))
        data['errors'] = e

    return render(request, "upload_csv.html", data)