export const name = 'skip';

export function execute(message, args, client) {
    const queue = client.queues.get(message.guild.id);

    if (!queue) {
        return message.reply('❌ Não há nenhuma música sendo tocada.');
    }

    queue.player.stop();
    message.reply('⏭️ Música pulada!');
}
 
