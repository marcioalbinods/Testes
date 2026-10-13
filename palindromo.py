# Escreva um programa que verifique se um numero é
# palindromo. Um numero é palindromo se continua o mesmo
# caso seus digitos sejam invertidos. Exemplos: 454, 10501

# Passo 1: ler o número digitado pelo usuário
numero = int(input("Digite um número inteiro: "))

# Passo 2: guardar uma cópia, pois vamos "destruir" o número no laço
original = numero
invertido = 0

# Passo 3: inverter os dígitos, um por vez
while numero > 0:
    digito = numero % 10                  # pega o último dígito
    invertido = invertido * 10 + digito   # coloca-o no final do invertido
    numero = numero // 10                 # remove o último dígito

# Passo 4: comparar o original com o invertido
if original == invertido:
    print(f"{original} é palíndromo")
else:
    print(f"{original} não é palíndromo")
