import { getVoiceConnection } from '@discordjs/voice';

export const name = 'leave';

export function execute(message) {
    const connection = getVoiceConnection(message.guild.id);

    if (connection) {
        connection.destroy();
        message.reply('👋 Saí do canal de voz.');
    } else {
        message.reply('❌ Não estou em um canal de voz.');
    }
}
 
