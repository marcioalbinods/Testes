# Faça um programa que leia uma expressão com parênteses. Usando pilhas, verifique se
# os parênteses foram abertos e fechados na ordem correta. Exemplo:
# ( ()) ok
# ()()(()()) ok
# ()) erro

expressao = input("Digite a expressão: ")
pilha = []
valida = True

for caractere in expressao:
    if caractere == "(":
        pilha.append(caractere)
    elif caractere == ")":
        # Fechou sem ter aberto: pilha vazia ou topo não é "("
        if len(pilha) > 0 and pilha[-1] == "(":
            pilha.pop()
        else:
            valida = False
            break

# Expressão correta deixa a pilha vazia
if valida and len(pilha) == 0:
    print("ok")
else:
    print("erro")
