import { getVoiceConnection } from '@discordjs/voice';

export const name = 'clear';

export function execute(message, args, client) {
    const queue = client.queues.get(message.guild.id);

    if (!queue) {
        return message.reply('❌ Não há nenhuma música na fila.');
    }

    queue.songs = [];
    queue.player.stop();

    message.reply('🗑️ Fila limpa e música parada.');
}
 
