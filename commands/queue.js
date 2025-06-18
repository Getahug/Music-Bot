export const name = 'queue';

export function execute(message, args, client) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || queue.songs.length === 0) {
        return message.reply('❌ A fila está vazia.');
    }

    const queueMsg = queue.songs
        .map((song, index) => `${index + 1}. ${song.title}`)
        .join('\n');

    message.channel.send(`📜 **Fila de músicas:**\n${queueMsg}`);
}
 
