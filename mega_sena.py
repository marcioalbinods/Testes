"""Sorteia 6 números de 1 a 60 para apostar na Mega-Sena."""

import random


def sortear_mega_sena():
    """Retorna 6 números únicos de 1 a 60, em ordem crescente."""
    return sorted(random.SystemRandom().sample(range(1, 61), 6))


def main():
    while True:
        numeros = sortear_mega_sena()
        print("Seus números da Mega-Sena:", " - ".join(f"{n:02d}" for n in numeros))
        resposta = input("Sortear outra aposta? (s/n): ").strip().lower()
        if resposta != "s":
            print("Boa sorte!")
            break


if __name__ == "__main__":
    main()
