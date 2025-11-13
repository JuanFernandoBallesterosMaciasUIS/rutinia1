#!/bin/bash

# Instalar dependencias
pip install -r requirements.txt

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Crear migraciones si es necesario
python manage.py makemigrations --noinput
python manage.py migrate --noinput
