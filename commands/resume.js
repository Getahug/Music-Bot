import { getVoiceConnection } from '@discordjs/voice';

export const name = 'resume';

export function execute(message) {
    const connection = getVoiceConnection(message.guild.id);

    if (!connection) {
        return message.reply('❌ Não estou em um canal de voz.');
    }

    const player = connection.state.subscription.player;

    if (player) {
        player.unpause();
        message.reply('▶️ Música retomada.');
    } else {
        message.reply('❌ Nenhuma música para continuar.');
    }
}
 
