export const name = 'loop';

export function execute(message, args, client) {
    const queue = client.queues.get(message.guild.id);

    if (!queue) {
        return message.reply('❌ Nenhuma música tocando.');
    }

    queue.loop = !queue.loop;

    if (queue.loop) {
        message.reply('🔁 Loop ativado!');
    } else {
        message.reply('⏹️ Loop desativado!');
    }
}
 
