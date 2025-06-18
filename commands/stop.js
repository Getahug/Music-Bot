 
import { getVoiceConnection } from '@discordjs/voice';

export const name = 'stop';

export function execute(message) {
    const connection = getVoiceConnection(message.guild.id);

    if (connection) {
        connection.destroy();
        message.reply('🛑 Música parada e desconectado!');
    } else {
        message.reply('❌ Não estou em um canal de voz.');
    }
}
