import { getVoiceConnection, AudioPlayerStatus } from '@discordjs/voice';

export const name = 'pause';

export function execute(message) {
    const connection = getVoiceConnection(message.guild.id);

    if (!connection) {
        return message.reply('❌ Não estou em um canal de voz.');
    }

    const player = connection.state.subscription.player;

    if (player) {
        player.pause();
        message.reply('⏸️ Música pausada.');
    } else {
        message.reply('❌ Nenhuma música está tocando.');
    }
}
 
