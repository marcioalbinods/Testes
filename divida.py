# Escreva um programa que pergunte o valor inicial de uma divida e o juro mensal. Pergunte tambem o valor mensal
# que sera pago. Imprima o número de meses para que a dívida seja paga, o total pago e o total de juros pago.

divida = float(input("Valor inicial da dívida: R$ "))
juros = float(input("Juro mensal (%): "))
pagamento = float(input("Valor mensal a ser pago: R$ "))

if divida > 0 and pagamento <= divida * juros / 100:
    print("O pagamento mensal não cobre os juros: a dívida nunca será quitada.")
else:
    meses = 0
    total_pago = 0
    total_juros = 0
    while divida > 0:
        juro_mes = divida * juros / 100
        divida += juro_mes
        total_juros += juro_mes
        parcela = min(pagamento, divida)  # a última parcela paga só o que falta
        divida -= parcela
        total_pago += parcela
        meses += 1

    print(f"Número de meses para quitar a dívida: {meses}")
    print(f"Total pago: R$ {total_pago:.2f}")
    print(f"Total de juros pago: R$ {total_juros:.2f}")
