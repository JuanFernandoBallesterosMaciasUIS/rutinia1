#!/usr/bin/env python
"""Script para generar una nueva SECRET_KEY de Django."""

from django.core.management.utils import get_random_secret_key

if __name__ == "__main__":
    new_key = get_random_secret_key()
    print("\n" + "="*80)
    print("NUEVA SECRET_KEY GENERADA")
    print("="*80)
    print(f"\n{new_key}\n")
    print("="*80)
    print("\nCopia esta clave y actualízala en tu archivo .env")
    print("Reemplaza la línea SECRET_KEY= con:")
    print(f"SECRET_KEY={new_key}")
    print("="*80 + "\n")
