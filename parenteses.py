# Faça um programa que leia uma expressão com parênteses. Usando pilhas, verifique se
# os parênteses foram abertos e fechados na ordem correta. Exemplo:
# ( ()) ok
# ()()(()()) ok
# ()) erro


def parenteses_validos(expressao):
    pilha = []
    for caractere in expressao:
        if caractere == "(":
            pilha.append(caractere)
        elif caractere == ")":
            # Fechou sem ter aberto: pilha vazia ou topo não é "("
            if not pilha or pilha[-1] != "(":
                return False
            pilha.pop()
    # Expressão correta deixa a pilha vazia
    return len(pilha) == 0


expressao = input("Digite a expressão: ")
if parenteses_validos(expressao):
    print("ok")
else:
    print("erro")
