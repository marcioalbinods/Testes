# Escreva uma funcao que receba uma string e uma lista. A funcao deve comparar a string passada
# com os elementos da lista, tambem passada como parametro. Retorne verdadeiro se a string
# for encontrada dentro da lista, e falso, caso contrario.


def string_na_lista(texto, lista):
    for elemento in lista:
        if elemento == texto:
            return True
    return False


if __name__ == "__main__":
    frutas = ["maca", "banana", "uva"]
    print(string_na_lista("banana", frutas))  # True
    print(string_na_lista("laranja", frutas))  # False
