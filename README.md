# Jump Loader 🏀

## Sobre o Projeto
O **Jump Loader** é um dispositivo vestível (*wearable*) de baixo custo voltado para o monitoramento biomecânico e a prevenção de lesões articulares no basquete de alto rendimento[cite: 4]. Desenvolvido como Trabalho de Conclusão de Curso em Engenharia da Computação na Faculdade Impacta Tecnologia por Enzo Barrionovo Ferigatto, Gustavo Diniz Nambu e Pedro Neri Laino[cite: 4]. 

O projeto visa democratizar o acesso a métricas de *Load Management*, substituindo sistemas comerciais de alto custo por uma arquitetura acessível e eficiente, capaz de monitorar a carga mecânica externa sofrida pelos joelhos dos atletas durante ciclos repetitivos de saltos e aterrissagens[cite: 4].

## Arquitetura de Hardware
O sistema foi projetado com foco em miniaturização e alocado na região lombar do atleta[cite: 4], utilizando os seguintes componentes:
*   **Microcontrolador:** ESP32-C3 Super Mini (Processamento na borda e comunicação sem fio).
*   **Sensoriamento:** IMU MPU-9250 (Acelerômetro e Giroscópio conectados via barramento I2C)[cite: 4].
*   **Gerenciamento de Energia:** Bateria Li-Po integrada a um módulo de carregamento TP4056.

## Processamento Digital de Sinais (PDS)
Para extrair os dados limpos em meio ao ambiente ruidoso da quadra de basquete, o sistema utiliza técnicas avançadas de processamento embarcado (*Edge Computing*)[cite: 4]:
*   **Filtragem de Ruído:** Aplicação de um filtro passa-baixa Butterworth de 4ª ordem (corte de 10 Hz) para atenuar vibrações mecânicas espúrias e isolar os picos reais de impacto[cite: 4].
*   **Máquina de Estados de Salto:** Algoritmo que segmenta a física do movimento em fases: Impulsão, Voo livre e Aterrissagem, exigindo de 0,6 a 1,2 segundos de voo para validação[cite: 4].
*   **Métrica de Assimetria (Risco de Lesão):** Fusão de sensores (acelerômetro + giroscópio) para medir a inclinação pélvica no milissegundo do impacto; aterrissagens que ultrapassam a tolerância de 12 graus no eixo *Roll* são sinalizadas como risco de sobrecarga unilateral[cite: 4].

## Como Utilizar o Protótipo
1.  **Hardware:** Clone o repositório e faça o upload do código `JumpLoader_BLE.ino` para o ESP32-C3 utilizando a Arduino IDE.
2.  **Energia:** Ligue o interruptor do sistema; o módulo iniciará a varredura e a transmissão via Bluetooth Low Energy (BLE).
3.  **Recepção (Desktop):** Execute o script `receptor_ble.py` utilizando Python (requer a biblioteca `bleak`). O terminal exibirá em tempo real os eixos X, Y e Z da Força G.
