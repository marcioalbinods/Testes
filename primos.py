def eh_primo(numero):
    if numero < 2:
        return False
    if numero == 2:
        return True
    if numero % 2 == 0:
        return False
    for divisor in range(3, int(numero ** 0.5) + 1, 2):
        if numero % divisor == 0:
            return False
    return True


n = int(input("Quantos números primos deseja ver? "))

if n <= 0:
    print("Digite um número maior que zero!")
else:
    encontrados = 0
    candidato = 2
    while encontrados < n:
        if eh_primo(candidato):
            print(candidato)
            encontrados += 1
        candidato += 1
