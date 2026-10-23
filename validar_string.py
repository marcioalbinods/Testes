# Escreva uma funcao para validar uma variavel string. Essa funcao recebe como parametro
# a string, o numero minimo e maximo de caracteres. Retorne verdadeiro se o tamanho da
# string estiver entre os valores maximo e minimo, e falso, caso contrario.


def validar_string(texto, minimo, maximo):
    """Retorna True se o tamanho de `texto` estiver entre `minimo` e `maximo` (inclusive)."""
    return minimo <= len(texto) <= maximo


if __name__ == "__main__":
    texto = input("Digite uma string: ")
    minimo = int(input("Numero minimo de caracteres: "))
    maximo = int(input("Numero maximo de caracteres: "))

    if validar_string(texto, minimo, maximo):
        print("Verdadeiro: a string tem um tamanho valido.")
    else:
        print("Falso: a string nao tem um tamanho valido.")
