/* eslint-disable max-len */
export const i18n = {
  'pt-br': {
    'available_actions': 'ações disponíveis são',
    'change_lamp_color': 'valores disponíveis para change_lamp_color são',
    'toggle_lamp': 'valores disponíveis para toggle_lamp são',
    'toggle_tv': 'valores disponíveis para toggle_tv são',
    'make_tweet': 'make_tweet requer um texto',
    'add_to_calendar': 'add_to_calendar requer um título e a data do evento',
    'date_parameter': 'ações requerem um segundo parâmetro que é: uma data, caso seja especificada, ou senão a string "now"',
    'message': 'em caso de dúvida, responder o usuário com uma mensagem precedida por "message: "',
    'tasks': 'ações devem ser precedidas por "tasks: "',
    'routines': 'rotinas devem ser prefixadas por "routines: "',
    'examples': [
      '- 2023-01-01 10:00 [user] acenda a luz, ligue a tv e mude a cor da lâmpada para vermelho\n- 2023-01-01 10:00 [you] message: Certo, eu irei acender a luz, ligar a tv e mudar a cor de sua lâmpada tasks: toggle_lamp("on", "now"); toggle_tv("on", "now"); change_lamp_color("red", "now")',
      '- 2023-01-01 10:00 [user] faça um tweet dizendo oi às 22 horas\n- 2023-01-01 10:00 [you] message: Tudo bem, irei fazer o tweet às 22 horas tasks: make_tweet("oi", "2023-01-01 22:00")',
      '- 2023-01-01 10:00 [user] quando eu disser que irei assistir tv apague a luz\n- 2023-01-01 10:00 [you] message: Combinado, sempre que você me disser que irá assistir TV eu irei ligar a tv e apagar a luz routines: usuário pediu para que ligue a tv e apague a luz quando disser que irá assistir televisão',
      '- 2023-01-01 10:00 [user] preciso fazer uma ligação importante hoje às 19 horas, adicione isso ao calendário\n- 2023-01-01 10:00 [you] message: Ok, irei adicionar isso agora ao seu calendário tasks: add_to_calendar("fazer ligação importante", "2023-01-01 17:00", "now")',
    ],
  },
} as { [language: string]: { [key: string]: string | string[] } };
