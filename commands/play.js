import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } from '@discordjs/voice';
import play from 'play-dl';
import { EmbedBuilder } from 'discord.js';

export const name = 'play';

export async function execute(message, args, client) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Você precisa estar em um canal de voz!');

    const songName = args.join(' ');
    if (!songName) return message.reply('❌ Você precisa fornecer o nome da música.');

    const search = await play.search(songName, { limit: 1 });
    const video = search[0];

    if (!video) {
        return message.reply('❌ Música não encontrada.');
    }

    const song = {
        title: video.title,
        url: video.url
    };

    let queue = client.queues.get(message.guild.id);

    if (!queue) {
        queue = {
            voiceChannel,
            connection: null,
            songs: [],
            player: createAudioPlayer()
        };

        client.queues.set(message.guild.id, queue);

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        queue.connection = connection;
        connection.subscribe(queue.player);

        queue.songs.push(song);

        playSong(message.guild, queue.songs[0], client, message);
    } else {
        queue.songs.push(song);
        return message.reply(`✅ **${song.title}** foi adicionada na fila.`);
    }
}

async function playSong(guild, song, client, message) {
    const queue = client.queues.get(guild.id);

    if (!song) {
        queue.connection.destroy();
        client.queues.delete(guild.id);
        return;
    }

    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });

    queue.player.play(resource);

    queue.player.once(AudioPlayerStatus.Idle, () => {
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });

    queue.player.on('error', error => {
        console.error('Erro no player:', error);
        queue.songs.shift();
        playSong(guild, queue.songs[0], client, message);
    });

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`🎶 Tocando agora: ${song.title}`)
        .setURL(song.url)
        .setDescription('Aproveite a música!')
        .setFooter({ text: 'Bot Music feito por VOCÊ 😎' });

    message.channel.send({ embeds: [embed] });
}
